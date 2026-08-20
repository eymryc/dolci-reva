<?php

namespace App\Services;

use Carbon\Carbon;
use App\Models\Hotel;
use App\Models\Lounge;
use App\Models\HotelRoom;
use App\Models\Residence;
use App\Models\NightClub;
use App\Models\Restaurant;
use App\Models\LoungeTable;
use App\Models\NightClubArea;
use App\Models\RestaurantTable;
use InvalidArgumentException;

class PricingService
{
    /**
     * Prix total nuitée (sans frais de service) — résidence / chambre.
     */
    public function calculateNightlyTotal($bookable, Carbon $startDate, Carbon $endDate): float
    {
        $basePrice = $this->getBasePrice($bookable);
        $nights = max(1, $startDate->diffInDays($endDate));

        return (float) ($basePrice * $nights);
    }

    /**
     * Devis serveur — source de vérité pour FO et Paystack.
     *
     * @return array{total: float, currency: string, nights?: int, unit_price?: float, lines: array<int, array{label: string, amount: float}>, cancellation: array}
     */
    public function quote(string $type, int $id, array $data): array
    {
        return match ($type) {
            'residence' => $this->quoteResidence($id, $data),
            'hotel' => $this->quoteHotel($id, $data),
            'restaurant' => $this->quoteRestaurant($id, $data),
            'lounge', 'bar' => $this->quoteLounge($id, $data),
            'night_club', 'night-club' => $this->quoteNightClub($id, $data),
            default => throw new InvalidArgumentException("Type de devis inconnu: {$type}"),
        };
    }

    public function quoteResidence(int $residenceId, array $data): array
    {
        $residence = Residence::findOrFail($residenceId);
        $start = Carbon::parse($data['start_date']);
        $end = Carbon::parse($data['end_date']);
        $nights = max(1, $start->diffInDays($end));
        $unit = (float) $residence->price;
        $total = $unit * $nights;

        return $this->buildQuote($total, [
            ['label' => sprintf('%s FCFA × %d nuit%s', number_format($unit, 0, '', ' '), $nights, $nights > 1 ? 's' : ''), 'amount' => $total],
            ['label' => 'Frais de service', 'amount' => 0],
        ], 'residence', ['nights' => $nights, 'unit_price' => $unit]);
    }

    public function quoteHotel(int $hotelId, array $data): array
    {
        $room = HotelRoom::where('hotel_id', $hotelId)->findOrFail($data['hotel_room_id']);
        $start = Carbon::parse($data['start_date']);
        $end = Carbon::parse($data['end_date']);
        $nights = max(1, $start->diffInDays($end));
        $unit = (float) $room->price;
        $total = $unit * $nights;

        return $this->buildQuote($total, [
            ['label' => sprintf('%s FCFA × %d nuit%s', number_format($unit, 0, '', ' '), $nights, $nights > 1 ? 's' : ''), 'amount' => $total],
            ['label' => 'Frais de service', 'amount' => 0],
        ], 'hotel', ['nights' => $nights, 'unit_price' => $unit, 'hotel_room_id' => $room->id]);
    }

    public function quoteRestaurant(int $restaurantId, array $data): array
    {
        Restaurant::findOrFail($restaurantId);
        $guests = max(1, (int) ($data['guests'] ?? 1));
        $cover = (float) config('booking.restaurant_cover_fee_per_guest');
        $total = $cover * $guests;

        return $this->buildQuote($total, [
            ['label' => sprintf('Couvert %s FCFA × %d', number_format($cover, 0, '', ' '), $guests), 'amount' => $total],
            ['label' => 'Frais de service', 'amount' => 0],
        ], 'restaurant', ['unit_price' => $cover, 'guests' => $guests]);
    }

    public function quoteLounge(int $loungeId, array $data): array
    {
        Lounge::findOrFail($loungeId);
        $guests = max(1, (int) ($data['guests'] ?? 1));
        $tableIds = $data['lounge_table_ids'] ?? [];
        $lines = [];
        $total = 0.0;

        if (!empty($tableIds)) {
            $tables = LoungeTable::where('lounge_id', $loungeId)->whereIn('id', $tableIds)->get();
            foreach ($tables as $table) {
                $spend = (float) ($table->minimum_spend ?? 0);
                if ($spend > 0) {
                    $lines[] = ['label' => "Table {$table->table_number} (min.)", 'amount' => $spend];
                    $total += $spend;
                }
            }
        }

        if ($total <= 0) {
            $fallback = (float) config('booking.lounge_fallback_fee_per_guest');
            $total = $fallback * $guests;
            $lines[] = ['label' => sprintf('Forfait %s FCFA × %d', number_format($fallback, 0, '', ' '), $guests), 'amount' => $total];
        }

        $lines[] = ['label' => 'Frais de service', 'amount' => 0];

        return $this->buildQuote($total, $lines, 'lounge', ['guests' => $guests]);
    }

