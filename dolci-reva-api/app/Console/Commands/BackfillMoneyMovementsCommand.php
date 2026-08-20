<?php

namespace App\Console\Commands;

use App\Enums\MoneyMovementDirection;
use App\Enums\MoneyMovementStatus;
use App\Enums\MoneyMovementType;
use App\Enums\WithdrawalEnum;
use App\Models\Booking;
use App\Models\Withdrawal;
use App\Services\MoneyMovementService;
use App\Services\PlatformLedgerService;
use Illuminate\Console\Command;

class BackfillMoneyMovementsCommand extends Command
{
    protected $signature = 'finance:backfill-money-movements {--dry-run : Afficher sans écrire}';

    protected $description = 'Backfill money_movements depuis bookings et withdrawals existants';

    public function handle(MoneyMovementService $money, PlatformLedgerService $platform): int
    {
        $dry = (bool) $this->option('dry-run');
        $created = 0;

        $record = function (array $payload) use ($money, $dry, &$created) {
            if ($dry) {
                $this->line('[dry-run] ' . $payload['idempotency_key'] . ' ' . $payload['type'] . ' ' . $payload['amount']);
                $created++;

                return;
            }
            $before = $money->record($payload);
            // firstOrCreate semantics: count only newly created
            if ($before->wasRecentlyCreated) {
                $created++;
            }
        };

        $this->info('Backfill bookings…');

        Booking::query()
            ->whereNotNull('payment_reference')
            ->whereIn('payment_status', ['PAYE', 'REMBOURSE'])
            ->orderBy('id')
            ->chunkById(100, function ($bookings) use ($record, $platform) {
                foreach ($bookings as $booking) {
                    /** @var Booking $booking */
                    $ref = $booking->payment_reference;
                    if (!$ref) {
                        continue;
                    }

                    $occurred = $booking->updated_at ?? $booking->created_at ?? now();

                    $record([
                        'type' => MoneyMovementType::CLIENT_CHARGE,
                        'direction' => MoneyMovementDirection::IN,
                        'amount' => (float) $booking->total_price,
                        'idempotency_key' => 'charge:' . $ref,
                        'booking_id' => $booking->id,
                        'user_id' => $booking->customer_id,
                        'counterparty_user_id' => $booking->owner_id,
                        'external_reference' => $ref,
                        'meta' => [
                            'owner_amount' => (float) $booking->owner_amount,
                            'commission_amount' => (float) $booking->commission_amount,
                            'backfill' => true,
                        ],
                        'occurred_at' => $occurred,
                    ]);

                    if ($booking->payment_status === 'REMBOURSE') {
                        // Approximation : si rétention plateforme, refund = total - retained; sinon full.
                        $refundAmount = (float) $booking->total_price;
                        if ($booking->platform_retained_at) {
                            // Unknown exact refund — use total as upper bound only if no retention movement...
                            // Prefer: if commission is 0 and retained, we can't know split. Use full for charge;
                            // retention recorded separately; assume late cancel 0% if retained == total.
                        }
                        // For REMBOURSE bookings, if platform_retained_at set, refund = total - we can't know
                        // exact without logs. Heuristic: no funds_released, retained amount unknown.
                        // Store refund of total when no platform_retained_at; else skip exact and retain line.
                        if (!$booking->platform_retained_at) {
                            $record([
                                'type' => MoneyMovementType::CLIENT_REFUND,
                                'direction' => MoneyMovementDirection::OUT,
                                'amount' => $refundAmount,
                                'idempotency_key' => 'refund:' . $ref . ':' . number_format($refundAmount, 2, '.', ''),
                                'booking_id' => $booking->id,
                                'user_id' => $booking->customer_id,
                                'counterparty_user_id' => $booking->owner_id,
                                'external_reference' => $ref,
                                'meta' => ['backfill' => true],
                                'occurred_at' => $booking->cancelled_at ?? $occurred,
                            ]);
                        }
                    }

                    if ($booking->funds_released_at) {
                        $ownerAmount = (float) $booking->owner_amount;
                        $commissionAmount = (float) $booking->commission_amount;

                        if ($ownerAmount > 0) {
                            $record([
                                'type' => MoneyMovementType::OWNER_RELEASE,
                                'direction' => MoneyMovementDirection::INTERNAL,
                                'amount' => $ownerAmount,
                                'idempotency_key' => 'release:' . $booking->id . ':owner',
                                'booking_id' => $booking->id,
                                'user_id' => $booking->owner_id,
                                'counterparty_user_id' => $booking->customer_id,
                                'external_reference' => $ref,
                                'meta' => ['backfill' => true],
                                'occurred_at' => $booking->funds_released_at,
                            ]);
                        }

                        if ($commissionAmount > 0) {
                            $record([
                                'type' => MoneyMovementType::PLATFORM_COMMISSION,
                                'direction' => MoneyMovementDirection::INTERNAL,
                                'amount' => $commissionAmount,
                                'idempotency_key' => 'release:' . $booking->id . ':commission',
                                'booking_id' => $booking->id,
                                'user_id' => $booking->customer_id,
                                'counterparty_user_id' => $booking->owner_id,
                                'wallet_id' => $platform->wallet()->id,
                                'external_reference' => $ref,
                                'meta' => ['backfill' => true],
                                'occurred_at' => $booking->funds_released_at,
                            ]);
                        }
                    }

                    if ($booking->platform_retained_at) {
                        // Prefer known retention from total if fully non-refunded late cancel.
                        $retained = (float) $booking->total_price;
                        // If REMBOURSE partial unknown — skip if refund movement exists for same booking later.
                        $record([
                            'type' => MoneyMovementType::PLATFORM_RETENTION,
                            'direction' => MoneyMovementDirection::IN,
                            'amount' => $retained,
                            'idempotency_key' => 'retention:' . $booking->id,
                            'booking_id' => $booking->id,
                            'user_id' => $booking->customer_id,
                            'counterparty_user_id' => $booking->owner_id,
                            'wallet_id' => $platform->wallet()->id,
                            'external_reference' => $ref,
                            'meta' => ['backfill' => true, 'approx' => true],
                            'occurred_at' => $booking->platform_retained_at,
                        ]);
                    }
                }
            });

        $this->info('Backfill withdrawals…');

        Withdrawal::query()->orderBy('id')->chunkById(100, function ($withdrawals) use ($record) {
            foreach ($withdrawals as $withdrawal) {
                /** @var Withdrawal $withdrawal */
                $record([
                    'type' => MoneyMovementType::OWNER_WITHDRAWAL,
                    'direction' => MoneyMovementDirection::OUT,
                    'amount' => (float) $withdrawal->amount,
                    'idempotency_key' => 'withdrawal:' . $withdrawal->id . ':request',
                    'user_id' => $withdrawal->user_id,
                    'withdrawal_id' => $withdrawal->id,
                    'status' => in_array($withdrawal->status, [
                        WithdrawalEnum::PENDING->value,
                        WithdrawalEnum::PROCESSING->value,
                    ], true) ? MoneyMovementStatus::PENDING : MoneyMovementStatus::RECORDED,
                    'meta' => ['backfill' => true, 'status' => $withdrawal->status],
                    'occurred_at' => $withdrawal->created_at ?? now(),
                ]);

                if ($withdrawal->status === WithdrawalEnum::APPROVED->value) {
                    $record([
                        'type' => MoneyMovementType::OWNER_TRANSFER_SUCCESS,
                        'direction' => MoneyMovementDirection::OUT,
                        'amount' => (float) $withdrawal->amount,
                        'idempotency_key' => $withdrawal->transfer_reference
                            ? 'withdrawal:' . $withdrawal->id . ':transfer-success'
                            : 'withdrawal:' . $withdrawal->id . ':manual-success',
                        'user_id' => $withdrawal->user_id,
                        'withdrawal_id' => $withdrawal->id,
                        'external_reference' => $withdrawal->transfer_reference,
                        'meta' => ['backfill' => true],
                        'occurred_at' => $withdrawal->reviewed_at ?? $withdrawal->updated_at ?? now(),
                    ]);
                }

                if ($withdrawal->status === WithdrawalEnum::FAILED->value) {
                    $record([
                        'type' => MoneyMovementType::OWNER_TRANSFER_FAILED,
                        'direction' => MoneyMovementDirection::OUT,
                        'amount' => (float) $withdrawal->amount,
                        'idempotency_key' => 'withdrawal:' . $withdrawal->id . ':transfer-failed:backfill',
                        'user_id' => $withdrawal->user_id,
                        'withdrawal_id' => $withdrawal->id,
                        'external_reference' => $withdrawal->transfer_reference,
                        'status' => MoneyMovementStatus::FAILED,
                        'meta' => ['backfill' => true, 'reason' => $withdrawal->failure_reason],
                        'occurred_at' => $withdrawal->updated_at ?? now(),
                    ]);
                }
            }
        });

        $this->info(($dry ? '[dry-run] ' : '') . "Terminé. Mouvements créés/vus : {$created}");

        return self::SUCCESS;
    }
}
