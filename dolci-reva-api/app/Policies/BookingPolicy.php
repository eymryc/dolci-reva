<?php

namespace App\Policies;

use App\Models\Booking;
use App\Models\User;

class BookingPolicy
{
    /**
     * Le client, le propriétaire de l'établissement, ou un admin peuvent
     * consulter la réservation.
     */
    public function view(User $user, Booking $booking): bool
    {
        return $user->isAdmin()
            || $booking->customer_id === $user->id
            || $booking->owner_id === $user->id;
    }

    /**
     * Seul le propriétaire de l'établissement ou un admin peuvent confirmer
     * une réservation.
     */
    public function confirm(User $user, Booking $booking): bool
    {
        return $user->isAdmin() || $booking->owner_id === $user->id;
    }

    /**
     * Le client, le propriétaire ou un admin peuvent annuler une réservation.
     */
    public function cancel(User $user, Booking $booking): bool
    {
        return $user->isAdmin()
            || $booking->owner_id === $user->id
            || $booking->customer_id === $user->id;
    }

    /**
     * Seul le propriétaire de l'établissement ou un admin peuvent marquer une
     * réservation comme terminée.
     */
    public function complete(User $user, Booking $booking): bool
    {
        return $user->isAdmin() || $booking->owner_id === $user->id;
    }
}
