<?php

namespace App\Notifications\Concerns;

use App\Models\Booking;

trait FormatsBookingMail
{
    protected function frontendUrl(string $path = ''): string
    {
        return rtrim((string) config('app.frontend_url'), '/') . '/' . ltrim($path, '/');
    }

    protected function formatMoney(float|int|string|null $amount): string
    {
        return number_format((float) ($amount ?? 0), 0, ',', ' ') . ' FCFA';
    }

    /**
     * @return array<int, array{label: string, value: string}>
     */
    protected function bookingDetailRows(Booking $booking, bool $includeAmount = true, ?string $amountLabel = null, ?float $amount = null): array
    {
        $rows = [
            [
                'label' => 'Référence',
                'value' => (string) $booking->booking_reference,
            ],
            [
                'label' => 'Dates',
                'value' => sprintf(
                    'du %s au %s',
                    $booking->start_date->format('d/m/Y'),
                    $booking->end_date->format('d/m/Y')
                ),
            ],
            [
                'label' => 'Invités',
                'value' => (string) $booking->guests,
            ],
        ];

        if ($includeAmount) {
            $rows[] = [
                'label' => $amountLabel ?: 'Montant',
                'value' => $this->formatMoney($amount ?? $booking->total_price),
            ];
        }

        return $rows;
    }
}
