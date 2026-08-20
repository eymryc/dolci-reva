<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\WalletTransactionRequest;
use App\Http\Resources\WalletTransactionResource;
use App\Services\WalletTransactionService;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class WalletTransactionController extends Controller
{
    /**
     * @var WalletTransactionService
     */
    protected WalletTransactionService $walletTransactionService;

    /**
     * DummyModel Constructor
     *
     * @param WalletTransactionService $walletTransactionService
     *
     */
    public function __construct(WalletTransactionService $walletTransactionService)
    {
        $this->walletTransactionService = $walletTransactionService;
    }

    public function index(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return WalletTransactionResource::collection($this->walletTransactionService->getAll());
    }

    public function store(WalletTransactionRequest $request): \Illuminate\Http\JsonResponse
    {
        return $this->systemManagedResponse();
    }

    public function show(int $id): WalletTransactionResource|\Illuminate\Http\JsonResponse
    {
        $transaction = $this->walletTransactionService->getById($id);
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$transaction || (!$user->isAdmin() && $transaction->wallet?->user_id !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Transaction introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        return WalletTransactionResource::make($transaction);
    }

    public function update(WalletTransactionRequest $request, int $id): \Illuminate\Http\JsonResponse
    {
        return $this->systemManagedResponse();
    }

    public function destroy(int $id): \Illuminate\Http\JsonResponse
    {
        return $this->systemManagedResponse();
    }

    private function systemManagedResponse(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Wallet transactions are system-managed and cannot be modified directly.',
        ], Response::HTTP_FORBIDDEN);
    }
}
