<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Concerns\FormatsBookingMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notifie le propriétaire qu'un paiement a été reçu pour une de ses
 * réservations, mais que les fonds restent sécurisés par la plateforme
 * jusqu'à la validation du séjour/service (check-in / QR scanné).
 */
class PaymentHeldNotification extends Notification
{
    use FormatsBookingMail;
    use Queueable;

    public function __construct(protected Booking $booking)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Paiement sécurisé — ' . $this->booking->booking_reference)
            ->view('emails.payment-held', [
                'user' => $notifiable,
                'booking' => $this->booking,
                'detailRows' => $this->bookingDetailRows(
                    $this->booking,
                    true,
                    'Montant sécurisé',
                    (float) $this->booking->owner_amount
                ),
                'actionUrl' => $this->frontendUrl('/admin/bookings/' . $this->booking->id),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'booking_reference' => $this->booking->booking_reference,
        ];
    }
}
