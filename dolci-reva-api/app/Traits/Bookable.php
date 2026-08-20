<?php

namespace App\Traits;

use App\Models\Booking;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait Bookable
{
    /**
     * Get all bookings for this model.
     */
    public function bookings(): MorphMany
    {
        return $this->morphMany(Booking::class, 'bookable');
    }

    /**
     * Check if the model is available for booking on specific dates.
     */
    public function isAvailableForBooking(string $startDate, string $endDate, int $guests = 1): bool
    {
        $conflictingBookings = $this->bookings()
            ->where('status', '!=', 'ANNULE')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                      ->orWhereBetween('end_date', [$startDate, $endDate])
                      ->orWhere(function ($q) use ($startDate, $endDate) {
                          $q->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                      });
            })
            ->exists();

        return !$conflictingBookings;
    }

    /**
     * Get available booking slots for a date range.
     */
    public function getAvailableSlots(string $startDate, string $endDate): array
    {
        // Implementation depends on your business logic
        // This is a basic example
        return [
            'available' => $this->isAvailableForBooking($startDate, $endDate),
            'conflicts' => $this->getConflictingBookings($startDate, $endDate)
        ];
    }

    /**
     * Get conflicting bookings for a date range.
     */
    public function getConflictingBookings(string $startDate, string $endDate)
    {
        return $this->bookings()
            ->where('status', '!=', 'ANNULE')
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                      ->orWhereBetween('end_date', [$startDate, $endDate])
                      ->orWhere(function ($q) use ($startDate, $endDate) {
                          $q->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                      });
            })
            ->get();
    }
}

