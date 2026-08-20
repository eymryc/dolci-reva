<?php

namespace App\Http\Controllers\API;

use App\Enums\WithdrawalEnum;
use App\Http\Controllers\Controller;
use App\Models\Withdrawal;
use App\Services\PlatformLedgerService;
use Symfony\Component\HttpFoundation\Response;

class PlatformWalletController extends Controller
{
    public function __construct(
        protected PlatformLedgerService $platformLedgerService
    ) {
    }

    /**
     * Solde commissions / rétentions plateforme + file de retraits (admin).
     */
    public function show(): \Illuminate\Http\JsonResponse
    {
        $wallet = $this->platformLedgerService->wallet();

        $pendingWithdrawals = Withdrawal::query()
            ->whereIn('status', [
                WithdrawalEnum::PENDING->value,
                WithdrawalEnum::FAILED->value,
            ])
            ->count();

        $processingWithdrawals = Withdrawal::query()
            ->where('status', WithdrawalEnum::PROCESSING->value)
            ->count();

        return response()->json([
            'status' => Response::HTTP_OK,
            'success' => true,
            'data' => [
                'id' => $wallet->id,
                'balance' => (float) $wallet->balance,
                'currency' => config('services.payout.currency', 'XOF'),
                'pending_withdrawals' => $pendingWithdrawals,
                'processing_withdrawals' => $processingWithdrawals,
            ],
        ], Response::HTTP_OK);
    }
}
