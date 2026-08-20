<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Concerns\FormatsBookingMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notifie le propriétaire qu'un paiement a été reçu pour une de ses réservations.
 */
class PaymentReceivedNotification extends Notification
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
            ->subject('Paiement crédité — ' . $this->booking->booking_reference)
            ->view('emails.payment-received', [
                'user' => $notifiable,
                'booking' => $this->booking,
                'detailRows' => $this->bookingDetailRows(
                    $this->booking,
                    true,
                    'Montant crédité',
                    (float) $this->booking->owner_amount
                ),
                'actionUrl' => $this->frontendUrl('/admin/operations'),
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
