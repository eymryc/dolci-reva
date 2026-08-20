<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Booking;
use Illuminate\Http\Request;
use App\Models\WalletTransaction;
use App\Services\PaystackService;
use App\Services\NotificationService;
use App\Services\BookingService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Requests\PaymentVerifyRequest;
use Symfony\Component\HttpFoundation\Response;
use App\Http\Requests\PaymentInitializeRequest;
use App\Enums\MoneyMovementDirection;
use App\Enums\MoneyMovementType;
use App\Services\MoneyMovementService;

class PaymentController extends Controller
{
    protected PaystackService $paystackService;
    protected NotificationService $notificationService;
    protected BookingService $bookingService;
    protected MoneyMovementService $moneyMovementService;

    public function __construct(
        PaystackService $paystackService,
        NotificationService $notificationService,
        BookingService $bookingService,
        MoneyMovementService $moneyMovementService
    ) {
        $this->paystackService = $paystackService;
        $this->notificationService = $notificationService;
        $this->bookingService = $bookingService;
        $this->moneyMovementService = $moneyMovementService;
    }

    /**
     * Initialize a payment transaction
     *
     * @param PaymentInitializeRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function initialize(PaymentInitializeRequest $request)
    {
        try {
            $user = Auth::user();
            $data = $request->validated();

            // Generate reference
            $reference = $this->paystackService->generateReference();

            // Prepare metadata
            $metadata = [
                'user_id' => $user->id,
                'user_email' => $user->email,
            ];

            // Booking payments: amount server-side only (total - credit), ownership required
            if (isset($data['booking_id'])) {
                $booking = Booking::findOrFail($data['booking_id']);

                if ((int) $booking->customer_id !== (int) $user->id && !$user->isAdmin()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Vous n\'êtes pas autorisé à payer cette réservation.',
                    ], Response::HTTP_FORBIDDEN);
                }

                if ($booking->payment_status === 'PAYE') {
                    return response()->json([
                        'success' => false,
                        'message' => 'Cette réservation est déjà payée.',
                    ], Response::HTTP_CONFLICT);
                }

                $creditApplied = (float) ($booking->credit_applied ?? 0);
                $amountDue = round(max(0, (float) $booking->total_price - $creditApplied), 2);

                if ($amountDue <= 0) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Aucun montant dû (déjà couvert par avoir).',
                    ], Response::HTTP_CONFLICT);
                }

                $data['amount'] = $amountDue;
                $metadata['booking_id'] = $booking->id;
                $metadata['booking_reference'] = $booking->booking_reference;
                $metadata['credit_applied'] = $creditApplied;
                $metadata['amount_due'] = $amountDue;
            }

            // Refuse open redirects: only allow our callback or omit
            $callbackUrl = $data['callback_url'] ?? null;
            if ($callbackUrl !== null) {
                $allowedHost = parse_url((string) config('app.url'), PHP_URL_HOST);
                $callbackHost = parse_url($callbackUrl, PHP_URL_HOST);
                if ($callbackHost !== $allowedHost) {
                    $callbackUrl = config('app.url') . '/api/payments/callback';
                }
            }

            // Initialize transaction with Paystack
            $paymentData = [
                'email' => $data['email'] ?? $user->email,
                'amount' => $data['amount'],
                'reference' => $reference,
                'callback_url' => $callbackUrl,
                'metadata' => $metadata,
                'currency' => $data['currency'] ?? 'XOF',
            ];

            $paystackResponse = $this->paystackService->initializeTransaction($paymentData);

            if ($paystackResponse['status']) {
                return response()->json([
                    'status' => Response::HTTP_OK,
                    'success' => true,
                    'message' => 'Payment initialized successfully',
                    'data' => [
                        'authorization_url' => $paystackResponse['data']['authorization_url'],
                        'access_code' => $paystackResponse['data']['access_code'],
                        'reference' => $paystackResponse['data']['reference'],
                        'public_key' => $this->paystackService->getPublicKey(),
                    ],
                ], Response::HTTP_OK);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to initialize payment',
            ], Response::HTTP_BAD_REQUEST);

        } catch (\Exception $e) {
            Log::error('Payment Initialize Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while initializing payment',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Verify a payment transaction
     *
     * @param PaymentVerifyRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function verify(PaymentVerifyRequest $request)
    {
        DB::beginTransaction();
        try {
            $reference = $request->input('reference');
            $user = Auth::user();

            // Verify transaction with Paystack
            $paystackResponse = $this->paystackService->verifyTransaction($reference);

            if (!$paystackResponse['status']) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment verification failed',
                ], Response::HTTP_BAD_REQUEST);
            }

            $transactionData = $paystackResponse['data'];
            $status = $transactionData['status'];
            $amount = $transactionData['amount'] / 100; // Convert from kobo to naira
            $metadata = $transactionData['metadata'] ?? [];

            // Check if transaction was successful
            if ($status === 'success') {
                // Check if this is a payment for a booking
                if (isset($metadata['booking_id'])) {
                    $booking = Booking::find($metadata['booking_id']);

                    if ($booking) {
                        // Idempotence : si déjà marqué payé, ne pas retraiter (le crédit
                        // du wallet propriétaire n'a lieu qu'au check-in, cf. escrow).
                        if ($booking->payment_status === 'PAYE') {
                            DB::rollBack();
                            return response()->json([
                                'success' => false,
                                'message' => 'This transaction has already been processed',
                            ], Response::HTTP_BAD_REQUEST);
                        }

                        $this->markBookingPaid($booking, $reference, (float) $amount);

                        DB::commit();

                        return response()->json([
                            'status' => Response::HTTP_OK,
                            'success' => true,
                            'message' => 'Payment verified and booking confirmed successfully',
                            'data' => [
                                'reference' => $reference,
                                'amount' => $amount,
                                'status' => $status,
                                'booking_id' => $booking->id,
                                'booking_status' => $booking->payment_status,
                                'transaction_data' => $transactionData,
                            ],
                        ], Response::HTTP_OK);
                    }
                }

                // Wallet top-up: credit only if metadata.user_id matches authenticated user
                $metaUserId = isset($metadata['user_id']) ? (int) $metadata['user_id'] : null;
                if ($metaUserId === null || $metaUserId !== (int) $user->id) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'Référence de paiement non associée à votre compte.',
                    ], Response::HTTP_FORBIDDEN);
                }

                $wallet = Wallet::firstOrCreate(
                    ['user_id' => $user->id],
                    ['balance' => 0]
                );

                // Check if this transaction has already been processed
                $existingTransaction = WalletTransaction::where('reason', 'LIKE', '%' . $reference . '%')
                    ->where('wallet_id', $wallet->id)
                    ->first();

                if ($existingTransaction) {
                    DB::rollBack();
                    return response()->json([
                        'success' => false,
                        'message' => 'This transaction has already been processed',
                    ], Response::HTTP_BAD_REQUEST);
                }

                // Credit wallet
                $wallet->increment('balance', $amount);

                // Create wallet transaction
                $wallet->transactions()->create([
                    'type' => 'CREDIT',
                    'amount' => $amount,
                    'reason' => 'Paystack Payment - Reference: ' . $reference,
                ]);

                DB::commit();

                return response()->json([
                    'status' => Response::HTTP_OK,
                    'success' => true,
                    'message' => 'Payment verified and wallet credited successfully',
                    'data' => [
                        'reference' => $reference,
                        'amount' => $amount,
                        'status' => $status,
                        'wallet_balance' => $wallet->fresh()->balance,
                    ],
                ], Response::HTTP_OK);
            }

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Payment verification failed: ' . $status,
                'data' => [
                    'reference' => $reference,
                    'status' => $status,
                ],
            ], Response::HTTP_BAD_REQUEST);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Payment Verify Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while verifying payment',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Handle Paystack webhook
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function webhook(Request $request)
    {
        try {
            $payload = $request->getContent();
            $signature = $request->header('X-Paystack-Signature');

            // Verify webhook signature
            if (!$this->paystackService->verifyWebhookSignature($payload, $signature)) {
                Log::warning('Invalid Paystack webhook signature');
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid signature',
                ], Response::HTTP_UNAUTHORIZED);
            }

            $event = json_decode($payload, true);

            // Handle different event types
            switch ($event['event']) {
                case 'charge.success':
                    $this->handleSuccessfulCharge($event['data']);
                    break;

                case 'charge.failed':
                    $this->handleFailedCharge($event['data']);
                    break;

                case 'transfer.success':
                    $this->handleSuccessfulTransfer($event['data']);
                    break;

                case 'transfer.failed':
                    $this->handleFailedTransfer($event['data']);
                    break;

                case 'transfer.reversed':
                    $this->handleReversedTransfer($event['data']);
                    break;

                default:
                    Log::info('Unhandled Paystack webhook event: ' . $event['event']);
            }

            return response()->json([
                'success' => true,
                'message' => 'Webhook processed successfully',
            ], Response::HTTP_OK);

        } catch (\Exception $e) {
            Log::error('Paystack Webhook Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'An error occurred while processing webhook',
                'error' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Point de retour navigateur après un paiement Paystack (redirection du
     * client, pas un webhook serveur-à-serveur). Dans la grande majorité des
     * cas le paiement a déjà été confirmé par le webhook avant que
     * l'utilisateur ne revienne ici, mais on revérifie quand même auprès de
     * Paystack pour ne jamais dépendre uniquement du timing du webhook, puis
     * on redirige vers l'app mobile (deep link) ou le web front-office selon
     * la plateforme d'origine (encodée dans callback_url par
     * BookingService::initializePaymentForBooking()).
     */
    public function callback(Request $request): \Illuminate\Http\RedirectResponse
    {
        $reference = $request->query('reference') ?? $request->query('trxref');
        $platform = $request->query('platform', 'web');

        $status = 'failed';
        $bookingId = null;
        $bookingReference = null;

        if ($reference) {
            try {
                $paystackResponse = $this->paystackService->verifyTransaction($reference);

                if ($paystackResponse['status'] && ($paystackResponse['data']['status'] ?? null) === 'success') {
                    $metadata = $paystackResponse['data']['metadata'] ?? [];
                    $booking = isset($metadata['booking_id']) ? Booking::find($metadata['booking_id']) : null;

                    if ($booking) {
                        // Idempotent : le webhook a généralement déjà traité le
                        // paiement avant que l'utilisateur ne revienne ici.
                        if ($booking->payment_status !== 'PAYE') {
                            DB::transaction(fn () => $this->markBookingPaid($booking, $reference));
                        }
                        $status = 'success';
                        $bookingId = $booking->id;
                        $bookingReference = $booking->booking_reference;
                    } else {
                        // Pas de booking associé : recharge de wallet. Le
                        // crédit est déjà géré par le webhook
                        // (handleSuccessfulCharge), indépendamment de ce
                        // retour navigateur — ici on ne fait que refléter
                        // le statut pour la redirection.
                        $status = 'success';
                    }
                }
            } catch (\Exception $e) {
                Log::error('Payment callback verification error: ' . $e->getMessage());
            }
        }

        if ($platform === 'mobile') {
            $query = http_build_query(array_filter([
                'status' => $status,
                'booking_reference' => $bookingReference,
            ]));

            return redirect('dolcireva://payment/callback?' . $query);
        }

        $frontendUrl = rtrim(config('app.frontend_url'), '/');

        if ($bookingId) {
            return redirect($frontendUrl . '/customer/bookings/' . $bookingId . '/receipt?status=' . $status);
        }

        // Pas de booking : le seul autre paiement possible aujourd'hui est
        // une recharge de wallet (cf. WalletController::recharge()).
        return redirect($frontendUrl . '/customer/wallet?payment=' . $status . '&reference=' . urlencode($reference ?? ''));
    }

