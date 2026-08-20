<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Services\CustomerCreditService;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CustomerCreditController extends Controller
{
    public function __construct(
        protected CustomerCreditService $customerCreditService
    ) {
    }

    public function index(): \Illuminate\Http\JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $credits = $this->customerCreditService->activeCredits($user->id);
        $balance = $this->customerCreditService->availableBalance($user->id);

        return response()->json([
            'status' => Response::HTTP_OK,
            'success' => true,
            'data' => [
                'balance' => $balance,
                'bonus_percent' => $this->customerCreditService->bonusPercent(),
                'enabled' => $this->customerCreditService->isEnabled(),
                'currency' => config('booking.currency', 'XOF'),
                'credits' => array_map(static function ($credit) {
                    return [
                        'id' => $credit->id,
                        'amount' => (float) $credit->amount,
                        'remaining_amount' => (float) $credit->remaining_amount,
                        'bonus_amount' => (float) $credit->bonus_amount,
                        'source_booking_id' => $credit->source_booking_id,
                        'expires_at' => $credit->expires_at,
                        'status' => $credit->status,
                        'created_at' => $credit->created_at,
                    ];
                }, $credits),
            ],
        ]);
    }
}
