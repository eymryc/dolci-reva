<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\User;
use App\Notifications\BookingCancelledNotification;
use App\Notifications\BookingConfirmedNotification;
use App\Notifications\BookingCreatedNotification;
use App\Notifications\BookingCustomerNotification;
use App\Notifications\PaymentReceivedNotification;
use App\Notifications\PaymentHeldNotification;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Notifier la création d'une réservation.
     */
    public function notifyBookingCreated(Booking $booking): void
    {
        $this->safeNotify($booking->owner, new BookingCreatedNotification($booking), 'booking_created');
        $this->safeNotify($booking->customer, new BookingCustomerNotification($booking), 'booking_created');
    }

    /**
     * Notifier la confirmation d'une réservation.
     */
    public function notifyBookingConfirmed(Booking $booking): void
    {
        $this->safeNotify($booking->customer, new BookingConfirmedNotification($booking), 'booking_confirmed');
    }

    /**
     * Notifier l'annulation d'une réservation.
     */
    public function notifyBookingCancelled(Booking $booking, ?string $reason = null): void
    {
        $this->safeNotify($booking->customer, new BookingCancelledNotification($booking, $reason), 'booking_cancelled');
        $this->safeNotify($booking->owner, new BookingCancelledNotification($booking, $reason), 'booking_cancelled');
    }

    /**
     * Notifier le propriétaire qu'un paiement a été reçu mais que les fonds
     * sont sécurisés en séquestre jusqu'au check-in (cf. escrow).
     */
    public function notifyPaymentHeld(Booking $booking): void
    {
        $this->safeNotify($booking->owner, new PaymentHeldNotification($booking), 'payment_held');
    }

    /**
     * Notifier le propriétaire que les fonds ont été réellement crédités sur
     * son wallet (déclenché au check-in, cf. BookingService::completeBooking()).
     */
    public function notifyFundsReleased(Booking $booking): void
    {
        $this->safeNotify($booking->owner, new PaymentReceivedNotification($booking), 'funds_released');
    }

    /**
     * Envoie une notification sans jamais interrompre le flux appelant si
     * l'envoi échoue (ex: SMTP mal configuré) — l'erreur est journalisée.
     */
    private function safeNotify(?User $user, $notification, string $type): void
    {
        if (!$user) {
            return;
        }

        try {
            $user->notify($notification);
        } catch (\Exception $e) {
            Log::error("Échec de l'envoi de la notification", [
                'user_id' => $user->id,
                'type' => $type,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