    /**
     * Marque une réservation comme payée si elle ne l'est pas déjà
     * (idempotent). Le paiement est confirmé, mais les fonds restent
     * sécurisés par la plateforme : ils ne seront crédités au propriétaire
     * qu'au check-in du client (cf. BookingService::completeBooking()).
     * Partagé entre verify(), le webhook et callback() pour éviter de
     * tripler cette logique.
     */
    private function markBookingPaid(Booking $booking, string $reference, ?float $paystackAmount = null): void
    {
        $creditApplied = (float) ($booking->credit_applied ?? 0);
        $amountDue = round(max(0, (float) $booking->total_price - $creditApplied), 2);

        // Refuse underpayment / overpayment drift before marking PAYE
        if ($paystackAmount !== null) {
            $paid = round($paystackAmount, 2);
            if (abs($paid - $amountDue) > 1.0) {
                Log::error('Paystack amount mismatch for booking #' . $booking->id, [
                    'paid' => $paid,
                    'amount_due' => $amountDue,
                    'reference' => $reference,
                ]);
                throw new \RuntimeException(
                    'Montant Paystack incohérent avec le montant dû de la réservation.'
                );
            }
        }

        $booking->update([
            'payment_status' => 'PAYE',
            'payment_reference' => $reference,
        ]);

        $chargeAmount = $paystackAmount !== null
            ? round($paystackAmount, 2)
            : $amountDue;

        $this->moneyMovementService->record([
            'type' => MoneyMovementType::CLIENT_CHARGE,
            'direction' => MoneyMovementDirection::IN,
            'amount' => $chargeAmount,
            'idempotency_key' => 'charge:' . $reference,
            'booking_id' => $booking->id,
            'user_id' => $booking->customer_id,
            'counterparty_user_id' => $booking->owner_id,
            'external_reference' => $reference,
            'meta' => [
                'owner_amount' => (float) $booking->owner_amount,
                'commission_amount' => (float) $booking->commission_amount,
                'credit_applied' => $creditApplied,
                'total_price' => (float) $booking->total_price,
                'amount_due' => $amountDue,
            ],
            'occurred_at' => now(),
        ]);

        // Hospitality : confirmation auto dès paiement (pas d'attente owner).
        $this->bookingService->confirmHospitalityAfterPayment($booking->fresh());

        $this->notificationService->notifyPaymentHeld($booking->fresh());
    }

