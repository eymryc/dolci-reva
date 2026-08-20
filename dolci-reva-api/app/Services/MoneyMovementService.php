<?php

namespace App\Services;

use App\Enums\MoneyMovementDirection;
use App\Enums\MoneyMovementStatus;
use App\Enums\MoneyMovementType;
use App\Models\MoneyMovement;
use Illuminate\Support\Facades\Log;

/**
 * Journal monétique unique (append-only, idempotent) pour le suivi admin.
 */
class MoneyMovementService
{
    /**
     * @param  array{
     *   type: MoneyMovementType|string,
     *   direction: MoneyMovementDirection|string,
     *   amount: float|int|string,
     *   idempotency_key: string,
     *   currency?: string,
     *   status?: MoneyMovementStatus|string,
     *   booking_id?: int|null,
     *   user_id?: int|null,
     *   counterparty_user_id?: int|null,
     *   withdrawal_id?: int|null,
     *   wallet_id?: int|null,
     *   external_reference?: string|null,
     *   meta?: array|null,
     *   occurred_at?: \DateTimeInterface|string|null,
     * }  $data
     */
    public function record(array $data): MoneyMovement
    {
        $key = (string) $data['idempotency_key'];
        $existing = MoneyMovement::where('idempotency_key', $key)->first();
        if ($existing) {
            return $existing;
        }

        $type = $data['type'] instanceof MoneyMovementType
            ? $data['type']->value
            : (string) $data['type'];

        $direction = $data['direction'] instanceof MoneyMovementDirection
            ? $data['direction']->value
            : (string) $data['direction'];

        $status = isset($data['status'])
            ? ($data['status'] instanceof MoneyMovementStatus
                ? $data['status']->value
                : (string) $data['status'])
            : MoneyMovementStatus::RECORDED->value;

        $amount = round((float) $data['amount'], 2);
        if ($amount < 0) {
            throw new \InvalidArgumentException('Money movement amount must be >= 0.');
        }

        $movement = MoneyMovement::create([
            'type' => $type,
            'direction' => $direction,
            'amount' => $amount,
            'currency' => $data['currency'] ?? config('services.payout.currency', 'XOF'),
            'status' => $status,
            'booking_id' => $data['booking_id'] ?? null,
            'user_id' => $data['user_id'] ?? null,
            'counterparty_user_id' => $data['counterparty_user_id'] ?? null,
            'withdrawal_id' => $data['withdrawal_id'] ?? null,
            'wallet_id' => $data['wallet_id'] ?? null,
            'external_reference' => $data['external_reference'] ?? null,
            'idempotency_key' => $key,
            'meta' => $data['meta'] ?? null,
            'occurred_at' => $data['occurred_at'] ?? now(),
        ]);

        Log::info('Money movement recorded', [
            'id' => $movement->id,
            'type' => $movement->type,
            'amount' => $movement->amount,
            'idempotency_key' => $key,
        ]);

        return $movement;
    }
}
