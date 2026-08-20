<?php

namespace App\Traits;

/**
 * Disponibilité basée sur les bookings (tables, zones, etc.).
 * Le modèle doit exposer bookings() (BelongsToMany ou HasMany).
 */
trait HasUnitAvailability
{
    public function getUnavailableDates(): array
    {
        $holdCutoff = now()->subMinutes(max(1, (int) config('booking.unpaid_hold_minutes', 30)));

        // Qualifier bookings.* : sur BelongsToMany la pivot a aussi created_at.
        return $this->bookings()
            ->where('bookings.status', '!=', 'ANNULE')
            ->where(function ($q) use ($holdCutoff) {
                $q->where('bookings.payment_status', 'PAYE')
                    ->orWhere('bookings.created_at', '>', $holdCutoff);
            })
            ->where('bookings.end_date', '>=', now()->toDateString())
            ->orderBy('bookings.start_date')
            ->get()
            ->map(function ($booking) {
                return [
                    'start' => \Carbon\Carbon::parse($booking->start_date)->toDateString(),
                    'end' => \Carbon\Carbon::parse($booking->end_date)->toDateString(),
                    'status' => $booking->status,
                ];
            })
            ->toArray();
    }

    /**
     * @return array{
     *   status: string,
     *   label: string,
     *   occupied_until: ?string,
     *   free_from: ?string,
     *   next_booking_start: ?string,
     *   booking_status?: ?string,
     *   message: string
     * }
     */
    public function getAvailabilityStatus(): array
    {
        $isActive = property_exists($this, 'is_active') || isset($this->attributes['is_active'])
            ? (bool) $this->is_active
            : true;

        if (!$isActive) {
            return [
                'status' => 'inactive',
                'label' => 'Inactive',
                'occupied_until' => null,
                'free_from' => null,
                'next_booking_start' => null,
                'message' => 'Non disponible',
            ];
        }

        $today = now()->toDateString();
        $ranges = $this->getUnavailableDates();

        $current = null;
        foreach ($ranges as $range) {
            if ($range['start'] <= $today && $range['end'] >= $today) {
                $current = $range;
                break;
            }
        }

        if ($current) {
            $freeFrom = \Carbon\Carbon::parse($current['end'])->addDay()->toDateString();

            return [
                'status' => 'reserved',
                'label' => 'Réservé',
                'occupied_until' => $current['end'],
                'free_from' => $freeFrom,
                'next_booking_start' => null,
                'booking_status' => $current['status'],
                'message' => 'Libre à partir du ' . \Carbon\Carbon::parse($freeFrom)->format('d/m/Y'),
            ];
        }

        $next = collect($ranges)
            ->filter(fn (array $r) => $r['start'] > $today)
            ->sortBy('start')
            ->first();

        return [
            'status' => 'available',
            'label' => 'Disponible',
            'occupied_until' => null,
            'free_from' => $today,
            'next_booking_start' => $next['start'] ?? null,
            'message' => $next
                ? 'Disponible · prochaine réservation le ' . \Carbon\Carbon::parse($next['start'])->format('d/m/Y')
                : 'Disponible maintenant',
        ];
    }
}
