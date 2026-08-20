<?php

namespace App\Console\Commands;

use App\Services\BookingService;
use Illuminate\Console\Command;

class ExpireUnpaidBookings extends Command
{
    protected $signature = 'bookings:expire-unpaid';

    protected $description = 'Annule les réservations non payées hors TTL et libère l\'inventaire';

    public function handle(BookingService $bookingService): int
    {
        $count = $bookingService->expireUnpaidBookings();
        $this->info("{$count} réservation(s) expirée(s).");

        return self::SUCCESS;
    }
}
