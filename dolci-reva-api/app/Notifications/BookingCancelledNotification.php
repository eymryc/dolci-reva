<?php

namespace App\Notifications;

use App\Models\Booking;
use App\Notifications\Concerns\FormatsBookingMail;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Notifie qu'une réservation vient d'être annulée (envoyée au client et au propriétaire).
 */
class BookingCancelledNotification extends Notification
{
    use FormatsBookingMail;
    use Queueable;

    public function __construct(protected Booking $booking, protected ?string $reason = null)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $isOwner = (int) ($notifiable->id ?? 0) === (int) $this->booking->owner_id;
        $path = $isOwner
            ? '/admin/bookings/' . $this->booking->id
            : '/customer/bookings/' . $this->booking->id;

        return (new MailMessage)
            ->subject('Réservation annulée — ' . $this->booking->booking_reference)
            ->view('emails.booking-cancelled', [
                'user' => $notifiable,
                'booking' => $this->booking,
                'reason' => $this->reason,
                'detailRows' => $this->bookingDetailRows($this->booking),
                'actionUrl' => $this->frontendUrl($path),
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [
            'booking_id' => $this->booking->id,
            'booking_reference' => $this->booking->booking_reference,
            'reason' => $this->reason,
        ];
    }
}
