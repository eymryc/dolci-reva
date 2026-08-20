<?php

namespace App\Services;

use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Ledger comptable de la plateforme : commission check-in + rétentions
 * d'annulation. Un seul wallet `is_platform=true` (user_id null).
 */
class PlatformLedgerService
{
    /**
     * Retourne (ou crée) le wallet plateforme unique.
     */
    public function wallet(): Wallet
    {
        return Wallet::firstOrCreate(
            ['is_platform' => true],
            ['user_id' => null, 'balance' => 0]
        );
    }

    /**
     * Crédite le wallet plateforme. Montant ≤ 0 → no-op.
     *
     * @param float $amount Montant en unité majeure (XOF)
     * @param string $reason Libellé de la transaction wallet
     * @param int|null $bookingId Réservation liée (journalisation / traçabilité)
     */
    public function credit(float $amount, string $reason, ?int $bookingId = null): Wallet
    {
        if ($amount <= 0) {
            return $this->wallet();
        }

        return DB::transaction(function () use ($amount, $reason, $bookingId) {
            $wallet = $this->wallet();
            $wallet->increment('balance', $amount);

            $wallet->transactions()->create([
                'type' => 'CREDIT',
                'amount' => $amount,
                'reason' => $reason,
            ]);

            Log::info('Platform ledger credit', [
                'amount' => $amount,
                'reason' => $reason,
                'booking_id' => $bookingId,
                'wallet_id' => $wallet->id,
                'balance' => $wallet->fresh()->balance,
            ]);

            return $wallet->fresh();
        });
    }
}
