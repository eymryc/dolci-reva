<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'customer_id' => $this->customer_id,
            'owner_id' => $this->owner_id,
            'bookable_type' => $this->bookable_type,
            'bookable_id' => $this->bookable_id,
            'start_date' => $this->start_date,
            'end_date' => $this->end_date,
            'guests' => $this->guests,
            'booking_reference' => $this->booking_reference,
            'total_price' => $this->total_price,
            'commission_amount' => $this->commission_amount,
            'owner_amount' => $this->owner_amount,
            'credit_applied' => (float) ($this->credit_applied ?? 0),
            'amount_due' => round(max(0, (float) $this->total_price - (float) ($this->credit_applied ?? 0)), 2),
            'refund_estimate' => $this->buildRefundEstimate(),
            'status' => $this->status,
            'payment_status' => $this->payment_status,
            'funds_released_at' => $this->funds_released_at,
            'escrow_status' => $this->escrowStatus(),
            'cancellation_policy' => app(\App\Services\PricingService::class)
                ->cancellationPolicy($this->bookable_type ?? 'residence'),
            'cancellation_window' => $this->buildCancellationWindow(),
            'notes' => $this->notes,
            'cancellation_reason' => $this->cancellation_reason,
            'cancelled_at' => $this->cancelled_at,
            'confirmed_at' => $this->confirmed_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            'customer' => $this->whenLoaded('customer', function () {
                return $this->customer;
            }),
            'owner' => $this->whenLoaded('owner', function () {
                return $this->owner;
            }),
            'bookable' => $this->whenLoaded('bookable', function () {
                return $this->serializeBookable($this->bookable);
            }),
            'hotel_room_id' => $this->hotel_room_id,
            'hotel_room' => $this->whenLoaded('hotelRoom', function () {
                if (!$this->hotelRoom) {
                    return null;
                }
                $room = $this->hotelRoom;
                $room->loadMissing('media');

                return [
                    'id' => $room->id,
                    'name' => $room->name,
                    'room_number' => $room->room_number,
                    'type' => $room->type,
                    'standing' => $room->standing,
                    'max_guests' => $room->max_guests,
                    'price' => $room->price,
                    'main_image_url' => $room->main_image_url,
                    'main_image_thumb_url' => $room->main_image_thumb_url,
                ];
            }),

            'restaurant_tables' => $this->whenLoaded('restaurantTables', function () {
                return $this->restaurantTables->map(function ($table) {
                    return [
                        'id' => $table->id,
                        'table_number' => $table->table_number,
                        'capacity' => $table->capacity,
                        'location' => $table->location,
                        'table_type' => $table->table_type,
                    ];
                });
            }),
            'lounge_tables' => $this->whenLoaded('loungeTables', function () {
                return $this->loungeTables->map(function ($table) {
                    return [
                        'id' => $table->id,
                        'table_number' => $table->table_number,
                        'capacity' => $table->capacity,
                        'location' => $table->location,
                        'table_type' => $table->table_type,
                        'minimum_spend' => $table->minimum_spend,
                    ];
                });
            }),
            'night_club_areas' => $this->whenLoaded('nightClubAreas', function () {
                return $this->nightClubAreas->map(function ($area) {
                    return [
                        'id' => $area->id,
                        'area_name' => $area->area_name,
                        'location' => $area->location,
                        'area_type' => $area->area_type,
                        'capacity' => $area->capacity,
                        'minimum_spend' => $area->minimum_spend,
                        'table_fee' => $area->table_fee,
                    ];
                });
            }),
        ];
    }

    /**
     * Inclut les URLs média (absentes du toArray() Eloquent sans $appends).
     */
    private function serializeBookable($bookable): ?array
    {
        if (!$bookable) {
            return null;
        }

        if (method_exists($bookable, 'loadMissing')) {
            $bookable->loadMissing('media');
        }

        $data = $bookable->toArray();
        $data['main_image_url'] = $bookable->main_image_url ?? null;
        $data['main_image_thumb_url'] = $bookable->main_image_thumb_url ?? null;

        if (isset($bookable->gallery_images)) {
            $data['gallery_images'] = $bookable->gallery_images;
        }

        return $data;
    }

    /**
     * Fenêtre d'annulation / hold paiement — pour compte à rebours FO.
     */
    private function buildCancellationWindow(): ?array
    {
        if (in_array($this->status, ['ANNULE', 'COMPLETE'], true)) {
            return null;
        }

        $policy = app(\App\Services\PricingService::class)
            ->cancellationPolicy($this->bookable_type ?? 'residence');

        $freeHours = (int) ($policy['free_cancel_hours'] ?? 0);
        $graceMinutes = max(0, (int) config('booking.post_booking_free_cancel_minutes', 120));
        $start = $this->start_date ? \Carbon\Carbon::parse($this->start_date) : null;
        $created = $this->created_at
            ? \Carbon\Carbon::parse($this->created_at)
            : now();

        $policyUntil = $start
            ? $start->copy()->subHours($freeHours)
            : null;
        $graceUntil = $graceMinutes > 0
            ? $created->copy()->addMinutes($graceMinutes)
            : null;

        // Deadline effective = la plus lointaine entre politique et grâce.
        $freeCancelUntil = null;
        foreach ([$policyUntil, $graceUntil] as $candidate) {
            if (!$candidate) {
                continue;
            }
            if (!$freeCancelUntil || $candidate->gt($freeCancelUntil)) {
                $freeCancelUntil = $candidate->copy();
            }
        }

        $withinPolicy = $policyUntil ? now()->lt($policyUntil) : false;
        $withinGrace = $graceUntil ? now()->lt($graceUntil) : false;
        $isFreeOpen = $withinPolicy || $withinGrace;

        $unpaidExpiresAt = null;
        if (in_array($this->payment_status, ['EN_ATTENTE', 'ECHEC'], true)) {
            $holdMinutes = (int) config('booking.unpaid_hold_minutes', 30);
            $unpaidExpiresAt = $created->copy()->addMinutes($holdMinutes);
        }

        return [
            'free_cancel_hours' => $freeHours,
            'late_refund_percent' => (int) ($policy['late_refund_percent'] ?? 0),
            'post_booking_grace_minutes' => $graceMinutes,
            'policy_free_cancel_until' => $policyUntil?->toIso8601String(),
            'grace_free_cancel_until' => $graceUntil?->toIso8601String(),
            'free_cancel_until' => $freeCancelUntil?->toIso8601String(),
            'is_free_cancel_open' => $isFreeOpen,
            'within_grace' => $withinGrace && !$withinPolicy,
            'unpaid_expires_at' => $unpaidExpiresAt?->toIso8601String(),
            'unpaid_hold_minutes' => $unpaidExpiresAt
                ? (int) config('booking.unpaid_hold_minutes', 30)
                : null,
        ];
    }

    /**
     * Estimation de remboursement / avoir si annulation maintenant.
     */
    private function buildRefundEstimate(): ?array
    {
        if ($this->payment_status !== 'PAYE' || $this->funds_released_at) {
            return null;
        }

        if (in_array($this->status, ['ANNULE', 'COMPLETE'], true)) {
            return null;
        }

        $plan = app(\App\Services\BookingService::class)->resolveCancellationRefund($this->resource);
        $refundAmount = (float) ($plan['amount'] ?? 0);
        $bonusPercent = (int) config('booking.credit.bonus_percent', 10);
        $creditAmount = round($refundAmount * (1 + $bonusPercent / 100), 2);

        return [
            'refund_amount' => $refundAmount,
            'credit_amount' => $creditAmount,
            'bonus_percent' => $bonusPercent,
            'percent' => (int) ($plan['percent'] ?? 0),
            'is_free' => (bool) ($plan['free'] ?? false),
            'credit_enabled' => (bool) config('booking.credit.enabled', true),
        ];
    }
}
