<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Concerns\FormatsBookingMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notifie le client que sa réservation a été confirmée par l'établissement.
 */
class BookingConfirmedNotification extends Notification
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
            ->subject('Réservation confirmée — ' . $this->booking->booking_reference)
            ->view('emails.booking-confirmed', [
                'user' => $notifiable,
                'booking' => $this->booking,
                'detailRows' => $this->bookingDetailRows($this->booking),
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
