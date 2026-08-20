<?php

namespace App\Repositories;

use App\Enums\WithdrawalEnum;
use App\Enums\MoneyMovementDirection;
use App\Enums\MoneyMovementStatus;
use App\Enums\MoneyMovementType;
use App\Models\PayoutAccount;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Services\MoneyMovementService;
use App\Services\PaystackService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class WithdrawalRepository
{
    public function __construct(
        protected Withdrawal $withdrawal,
        protected PaystackService $paystackService,
        protected MoneyMovementService $moneyMovementService
    ) {
    }

    public function all()
    {
        return $this->withdrawal->with('user:id,first_name,last_name,email,phone')->latest()->get();
    }

    public function paginate(int $perPage = 15)
    {
        return $this->withdrawal->latest()->paginate($perPage);
    }

    public function getById(int $id)
    {
        return $this->withdrawal->find($id);
    }

    /**
     * Crée une demande de retrait : exige un payout_account, snapshot, débit wallet.
     */
    public function save(array $data)
    {
        $userId = Auth::id();
        $amount = (float) ($data['amount'] ?? 0);

        if ($amount < 100) {
            throw new \InvalidArgumentException('Le montant minimum de retrait est de 100.');
        }

        $payoutAccount = PayoutAccount::where('user_id', $userId)->first();
        if (!$payoutAccount) {
            throw new \InvalidArgumentException(
                'Configurez d\'abord votre compte de versement (PUT /api/payout-account) avant de demander un retrait.'
            );
        }

        $wallet = Wallet::where('user_id', $userId)->where('is_platform', false)->first();
        if (!$wallet) {
            throw new \InvalidArgumentException('Wallet introuvable.');
        }

        if ((float) $wallet->balance < $amount) {
            throw new \InvalidArgumentException('Solde insuffisant.');
        }

        $withdrawal = Withdrawal::create([
            'user_id' => $userId,
            'amount' => $amount,
            'status' => WithdrawalEnum::PENDING->value,
            'payout_snapshot' => $payoutAccount->toSnapshot(),
        ]);

        $wallet->transactions()->create([
            'type' => 'DEBIT',
            'amount' => $amount,
            'reason' => 'Retrait #' . $withdrawal->id,
        ]);

        $wallet->decrement('balance', $amount);

        $this->moneyMovementService->record([
            'type' => MoneyMovementType::OWNER_WITHDRAWAL,
            'direction' => MoneyMovementDirection::OUT,
            'amount' => $amount,
            'idempotency_key' => 'withdrawal:' . $withdrawal->id . ':request',
            'user_id' => $userId,
            'withdrawal_id' => $withdrawal->id,
            'wallet_id' => $wallet->id,
            'status' => MoneyMovementStatus::PENDING,
            'meta' => ['payout_snapshot' => $payoutAccount->toSnapshot()],
            'occurred_at' => now(),
        ]);

        return $withdrawal->fresh();
    }

    /**
     * Update non-financial withdrawal metadata only.
     */
    public function update(array $data, int $id)
    {
        if (array_key_exists('amount', $data)) {
            throw new \InvalidArgumentException('Le montant d’un retrait ne peut pas être modifié.');
        }

        $withdrawal = $this->withdrawal->find($id);
        unset($data['status'], $data['user_id'], $data['transfer_reference'], $data['transfer_code']);
        $withdrawal->update($data);

        return $withdrawal;
    }

    public function delete(int $id)
    {
        $withdrawal = $this->withdrawal->find($id);

        if ($withdrawal->status === WithdrawalEnum::PENDING->value) {
            $this->recreditWallet($withdrawal, 'Annulation retrait #' . $withdrawal->id);
        }

        $withdrawal->delete();

        return $withdrawal;
    }

    /**
     * Approuver : tente un transfert Paystack si recipient + transfers_enabled,
     * sinon APPROVED manuel.
     */
    public function approve(int $id, int $reviewerId)
    {
        $withdrawal = $this->withdrawal->find($id);

        if (!$withdrawal || $withdrawal->status !== WithdrawalEnum::PENDING->value) {
            throw new \Exception('Cette demande de retrait ne peut plus être approuvée.');
        }

        $snapshot = $withdrawal->payout_snapshot ?? [];
        $recipientCode = $snapshot['paystack_recipient_code'] ?? null;
        $transfersEnabled = (bool) config('services.paystack.transfers_enabled', true);

        if ($recipientCode && $transfersEnabled && $this->paystackService->isConfigured()) {
            $reference = 'WD_' . $withdrawal->id . '_' . time();
            $currency = $snapshot['currency'] ?? config('services.payout.currency', 'XOF');

            try {
                $response = $this->paystackService->initiateTransfer([
                    'amount' => (float) $withdrawal->amount,
                    'recipient' => $recipientCode,
                    'reference' => $reference,
                    'reason' => 'Retrait #' . $withdrawal->id,
                    'currency' => $currency,
                    'source' => 'balance',
                ]);

                $withdrawal->update([
                    'status' => WithdrawalEnum::PROCESSING->value,
                    'transfer_reference' => $response['data']['reference'] ?? $reference,
                    'transfer_code' => $response['data']['transfer_code'] ?? null,
                    'reviewed_by' => $reviewerId,
                    'reviewed_at' => now(),
                    'failure_reason' => null,
                ]);

                Log::info('Withdrawal transfer initiated', [
                    'withdrawal_id' => $withdrawal->id,
                    'reference' => $withdrawal->transfer_reference,
                ]);

                return $withdrawal->fresh();
            } catch (\Throwable $e) {
                Log::error('Withdrawal Paystack transfer failed — falling back to manual', [
                    'withdrawal_id' => $withdrawal->id,
                    'error' => $e->getMessage(),
                ]);

                // Fallback manuel : l'admin devra verser hors plateforme.
                return $this->markApprovedManual($withdrawal, $reviewerId, 'Paystack transfer failed: ' . $e->getMessage());
            }
        }

        return $this->markApprovedManual(
            $withdrawal,
            $reviewerId,
            'manual payout — no Paystack recipient'
        );
    }

    /**
     * Forcer l'approbation manuelle sans transfert Paystack.
     */
    public function approveManual(int $id, int $reviewerId)
    {
        $withdrawal = $this->withdrawal->find($id);

        if (!$withdrawal || !in_array($withdrawal->status, [
            WithdrawalEnum::PENDING->value,
            WithdrawalEnum::FAILED->value,
        ], true)) {
            throw new \Exception('Cette demande de retrait ne peut plus être approuvée manuellement.');
        }

        return $this->markApprovedManual($withdrawal, $reviewerId, 'forced manual approve');
    }

    public function reject(int $id, int $reviewerId)
    {
        $withdrawal = $this->withdrawal->find($id);

        if (!$withdrawal || $withdrawal->status !== WithdrawalEnum::PENDING->value) {
            throw new \Exception('Cette demande de retrait ne peut plus être rejetée.');
        }

        $this->recreditWallet($withdrawal, 'Rejet retrait #' . $withdrawal->id);

        $withdrawal->update([
            'status' => WithdrawalEnum::REJECTED->value,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
        ]);

        return $withdrawal->fresh();
    }

    /**
     * Webhook transfer.success → APPROVED (idempotent).
     */
    public function markTransferSuccess(string $reference): ?Withdrawal
    {
        $withdrawal = Withdrawal::where('transfer_reference', $reference)->first();
        if (!$withdrawal) {
            Log::warning('Transfer success webhook: withdrawal not found', ['reference' => $reference]);
            return null;
        }

        if ($withdrawal->status === WithdrawalEnum::APPROVED->value) {
            return $withdrawal;
        }

        if (!in_array($withdrawal->status, [
            WithdrawalEnum::PROCESSING->value,
            WithdrawalEnum::PENDING->value,
        ], true)) {
            Log::info('Transfer success ignored for status ' . $withdrawal->status, [
                'withdrawal_id' => $withdrawal->id,
            ]);
            return $withdrawal;
        }

        $withdrawal->update([
            'status' => WithdrawalEnum::APPROVED->value,
            'failure_reason' => null,
            'reviewed_at' => $withdrawal->reviewed_at ?? now(),
        ]);

        $this->moneyMovementService->record([
            'type' => MoneyMovementType::OWNER_TRANSFER_SUCCESS,
            'direction' => MoneyMovementDirection::OUT,
            'amount' => (float) $withdrawal->amount,
            'idempotency_key' => 'withdrawal:' . $withdrawal->id . ':transfer-success',
            'user_id' => $withdrawal->user_id,
            'withdrawal_id' => $withdrawal->id,
            'external_reference' => $reference,
            'meta' => ['channel' => 'paystack_transfer'],
            'occurred_at' => now(),
        ]);

        return $withdrawal->fresh();
    }

    /**
     * Webhook transfer.failed / transfer.reversed → FAILED + recredit (idempotent).
     */
    public function markTransferFailed(string $reference, ?string $reason = null): ?Withdrawal
    {
        $withdrawal = Withdrawal::where('transfer_reference', $reference)->first();
        if (!$withdrawal) {
            Log::warning('Transfer failed webhook: withdrawal not found', ['reference' => $reference]);
            return null;
        }

        if ($withdrawal->status === WithdrawalEnum::FAILED->value) {
            return $withdrawal;
        }

        if ($withdrawal->status === WithdrawalEnum::APPROVED->value) {
            // Reversal after success: recredit once.
            $this->recreditWallet($withdrawal, 'Reversement transfert retrait #' . $withdrawal->id);
            $withdrawal->update([
                'status' => WithdrawalEnum::FAILED->value,
                'failure_reason' => $reason ?? 'transfer.reversed',
            ]);

            $this->moneyMovementService->record([
                'type' => MoneyMovementType::OWNER_TRANSFER_FAILED,
                'direction' => MoneyMovementDirection::OUT,
                'amount' => (float) $withdrawal->amount,
                'idempotency_key' => 'withdrawal:' . $withdrawal->id . ':transfer-reversed',
                'user_id' => $withdrawal->user_id,
                'withdrawal_id' => $withdrawal->id,
                'external_reference' => $reference,
                'status' => MoneyMovementStatus::FAILED,
                'meta' => ['reason' => $reason ?? 'transfer.reversed'],
                'occurred_at' => now(),
            ]);

            return $withdrawal->fresh();
        }

        if ($withdrawal->status !== WithdrawalEnum::PROCESSING->value) {
            Log::info('Transfer failed ignored for status ' . $withdrawal->status, [
                'withdrawal_id' => $withdrawal->id,
            ]);
            return $withdrawal;
        }

        $this->recreditWallet($withdrawal, 'Échec transfert retrait #' . $withdrawal->id);

        $withdrawal->update([
            'status' => WithdrawalEnum::FAILED->value,
            'failure_reason' => $reason ?? 'transfer.failed',
        ]);

        $this->moneyMovementService->record([
            'type' => MoneyMovementType::OWNER_TRANSFER_FAILED,
            'direction' => MoneyMovementDirection::OUT,
            'amount' => (float) $withdrawal->amount,
            'idempotency_key' => 'withdrawal:' . $withdrawal->id . ':transfer-failed:' . md5((string) ($reason ?? 'transfer.failed')),
            'user_id' => $withdrawal->user_id,
            'withdrawal_id' => $withdrawal->id,
            'external_reference' => $reference,
            'status' => MoneyMovementStatus::FAILED,
            'meta' => ['reason' => $reason ?? 'transfer.failed'],
            'occurred_at' => now(),
        ]);

        return $withdrawal->fresh();
    }

    private function markApprovedManual(Withdrawal $withdrawal, int $reviewerId, string $logReason): Withdrawal
    {
        Log::info('Withdrawal approved manually', [
            'withdrawal_id' => $withdrawal->id,
            'reason' => $logReason,
        ]);

        $withdrawal->update([
            'status' => WithdrawalEnum::APPROVED->value,
            'reviewed_by' => $reviewerId,
            'reviewed_at' => now(),
            'failure_reason' => $logReason !== 'forced manual approve' && str_starts_with($logReason, 'Paystack')
                ? $logReason
                : null,
        ]);

        $this->moneyMovementService->record([
            'type' => MoneyMovementType::OWNER_TRANSFER_SUCCESS,
            'direction' => MoneyMovementDirection::OUT,
            'amount' => (float) $withdrawal->amount,
            'idempotency_key' => 'withdrawal:' . $withdrawal->id . ':manual-success',
            'user_id' => $withdrawal->user_id,
            'withdrawal_id' => $withdrawal->id,
            'meta' => ['channel' => 'manual', 'reason' => $logReason],
            'occurred_at' => now(),
        ]);

        return $withdrawal->fresh();
    }

    private function recreditWallet(Withdrawal $withdrawal, string $reason): void
    {
        $wallet = Wallet::where('user_id', $withdrawal->user_id)->where('is_platform', false)->first();
        if (!$wallet) {
            return;
        }

        // Idempotence : ne pas recréditer deux fois pour le même motif.
        $already = $wallet->transactions()
            ->where('reason', $reason)
            ->exists();

        if ($already) {
            return;
        }

        $wallet->transactions()->create([
            'type' => 'CREDIT',
            'amount' => $withdrawal->amount,
            'reason' => $reason,
        ]);
        $wallet->increment('balance', $withdrawal->amount);
    }
}
