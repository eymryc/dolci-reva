<?php

namespace App\Services;

use App\Models\Booking;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;

class AvailabilityService
{
    /**
     * Vérifier la disponibilité d'un élément bookable (toute réservation non annulée).
     */
    public function checkAvailability($bookable, Carbon $startDate, Carbon $endDate): bool
    {
        return !$this->hasConflict(
            get_class($bookable),
            (int) $bookable->id,
            $startDate->toDateTimeString(),
            $endDate->toDateTimeString()
        );
    }

    /**
     * Conflit de dates pour un bookable.
     * Les unpaid hors TTL ne bloquent plus l'inventaire.
     */
    public function hasConflict(string $bookableType, int $bookableId, string $startDate, string $endDate): bool
    {
        return $this->activeInventoryQuery()
            ->where('bookable_type', $bookableType)
            ->where('bookable_id', $bookableId)
            ->where(function ($query) use ($startDate, $endDate) {
                $this->applyDateOverlap($query, $startDate, $endDate);
            })
            ->exists();
    }

    /**
     * Conflit pour une chambre d'hôtel.
     */
    public function hasRoomConflict(int $hotelRoomId, string $startDate, string $endDate): bool
    {
        return $this->activeInventoryQuery()
            ->where('hotel_room_id', $hotelRoomId)
            ->where(function ($query) use ($startDate, $endDate) {
                $this->applyDateOverlap($query, $startDate, $endDate);
            })
            ->exists();
    }

    /**
     * Query des bookings qui occupent encore l'inventaire.
     */
    public function activeInventoryQuery(): Builder
    {
        $holdMinutes = max(1, (int) config('booking.unpaid_hold_minutes', 30));
        $holdCutoff = now()->subMinutes($holdMinutes);

        return Booking::query()
            ->where('status', '!=', 'ANNULE')
            ->where(function ($q) use ($holdCutoff) {
                $q->where('payment_status', 'PAYE')
                    ->orWhere('created_at', '>', $holdCutoff);
            });
    }

    public function unpaidHoldCutoff(): Carbon
    {
        return now()->subMinutes(max(1, (int) config('booking.unpaid_hold_minutes', 30)));
    }

    /**
     * Obtenir les créneaux disponibles pour une période
     */
    public function getAvailableSlots($bookable, Carbon $startDate, Carbon $endDate): array
    {
        $bookings = $this->activeInventoryQuery()
            ->where('bookable_type', get_class($bookable))
            ->where('bookable_id', $bookable->id)
            ->where(function ($query) use ($startDate, $endDate) {
                $this->applyDateOverlap(
                    $query,
                    $startDate->toDateTimeString(),
                    $endDate->toDateTimeString()
                );
            })
            ->orderBy('start_date')
            ->get();

        $availableSlots = [];
        $currentDate = $startDate->copy()->startOfDay();
        $end = $endDate->copy()->startOfDay();

        while ($currentDate->lte($end)) {
            $dayStart = $currentDate->copy()->startOfDay();
            $dayEnd = $currentDate->copy()->endOfDay();

            $dayBookings = $bookings->filter(function ($booking) use ($dayStart, $dayEnd) {
                $bStart = Carbon::parse($booking->start_date);
                $bEnd = Carbon::parse($booking->end_date);
                return $bStart->lte($dayEnd) && $bEnd->gte($dayStart);
            });

            if ($dayBookings->isEmpty()) {
                $availableSlots[] = [
                    'date' => $currentDate->format('Y-m-d'),
                    'available' => true,
                    'bookings' => [],
                ];
            } else {
                $availableSlots[] = [
                    'date' => $currentDate->format('Y-m-d'),
                    'available' => false,
                    'bookings' => $dayBookings->map(function ($booking) {
                        return [
                            'start_time' => Carbon::parse($booking->start_date)->format('H:i'),
                            'end_time' => Carbon::parse($booking->end_date)->format('H:i'),
                            'status' => $booking->status,
                        ];
                    })->values()->toArray(),
                ];
            }

            $currentDate->addDay();
        }

        return $availableSlots;
    }

    /**
     * Vérifier la capacité d'accueil
     */
    public function checkCapacity($bookable, int $guests): bool
    {
        if (isset($bookable->max_guests) && $bookable->max_guests !== null) {
            return $guests <= (int) $bookable->max_guests;
        }

        if (isset($bookable->capacity) && $bookable->capacity !== null) {
            return $guests <= (int) $bookable->capacity;
        }

        return true;
    }

    private function applyDateOverlap($query, string $startDate, string $endDate): void
    {
        $query->whereBetween('start_date', [$startDate, $endDate])
            ->orWhereBetween('end_date', [$startDate, $endDate])
            ->orWhere(function ($q) use ($startDate, $endDate) {
                $q->where('start_date', '<=', $startDate)
                    ->where('end_date', '>=', $endDate);
            });
    }
}
