<?php

namespace App\Services;

use App\Enums\MoneyMovementDirection;
use App\Enums\MoneyMovementType;
use App\Models\Booking;
use App\Models\CustomerCredit;
use App\Models\CustomerCreditRedemption;
use Illuminate\Support\Facades\DB;

class CustomerCreditService
{
    public function __construct(
        protected MoneyMovementService $moneyMovementService
    ) {
    }

    public function isEnabled(): bool
    {
        return (bool) config('booking.credit.enabled', true);
    }

    public function bonusPercent(): int
    {
        return max(0, (int) config('booking.credit.bonus_percent', 10));
    }

    public function expiresMonths(): int
    {
        return max(1, (int) config('booking.credit.expires_months', 12));
    }

    /**
     * Solde utilisable (ACTIVE, non expiré).
     */
    public function availableBalance(int $userId): float
    {
        $this->expireStaleForUser($userId);

        return round((float) CustomerCredit::query()
            ->where('user_id', $userId)
            ->where('status', 'ACTIVE')
            ->where('remaining_amount', '>', 0)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->sum('remaining_amount'), 2);
    }

    /**
     * @return array{credit: CustomerCredit, credited_amount: float, base_amount: float, bonus_amount: float}
     */
    public function issueFromCancellation(Booking $booking, float $refundAmount): array
    {
        if (!$this->isEnabled()) {
            throw new \InvalidArgumentException('Les avoirs Dolci sont désactivés.');
        }

        if ($refundAmount <= 0) {
            throw new \InvalidArgumentException('Montant remboursable nul — pas d\'avoir à émettre.');
        }

        $bonusPercent = $this->bonusPercent();
        $bonusAmount = round($refundAmount * ($bonusPercent / 100), 2);
        $creditedAmount = round($refundAmount + $bonusAmount, 2);

        return DB::transaction(function () use ($booking, $refundAmount, $bonusAmount, $creditedAmount, $bonusPercent) {
            $credit = CustomerCredit::create([
                'user_id' => $booking->customer_id,
                'amount' => $creditedAmount,
                'remaining_amount' => $creditedAmount,
                'bonus_amount' => $bonusAmount,
                'source_booking_id' => $booking->id,
                'expires_at' => now()->addMonths($this->expiresMonths()),
                'status' => 'ACTIVE',
                'meta' => [
                    'base_refund' => $refundAmount,
                    'bonus_percent' => $bonusPercent,
                    'payment_reference' => $booking->payment_reference,
                ],
            ]);

            $this->moneyMovementService->record([
                'type' => MoneyMovementType::CREDIT_ISSUED,
                'direction' => MoneyMovementDirection::INTERNAL,
                'amount' => $creditedAmount,
                'idempotency_key' => 'credit-issued:cancel:' . $booking->id,
                'booking_id' => $booking->id,
                'user_id' => $booking->customer_id,
                'counterparty_user_id' => $booking->owner_id,
                'external_reference' => $booking->payment_reference,
                'meta' => [
                    'customer_credit_id' => $credit->id,
                    'base_refund' => $refundAmount,
                    'bonus_amount' => $bonusAmount,
                    'bonus_percent' => $bonusPercent,
                ],
                'occurred_at' => now(),
            ]);

            return [
                'credit' => $credit,
                'credited_amount' => $creditedAmount,
                'base_amount' => $refundAmount,
                'bonus_amount' => $bonusAmount,
            ];
        });
    }

    /**
     * Applique l'avoir (FIFO expiration) sur une réservation. Idempotent si déjà appliqué.
     *
     * @return float Montant réellement appliqué
     */
    public function applyToBooking(Booking $booking, ?float $maxAmount = null): float
    {
        if (!$this->isEnabled()) {
            return 0;
        }

        if ((float) $booking->credit_applied > 0) {
            return (float) $booking->credit_applied;
        }

        $userId = (int) $booking->customer_id;
        $cap = $maxAmount ?? (float) $booking->total_price;
        $needed = round(min($cap, (float) $booking->total_price), 2);
        if ($needed <= 0) {
            return 0;
        }

        return DB::transaction(function () use ($booking, $userId, $needed) {
            $this->expireStaleForUser($userId);

            $credits = CustomerCredit::query()
                ->where('user_id', $userId)
                ->where('status', 'ACTIVE')
                ->where('remaining_amount', '>', 0)
                ->where(function ($q) {
                    $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
                })
                ->orderByRaw('expires_at IS NULL ASC')
                ->orderBy('expires_at')
                ->lockForUpdate()
                ->get();

            $applied = 0.0;
            foreach ($credits as $credit) {
                if ($applied >= $needed) {
                    break;
                }

                $take = round(min((float) $credit->remaining_amount, $needed - $applied), 2);
                if ($take <= 0) {
                    continue;
                }

                $credit->remaining_amount = round((float) $credit->remaining_amount - $take, 2);
                if ((float) $credit->remaining_amount <= 0) {
                    $credit->remaining_amount = 0;
                    $credit->status = 'DEPLETED';
                }
                $credit->save();

                CustomerCreditRedemption::create([
                    'customer_credit_id' => $credit->id,
                    'booking_id' => $booking->id,
                    'amount' => $take,
                ]);

                $applied = round($applied + $take, 2);
            }

            if ($applied > 0) {
                $booking->update(['credit_applied' => $applied]);

                $this->moneyMovementService->record([
                    'type' => MoneyMovementType::CREDIT_REDEEMED,
                    'direction' => MoneyMovementDirection::INTERNAL,
                    'amount' => $applied,
                    'idempotency_key' => 'credit-redeemed:booking:' . $booking->id,
                    'booking_id' => $booking->id,
                    'user_id' => $userId,
                    'meta' => ['credit_applied' => $applied],
                    'occurred_at' => now(),
                ]);
            }

            return $applied;
        });
    }

    /**
     * Restaure les avoirs consommés sur une réservation non payée annulée.
     */
    public function restoreForBooking(Booking $booking): float
    {
        $applied = (float) $booking->credit_applied;
        if ($applied <= 0) {
            return 0;
        }

        return DB::transaction(function () use ($booking) {
            $redemptions = CustomerCreditRedemption::query()
                ->where('booking_id', $booking->id)
                ->with('credit')
                ->lockForUpdate()
                ->get();

            $restored = 0.0;
            foreach ($redemptions as $redemption) {
                $credit = $redemption->credit;
                if (!$credit) {
                    continue;
                }

                $amount = (float) $redemption->amount;
                $credit->remaining_amount = round((float) $credit->remaining_amount + $amount, 2);
                if ($credit->status === 'DEPLETED') {
                    $credit->status = 'ACTIVE';
                }
                if ($credit->expires_at && $credit->expires_at->isPast()) {
                    $credit->status = 'EXPIRED';
                }
                $credit->save();
                $restored = round($restored + $amount, 2);
                $redemption->delete();
            }

            $booking->update(['credit_applied' => 0]);

            return $restored;
        });
    }

    public function expireStaleForUser(int $userId): void
    {
        CustomerCredit::query()
            ->where('user_id', $userId)
            ->where('status', 'ACTIVE')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update(['status' => 'EXPIRED']);
    }

    /**
     * @return list<CustomerCredit>
     */
    public function activeCredits(int $userId): array
    {
        $this->expireStaleForUser($userId);

        return CustomerCredit::query()
            ->where('user_id', $userId)
            ->where('status', 'ACTIVE')
            ->where('remaining_amount', '>', 0)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->orderBy('expires_at')
            ->get()
            ->all();
    }
}
