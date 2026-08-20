<?php

namespace App\Services;

use App\Models\Booking;
use Illuminate\Support\Facades\Crypt;

class BookingQrService
{
    /**
     * Token signé (encrypt) + TTL, single-use via marked completed booking.
     */
    public function issue(Booking $booking, int $ttlHours = 72): string
    {
        $payload = [
            'booking_id' => $booking->id,
            'booking_reference' => $booking->booking_reference,
            'owner_id' => $booking->owner_id,
            'exp' => now()->addHours($ttlHours)->timestamp,
            'v' => 2,
        ];

        return Crypt::encryptString(json_encode($payload));
    }

    /**
     * @return array{booking_id:int,booking_reference:string,owner_id:int,exp:int,v:int}
     */
    public function parse(string $token): array
    {
        try {
            $json = Crypt::decryptString($token);
            $payload = json_decode($json, true);
        } catch (\Throwable) {
            // Compat: anciens tokens base64 non signés — refusés en prod
            throw new \InvalidArgumentException('QR code invalide ou expiré.');
        }

        if (! is_array($payload) || empty($payload['booking_id']) || empty($payload['booking_reference'])) {
            throw new \InvalidArgumentException('QR code invalide.');
        }

        if (empty($payload['exp']) || (int) $payload['exp'] < now()->timestamp) {
            throw new \InvalidArgumentException('QR code expiré.');
        }

        return $payload;
    }
}
