<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\WalletRequest;
use App\Http\Resources\WalletResource;
use App\Services\WalletService;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class WalletController extends Controller
{
    /**
     * @var WalletService
     */
    protected WalletService $walletService;

    /**
     * @var PaystackService
     */
    protected PaystackService $paystackService;

    /**
     * DummyModel Constructor
     *
     * @param WalletService $walletService
     *
     */
    public function __construct(WalletService $walletService, PaystackService $paystackService)
    {
        $this->walletService = $walletService;
        $this->paystackService = $paystackService;
    }

    public function index(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        return WalletResource::collection($this->walletService->getAll());
    }

    /**
     * Initialise une recharge de wallet via Paystack. Le crédit effectif est
     * géré par PaymentController::handleSuccessfulCharge() au webhook (aucun
     * booking_id en métadonnée => traité comme une recharge), pas ici.
     */
    public function recharge(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'amount' => 'required|numeric|min:100',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();
        $platform = $request->header('X-Client-Platform') === 'mobile' ? 'mobile' : 'web';

        try {
            $reference = $this->paystackService->generateReference();

            $paystackResponse = $this->paystackService->initializeTransaction([
                'email' => $user->email,
                'amount' => (float) $request->input('amount'),
                'reference' => $reference,
                'callback_url' => config('app.url') . '/api/payments/callback?platform=' . $platform,
                'metadata' => [
                    'user_id' => $user->id,
                ],
                'currency' => 'XOF',
            ]);

            if (!$paystackResponse['status'] || !isset($paystackResponse['data']['authorization_url'])) {
                return response()->json([
                    'success' => false,
                    'message' => "Échec de l'initialisation du paiement.",
                ], Response::HTTP_BAD_REQUEST);
            }

            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Redirection vers le paiement...',
                'data' => [
                    'payment_url' => $paystackResponse['data']['authorization_url'],
                    'reference' => $reference,
                    'amount' => (float) $request->input('amount'),
                ],
            ], Response::HTTP_OK);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'initialisation de la recharge.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function store(WalletRequest $request): \Illuminate\Http\JsonResponse
    {
        return $this->systemManagedResponse();
    }

    public function show(int $id): WalletResource|\Illuminate\Http\JsonResponse
    {
        $wallet = $this->walletService->getById($id);
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$wallet || (!$user->isAdmin() && $wallet->user_id !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Wallet introuvable.',
            ], Response::HTTP_NOT_FOUND);
        }

        return WalletResource::make($wallet);
    }

    public function update(WalletRequest $request, int $id): \Illuminate\Http\JsonResponse
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
            'message' => 'Wallets are system-managed and cannot be modified directly.',
        ], Response::HTTP_FORBIDDEN);
    }
}
