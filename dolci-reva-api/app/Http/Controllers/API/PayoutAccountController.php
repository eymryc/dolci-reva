<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\PayoutAccountRequest;
use App\Http\Resources\PayoutAccountResource;
use App\Models\PayoutAccount;
use App\Services\PaystackService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class PayoutAccountController extends Controller
{
    public function __construct(
        protected PaystackService $paystackService
    ) {
    }

    /**
     * Compte de versement du propriétaire authentifié.
     */
    public function show(): \Illuminate\Http\JsonResponse
    {
        $account = PayoutAccount::where('user_id', Auth::id())->first();

        if (!$account) {
            return response()->json([
                'success' => true,
                'data' => null,
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => new PayoutAccountResource($account),
        ]);
    }

    /**
     * Upsert du compte de versement. Tente de créer un destinataire Paystack ;
     * en cas d'échec (ex. mobile_money XOF non supporté), le compte est
     * quand même enregistré avec is_verified=false pour permettre l'approbation manuelle.
     */
    public function upsert(PayoutAccountRequest $request): \Illuminate\Http\JsonResponse
    {
        $user = Auth::user();
        $data = $request->validated();
        $currency = strtoupper($data['currency'] ?? (string) config('services.payout.currency', 'XOF'));
        $channel = $data['channel'];

        [$recipientType, $bankCode] = $this->resolvePaystackMapping($channel, $data);

        $recipientCode = null;
        $isVerified = false;

        try {
            if ($this->paystackService->isConfigured()) {
                $payload = [
                    'type' => $recipientType,
                    'name' => $data['account_name'],
                    'account_number' => $data['account_number'],
                    'bank_code' => $bankCode,
                    'currency' => $currency,
                    'metadata' => [
                        'user_id' => $user->id,
                        'channel' => $channel,
                    ],
                ];

                $response = $this->paystackService->createTransferRecipient($payload);
                $recipientCode = $response['data']['recipient_code'] ?? null;
                $isVerified = $recipientCode !== null;
            }
        } catch (\Throwable $e) {
            Log::warning('Paystack transfer recipient creation failed — saving payout account unverified', [
                'user_id' => $user->id,
                'channel' => $channel,
                'error' => $e->getMessage(),
            ]);
        }

        $account = PayoutAccount::updateOrCreate(
            ['user_id' => $user->id],
            [
                'channel' => $channel,
                'account_name' => $data['account_name'],
                'account_number' => $data['account_number'],
                'bank_code' => $bankCode ?? ($data['bank_code'] ?? null),
                'bank_name' => $data['bank_name'] ?? null,
                'currency' => $currency,
                'paystack_recipient_code' => $recipientCode,
                'paystack_recipient_type' => $recipientType,
                'is_verified' => $isVerified,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => $isVerified
                ? 'Compte de versement enregistré et vérifié auprès de Paystack.'
                : 'Compte de versement enregistré. Destinataire Paystack non créé — les retraits nécessiteront une approbation manuelle.',
            'data' => new PayoutAccountResource($account),
        ], Response::HTTP_OK);
    }

    /**
     * Liste des banques / opérateurs Paystack (pour le formulaire UI).
     */
    public function banks(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate([
            'currency' => 'nullable|string|size:3',
            'type' => 'nullable|string|in:mobile_money,nuban,ghipss,basa,ghana,kenya',
        ]);

        try {
            $currency = strtoupper($request->query('currency', (string) config('services.payout.currency', 'XOF')));
            $type = $request->query('type');

            $response = $this->paystackService->listBanks($currency, $type);

            return response()->json([
                'success' => true,
                'data' => $response['data'] ?? [],
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_GATEWAY);
        }
    }

    /**
     * @return array{0: string, 1: string|null} [paystack_type, bank_code]
     */
    private function resolvePaystackMapping(string $channel, array $data): array
    {
        if ($channel === 'bank') {
            return ['nuban', $data['bank_code'] ?? null];
        }

        $codes = config('services.payout.channel_bank_codes', []);
        $bankCode = $data['bank_code'] ?? ($codes[$channel] ?? strtoupper($channel));

        return ['mobile_money', $bankCode];
    }
}
