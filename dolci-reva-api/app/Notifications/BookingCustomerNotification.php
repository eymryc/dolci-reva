<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Concerns\FormatsBookingMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Confirme au client que sa demande de réservation a bien été enregistrée.
 */
class BookingCustomerNotification extends Notification
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
            ->subject('Votre réservation — ' . $this->booking->booking_reference)
            ->view('emails.booking-customer', [
                'user' => $notifiable,
                'booking' => $this->booking,
                'detailRows' => $this->bookingDetailRows(
                    $this->booking,
                    true,
                    'Montant total'
                ),
                'actionUrl' => $this->frontendUrl('/customer/bookings/' . $this->booking->id),
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