    /**
     * Handle successful charge event
     *
     * @param array $data
     * @return void
     */
    private function handleSuccessfulCharge(array $data): void
    {
        DB::beginTransaction();
        try {
            $reference      = $data['reference'];
            $amount         = $data['amount'] / 100; // Convert from kobo
            $metadata       = $data['metadata'] ?? [];
            $customerEmail  = $data['customer']['email'] ?? null;

            // Find user by email or metadata
            $userId = $metadata['user_id'] ?? null;
            if (!$userId && $customerEmail) {
                $user = User::where('email', $customerEmail)->first();
                $userId = $user?->id;
            }

            if (!$userId) {
                Log::warning('Could not find user for Paystack charge: ' . $reference);
                DB::rollBack();
                return;
            }

            // Check if this is a payment for a booking
            if (isset($metadata['booking_id'])) {
                $booking = Booking::find($metadata['booking_id']);

                if ($booking) {
                    // Idempotence : si déjà marqué payé, ne pas retraiter (le crédit
                    // du wallet propriétaire n'a lieu qu'au check-in, cf. escrow).
                    if ($booking->payment_status === 'PAYE') {
                        Log::info('Paystack charge already processed for booking: ' . $reference);
                        DB::rollBack();
                        return;
                    }

                    $this->markBookingPaid($booking, $reference, $amount);

                    DB::commit();
                    Log::info('Paystack charge processed successfully for booking #' . $booking->id . ': ' . $reference);

                    return;
                }
            }

            // Wallet top-up: only credit metadata.user_id (never guess from caller)
            if (empty($metadata['user_id'])) {
                Log::warning('Wallet top-up without metadata.user_id: ' . $reference);
                DB::rollBack();
                return;
            }

            $userId = (int) $metadata['user_id'];

            // If not a booking payment, credit customer's wallet (for wallet top-ups)
            $wallet = Wallet::firstOrCreate(
                ['user_id' => $userId],
                ['balance' => 0]
            );

            // Check if already processed
            $existingTransaction = WalletTransaction::where('reason', 'LIKE', '%' . $reference . '%')
                ->where('wallet_id', $wallet->id)
                ->first();

            if ($existingTransaction) {
                Log::info('Paystack charge already processed: ' . $reference);
                DB::rollBack();
                return;
            }

            // Credit wallet
            $wallet->increment('balance', $amount);

            // Create transaction
            $wallet->transactions()->create([
                'type' => 'CREDIT',
                'amount' => $amount,
                'reason' => 'Paystack Payment - Reference: ' . $reference,
            ]);

            $this->moneyMovementService->record([
                'type' => MoneyMovementType::WALLET_RECHARGE,
                'direction' => MoneyMovementDirection::IN,
                'amount' => $amount,
                'idempotency_key' => 'recharge:' . $reference,
                'user_id' => $userId,
                'wallet_id' => $wallet->id,
                'external_reference' => $reference,
                'occurred_at' => now(),
            ]);

            DB::commit();
            Log::info('Paystack charge processed successfully (wallet top-up): ' . $reference);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error handling successful charge: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Handle failed charge event
     *
     * @param array $data
     * @return void
     */
    private function handleFailedCharge(array $data): void
    {
        $reference = $data['reference'];
        $metadata = $data['metadata'] ?? [];

        // Update booking payment status if applicable
        if (isset($metadata['booking_id'])) {
            $booking = Booking::find($metadata['booking_id']);
            if ($booking) {
                $booking->update(['payment_status' => 'ECHEC']);
            }
        }

        Log::info('Paystack charge failed: ' . $reference);
    }

    /**
     * Handle successful transfer event (withdrawal payout).
     */
    private function handleSuccessfulTransfer(array $data): void
    {
        $reference = $data['reference'] ?? null;
        if (!$reference) {
            Log::warning('Paystack transfer.success without reference');
            return;
        }

        app(\App\Repositories\WithdrawalRepository::class)->markTransferSuccess($reference);
        Log::info('Paystack transfer successful: ' . $reference);
    }

    /**
     * Handle failed transfer event — FAILED + recredit wallet.
     */
    private function handleFailedTransfer(array $data): void
    {
        $reference = $data['reference'] ?? null;
        if (!$reference) {
            Log::warning('Paystack transfer.failed without reference');
            return;
        }

        $reason = $data['reason'] ?? ($data['message'] ?? 'transfer.failed');
        app(\App\Repositories\WithdrawalRepository::class)->markTransferFailed($reference, is_string($reason) ? $reason : 'transfer.failed');
        Log::info('Paystack transfer failed: ' . $reference);
    }

    /**
     * Handle reversed transfer — FAILED + recredit wallet.
     */
    private function handleReversedTransfer(array $data): void
    {
        $reference = $data['reference'] ?? null;
        if (!$reference) {
            Log::warning('Paystack transfer.reversed without reference');
            return;
        }

        app(\App\Repositories\WithdrawalRepository::class)->markTransferFailed($reference, 'transfer.reversed');
        Log::info('Paystack transfer reversed: ' . $reference);
    }

    /**
     * Valider le QR code scanné sur une réservation (check-in) et la marquer
     * comme terminée. Réservé au propriétaire de l'établissement concerné ou
     * à un admin.
     */
    public function scanQrCode(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->validate(['token' => 'required|string']);

        try {
            $decoded = app(\App\Services\BookingQrService::class)->parse($request->input('token'));
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        $booking = Booking::find($decoded['booking_id']);

        if (!$booking || $booking->booking_reference !== $decoded['booking_reference']) {
            return response()->json([
                'success' => false,
                'message' => 'Réservation introuvable pour ce QR code.',
            ], Response::HTTP_NOT_FOUND);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (!$user->isAdmin() && $booking->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à valider cette réservation.',
            ], Response::HTTP_FORBIDDEN);
        }

        if ($booking->payment_status !== 'PAYE') {
            return response()->json([
                'success' => false,
                'message' => 'Cette réservation n\'a pas encore été payée.',
            ], Response::HTTP_CONFLICT);
        }

        try {
            $booking = $this->bookingService->completeBooking([], $booking->id);

            return response()->json([
                'success' => true,
                'message' => 'Réservation validée avec succès.',
                'data' => [
                    'booking_id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'status' => $booking->status,
                ],
            ]);
        } catch (\Exception $exception) {
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage(),
            ], Response::HTTP_CONFLICT);
        }
    }
}

