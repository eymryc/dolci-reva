<?php

namespace App\Support;

use Carbon\Carbon;
use InvalidArgumentException;

/**
 * Durées de créneau pour les verticales hospitality (pas des séjours nuités).
 */
class HospitalitySlot
{
    public static function minutesFor(string $vertical): int
    {
        $key = match ($vertical) {
            'restaurant' => 'restaurant_minutes',
            'lounge', 'bar' => 'lounge_minutes',
            'night_club', 'night-club', 'nightClub' => 'night_club_minutes',
            default => throw new InvalidArgumentException("Verticale hospitality inconnue: {$vertical}"),
        };

        return max(30, (int) config("booking.slots.{$key}", 120));
    }

    /**
     * Recalcule end_date à partir de start_date + durée configurée.
     *
     * @param  array<string, mixed>  $data
     * @return array<string, mixed>
     */
    public static function apply(array $data, string $vertical): array
    {
        if (empty($data['start_date'])) {
            return $data;
        }

        $start = Carbon::parse($data['start_date']);
        $data['end_date'] = $start
            ->copy()
            ->addMinutes(self::minutesFor($vertical))
            ->format('Y-m-d H:i:s');

        return $data;
    }

    public static function slotEnd(string $date, string $time, string $vertical): Carbon
    {
        return Carbon::parse("{$date} {$time}")
            ->addMinutes(self::minutesFor($vertical));
    }

    public static function slotStart(string $date, string $time): Carbon
    {
        return Carbon::parse("{$date} {$time}");
    }
}