    public function quoteNightClub(int $nightClubId, array $data): array
    {
        NightClub::findOrFail($nightClubId);
        $guests = max(1, (int) ($data['guests'] ?? 1));
        $areaIds = $data['night_club_area_ids'] ?? [];
        $lines = [];
        $total = 0.0;

        if (!empty($areaIds)) {
            $areas = NightClubArea::where('night_club_id', $nightClubId)->whereIn('id', $areaIds)->get();
            foreach ($areas as $area) {
                $amount = (float) ($area->minimum_spend ?? 0) + (float) ($area->table_fee ?? 0);
                if ($amount > 0) {
                    $lines[] = ['label' => $area->area_name, 'amount' => $amount];
                    $total += $amount;
                }
            }
        }

        if ($total <= 0) {
            $fallback = (float) config('booking.night_club_fallback_fee_per_guest');
            $total = $fallback * $guests;
            $lines[] = ['label' => sprintf('Forfait %s FCFA × %d', number_format($fallback, 0, '', ' '), $guests), 'amount' => $total];
        }

        $lines[] = ['label' => 'Frais de service', 'amount' => 0];

        return $this->buildQuote($total, $lines, 'night_club', ['guests' => $guests]);
    }

    /**
     * Politique d'annulation pour une verticale.
     */
    public function cancellationPolicy(string $vertical): array
    {
        $key = match ($vertical) {
            'App\\Models\\Residence', 'residence' => 'residence',
            'App\\Models\\Hotel', 'hotel' => 'hotel',
            'App\\Models\\Restaurant', 'restaurant' => 'restaurant',
            'App\\Models\\Lounge', 'lounge', 'bar' => 'lounge',
            'App\\Models\\NightClub', 'night_club', 'night-club' => 'night_club',
            default => 'residence',
        };

        $policy = config("booking.cancellation.{$key}", [
            'free_cancel_hours' => 24,
            'late_refund_percent' => 0,
        ]);

        $graceMinutes = max(0, (int) config('booking.post_booking_free_cancel_minutes', 120));

        return [
            'vertical' => $key,
            'free_cancel_hours' => (int) $policy['free_cancel_hours'],
            'late_refund_percent' => (int) $policy['late_refund_percent'],
            'post_booking_grace_minutes' => $graceMinutes,
            'summary' => sprintf(
                'Annulation gratuite jusqu\'à %dh avant le début%s. Ensuite, remboursement de %d%%.',
                (int) $policy['free_cancel_hours'],
                $graceMinutes > 0
                    ? sprintf(', ou dans les %d min suivant la réservation', $graceMinutes)
                    : '',
                (int) $policy['late_refund_percent']
            ),
        ];
    }

    private function buildQuote(float $total, array $lines, string $vertical, array $extra = []): array
    {
        return array_merge([
            'total' => round($total, 2),
            'currency' => config('booking.currency', 'XOF'),
            'lines' => $lines,
            'cancellation' => $this->cancellationPolicy($vertical),
        ], $extra);
    }

    public function calculateTotalPrice($bookable, Carbon $startDate, Carbon $endDate, int $guests = 1)
    {
        $basePrice = $this->getBasePrice($bookable);
        $duration = $this->calculateDuration($bookable, $startDate, $endDate);
        $totalPrice = $basePrice * max(1, $duration);
        $serviceFee = $this->calculateServiceFee($totalPrice);

        return [
            'base_price' => $basePrice,
            'duration' => max(1, $duration),
            'subtotal' => $totalPrice,
            'service_fee' => $serviceFee,
            'total_price' => $totalPrice + $serviceFee,
            'guests' => $guests,
        ];
    }

    public function calculateCommissions($totalPrice, $commissionRate = 0.1)
    {
        $commissionAmount = $totalPrice * $commissionRate;
        $ownerAmount = $totalPrice - $commissionAmount;

        return [
            'total_price' => $totalPrice,
            'commission_rate' => $commissionRate,
            'commission_amount' => round($commissionAmount, 2),
            'owner_amount' => round($ownerAmount, 2),
        ];
    }

    private function getBasePrice($bookable): float
    {
        if (isset($bookable->price)) {
            return (float) $bookable->price;
        }

        if (isset($bookable->price_per_person)) {
            return (float) $bookable->price_per_person;
        }

        return 0;
    }

    private function calculateDuration($bookable, Carbon $startDate, Carbon $endDate): int
    {
        $className = class_basename($bookable);

        return match ($className) {
            'Residence', 'HotelRoom' => $startDate->diffInDays($endDate),
            default => $startDate->diffInDays($endDate),
        };
    }

    private function calculateServiceFee($totalPrice): float
    {
        $serviceFee = $totalPrice * 0.05;

        return max(500, min(25000, $serviceFee));
    }
}
