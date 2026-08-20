<?php

namespace App\Http\Controllers\API;

use App\Enums\MoneyMovementType;
use App\Enums\WithdrawalEnum;
use App\Http\Controllers\Controller;
use App\Http\Resources\MoneyMovementResource;
use App\Models\Booking;
use App\Models\MoneyMovement;
use App\Models\Withdrawal;
use App\Services\PlatformLedgerService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class FinanceController extends Controller
{
    public function __construct(
        protected PlatformLedgerService $platformLedgerService
    ) {
    }

    public function movements(Request $request): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        $query = MoneyMovement::query()
            ->with([
                'user:id,first_name,last_name,email',
                'counterparty:id,first_name,last_name,email',
                'booking:id,booking_reference,status,payment_status,total_price',
            ])
            ->latest('occurred_at');

        if ($type = $request->query('type')) {
            $query->where('type', $type);
        }

        if ($bookingId = $request->query('booking_id')) {
            $query->where('booking_id', $bookingId);
        }

        if ($userId = $request->query('user_id')) {
            $query->where(function ($q) use ($userId) {
                $q->where('user_id', $userId)->orWhere('counterparty_user_id', $userId);
            });
        }

        if ($ref = $request->query('external_reference')) {
            $query->where('external_reference', 'like', '%' . $ref . '%');
        }

        if ($from = $request->query('from')) {
            $query->where('occurred_at', '>=', $from);
        }

        if ($to = $request->query('to')) {
            $query->where('occurred_at', '<=', $to);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $perPage = min(100, max(1, (int) $request->query('per_page', 20)));

        return MoneyMovementResource::collection($query->paginate($perPage));
    }

    public function summary(): \Illuminate\Http\JsonResponse
    {
        $gmv = (float) MoneyMovement::where('type', MoneyMovementType::CLIENT_CHARGE->value)->sum('amount');
        $refunded = (float) MoneyMovement::where('type', MoneyMovementType::CLIENT_REFUND->value)
            ->where('status', '!=', 'FAILED')
            ->sum('amount');
        $commissions = (float) MoneyMovement::where('type', MoneyMovementType::PLATFORM_COMMISSION->value)->sum('amount');
        $retentions = (float) MoneyMovement::where('type', MoneyMovementType::PLATFORM_RETENTION->value)->sum('amount');
        $ownerReleased = (float) MoneyMovement::where('type', MoneyMovementType::OWNER_RELEASE->value)->sum('amount');

        $escrowOpen = (float) Booking::query()
            ->where('payment_status', 'PAYE')
            ->whereNull('funds_released_at')
            ->where('status', '!=', 'ANNULE')
            ->sum('total_price');

        $escrowCount = Booking::query()
            ->where('payment_status', 'PAYE')
            ->whereNull('funds_released_at')
            ->where('status', '!=', 'ANNULE')
            ->count();

        $pendingWithdrawals = Withdrawal::whereIn('status', [
            WithdrawalEnum::PENDING->value,
            WithdrawalEnum::FAILED->value,
        ])->count();

        $processingWithdrawals = Withdrawal::where('status', WithdrawalEnum::PROCESSING->value)->count();

        $platformWallet = $this->platformLedgerService->wallet();

        return response()->json([
            'status' => Response::HTTP_OK,
            'success' => true,
            'data' => [
                'gmv' => $gmv,
                'refunded' => $refunded,
                'net_collected' => round($gmv - $refunded, 2),
                'commissions' => $commissions,
                'retentions' => $retentions,
                'owner_released' => $ownerReleased,
                'escrow_open_amount' => $escrowOpen,
                'escrow_open_count' => $escrowCount,
                'pending_withdrawals' => $pendingWithdrawals,
                'processing_withdrawals' => $processingWithdrawals,
                'platform_balance' => (float) $platformWallet->balance,
                'currency' => config('services.payout.currency', 'XOF'),
            ],
        ]);
    }

    /**
     * Réservations encore en séquestre (payées, non libérées).
     */
    public function escrow(Request $request): \Illuminate\Http\JsonResponse
    {
        $perPage = min(100, max(1, (int) $request->query('per_page', 20)));

        $bookings = Booking::query()
            ->with(['customer:id,first_name,last_name,email', 'owner:id,first_name,last_name,email'])
            ->where('payment_status', 'PAYE')
            ->whereNull('funds_released_at')
            ->where('status', '!=', 'ANNULE')
            ->latest('id')
            ->paginate($perPage);

        return response()->json([
            'status' => Response::HTTP_OK,
            'success' => true,
            'data' => $bookings->getCollection()->map(fn (Booking $b) => [
                'id' => $b->id,
                'booking_reference' => $b->booking_reference,
                'status' => $b->status,
                'payment_status' => $b->payment_status,
                'total_price' => (float) $b->total_price,
                'owner_amount' => (float) $b->owner_amount,
                'commission_amount' => (float) $b->commission_amount,
                'payment_reference' => $b->payment_reference,
                'start_date' => $b->start_date,
                'created_at' => $b->created_at,
                'customer' => $b->customer ? [
                    'id' => $b->customer->id,
                    'first_name' => $b->customer->first_name,
                    'last_name' => $b->customer->last_name,
                    'email' => $b->customer->email,
                ] : null,
                'owner' => $b->owner ? [
                    'id' => $b->owner->id,
                    'first_name' => $b->owner->first_name,
                    'last_name' => $b->owner->last_name,
                    'email' => $b->owner->email,
                ] : null,
            ]),
            'meta' => [
                'current_page' => $bookings->currentPage(),
                'last_page' => $bookings->lastPage(),
                'per_page' => $bookings->perPage(),
                'total' => $bookings->total(),
            ],
        ]);
    }
}
