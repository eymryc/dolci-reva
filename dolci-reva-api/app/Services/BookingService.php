<?php
namespace App\Services;

use Exception;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Booking;
use App\Models\Residence;
use InvalidArgumentException;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Repositories\BookingRepository;
use App\Enums\MoneyMovementDirection;
use App\Enums\MoneyMovementStatus;
use App\Enums\MoneyMovementType;

class BookingService
{
	/**
     * @var BookingRepository $bookingRepository
     */
    protected $bookingRepository;
    
    /**
     * @var AvailabilityService $availabilityService
     */
    protected $availabilityService;
    
    /**
     * @var PricingService $pricingService
     */
    protected $pricingService;
    
    /**
     * @var NotificationService $notificationService
     */
    protected $notificationService;

    /**
     * @var PaystackService $paystackService
     */
    protected $paystackService;

    /**
     * @var PlatformLedgerService $platformLedgerService
     */
    protected $platformLedgerService;

    /**
     * @var MoneyMovementService $moneyMovementService
     */
    protected $moneyMovementService;

    /**
     * @var CustomerCreditService $customerCreditService
     */
    protected $customerCreditService;

    /**
     * Constructor.
     *
     * @param BookingRepository $bookingRepository
     * @param AvailabilityService $availabilityService
     * @param PricingService $pricingService
     * @param NotificationService $notificationService
     * @param PaystackService $paystackService
     * @param PlatformLedgerService $platformLedgerService
     * @param MoneyMovementService $moneyMovementService
     * @param CustomerCreditService $customerCreditService
     */
    public function __construct(
        BookingRepository $bookingRepository,
        AvailabilityService $availabilityService,
        PricingService $pricingService,
        NotificationService $notificationService,
        PaystackService $paystackService,
        PlatformLedgerService $platformLedgerService,
        MoneyMovementService $moneyMovementService,
        CustomerCreditService $customerCreditService
    ) {
        $this->bookingRepository = $bookingRepository;
        $this->availabilityService = $availabilityService;
        $this->pricingService = $pricingService;
        $this->notificationService = $notificationService;
        $this->paystackService = $paystackService;
        $this->platformLedgerService = $platformLedgerService;
        $this->moneyMovementService = $moneyMovementService;
        $this->customerCreditService = $customerCreditService;
    }

    /**
     * Get all bookingRepository.
     *
     * @return String
     */
    public function getAll()
    {
        return $this->bookingRepository->all();
    }

    /**
     * Get bookingRepository with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\Paginator
     */
    public function getAllWithPagination(int $perPage = 15)
    {
        return $this->bookingRepository->paginate($perPage);
    }

    /**
     * Get bookingRepository by id.
     *
     * @param $id
     * @return String
     */
    public function getById(int $id)
    {
        return $this->bookingRepository->getById($id);
    }

    /**
     * Create a new residence booking.
     *
     * @param array $data
     * @param int $residenceId
     * @return Booking
     */
    public function saveResidenceBooking(array $data, int $residenceId)
    {
        DB::beginTransaction();
        try {

            // Get the residence by ID
            $residence = Residence::findOrFail($residenceId);

            if (!$this->availabilityService->checkCapacity($residence, (int) $data['guests'])) {
                throw new InvalidArgumentException(
                    'Le nombre de Personnes dépasse la capacité de cette résidence.'
                );
            }

            // Empêcher un double-booking sur les mêmes dates
            $this->assertAvailable('App\\Models\\Residence', $residenceId, $data['start_date'], $data['end_date']);

            // Préparer les données de réservation
            $totalPrice = $this->calculatePrice($residence, $data['start_date'], $data['end_date']);
            $commissionAmount = $this->calculateCommission($totalPrice, \App\Models\Residence::class);
            $ownerAmount = $totalPrice - $commissionAmount;

            // Data
            $bookingData = [
                'customer_id'           => $data['customer_id'],
                'owner_id'              => $residence->owner_id,
                'bookable_type'         => 'App\\Models\\Residence',
                'bookable_id'           => $residenceId,
                'start_date'            => $data['start_date'],
                'end_date'              => $data['end_date'],
                'guests'                => $data['guests'],
                'notes'                 => $data['notes'] ?? null,
                'booking_reference'     => $this->generateBookingReference(),
                'total_price'           => $totalPrice,
                'commission_amount'     => $commissionAmount,
                'owner_amount'          => $ownerAmount,
                'status'                => 'EN_ATTENTE',
                'payment_status'        => 'EN_ATTENTE'
            ];
            
            // Save the booking
            $booking = $this->bookingRepository->save($bookingData);
            
            // Ensure the owner has a wallet and create it if it doesn't exist
            $this->ensureOwnerWallet($residence->owner_id, $ownerAmount, $booking->id);
            
            // Commit the transaction
            DB::commit();

            $this->notificationService->notifyBookingCreated($booking);

            // Initialize Paystack payment
            $customer = User::findOrFail($data['customer_id']);
            $paymentUrl = $this->initializePaymentForBooking($booking, $customer->email, $totalPrice, $data['platform'] ?? 'web');

            // Return the booking with payment URL
            return [
                'booking' => $booking,
                'payment_url' => $paymentUrl
            ];
            
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to create residence booking: ' . $e->getMessage());
        }
    }

    /**
     * Create a new hotel booking.
     *
     * @param array $data
     * @param int $hotelId
     * @return Booking
     */
    public function saveHotelBooking(array $data, int $hotelId)
    {
        DB::beginTransaction();
        try {
            $hotel = \App\Models\Hotel::findOrFail($hotelId);

            /** @var \App\Models\HotelRoom $hotelRoom */
            $hotelRoom = \App\Models\HotelRoom::where('hotel_id', $hotelId)->findOrFail($data['hotel_room_id']);

            if (!$hotelRoom->is_active || !$hotelRoom->is_available) {
                throw new \App\Exceptions\BookingConflictException('Cette chambre n\'est plus disponible à la réservation.');
            }

            if (!$this->availabilityService->checkCapacity($hotelRoom, (int) $data['guests'])) {
                throw new InvalidArgumentException(
                    'Le nombre de Personnes dépasse la capacité de cette chambre.'
                );
            }

            // Empêcher un double-booking sur la chambre demandée
            $this->assertRoomAvailable($hotelRoom->id, $data['start_date'], $data['end_date']);

            // Préparer les données de réservation
            $totalPrice = $this->calculateHotelPrice($hotelRoom, $data['start_date'], $data['end_date']);
            $commissionAmount = $this->calculateCommission($totalPrice, \App\Models\Hotel::class);
            $ownerAmount = $totalPrice - $commissionAmount;

            $bookingData = [
                'customer_id' => $data['customer_id'],
                'owner_id' => $hotel->owner_id,
                'bookable_type' => 'App\\Models\\Hotel',
                'bookable_id' => $hotelId,
                'hotel_room_id' => $hotelRoom->id,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'guests' => $data['guests'],
                'notes' => $data['notes'] ?? null,
                'booking_reference' => $this->generateBookingReference(),
                'total_price' => $totalPrice,
                'commission_amount' => $commissionAmount,
                'owner_amount' => $ownerAmount,
                'status' => 'EN_ATTENTE',
                'payment_status' => 'EN_ATTENTE'
            ];
            
            // Créer la réservation
            $booking = $this->bookingRepository->save($bookingData);
            
            // Créer/initialiser le wallet du owner s'il n'en a pas
            $this->ensureOwnerWallet($hotel->owner_id, $ownerAmount, $booking->id);
            
            DB::commit();

            $this->notificationService->notifyBookingCreated($booking);

            // Initialize Paystack payment
            $customer = \App\Models\User::findOrFail($data['customer_id']);
            $paymentUrl = $this->initializePaymentForBooking($booking, $customer->email, $totalPrice, $data['platform'] ?? 'web');

            // Return the booking with payment URL
            return [
                'booking' => $booking,
                'payment_url' => $paymentUrl
            ];
            
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to create hotel booking: ' . $e->getMessage());
        }
    }

    /**
     * Confirm a booking.
     *
     * @param array $data
     * @param int $bookingId
     * @return Booking
     */
    public function confirmBooking(array $data, int $bookingId)
    {
        DB::beginTransaction();
        try {
            $booking = $this->bookingRepository->getById($bookingId);
            
            if (!$booking) {
                throw new InvalidArgumentException('Booking not found');
            }
            
            // Vérifier que la réservation peut être confirmée
            if ($booking->status !== 'EN_ATTENTE') {
                throw new InvalidArgumentException('Cette réservation ne peut pas être confirmée.');
            }
            
            // Mettre à jour la réservation
            $updateData = [
                'status' => 'CONFIRME',
                'confirmed_at' => now(),
                'notes' => $data['notes'] ?? $booking->notes
            ];
            
            $booking = $this->bookingRepository->update($updateData, $bookingId);
            
            // La disponibilité se base sur les dates de booking (unavailable_dates),
            // pas sur un flag global is_available qui bloquerait toute la résidence.
            DB::commit();

            $this->notificationService->notifyBookingConfirmed($booking);

            return $booking;

        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to confirm booking: ' . $e->getMessage());
        }
    }

    /**
     * Cancel a booking.
     *
     * @param array $data
     * @param int $bookingId
     * @return Booking
     */
    public function cancelBooking(array $data, int $bookingId)
    {
        DB::beginTransaction();
        try {
            $booking = $this->bookingRepository->getById($bookingId);
            
            if (!$booking) {
                throw new InvalidArgumentException('Booking not found');
            }
            
            // Vérifier que la réservation peut être annulée
            if (in_array($booking->status, ['ANNULE', 'COMPLETE'])) {
                throw new InvalidArgumentException('Cette réservation ne peut pas être annulée.');
            }
            
            $wasConfirmed = $booking->status === 'CONFIRME';
            $wasPaidAndHeld = $booking->payment_status === 'PAYE' && !$booking->funds_released_at;
            $refundPlan = $wasPaidAndHeld ? $this->resolveCancellationRefund($booking) : null;

            // Mettre à jour la réservation
            $updateData = [
                'status' => 'ANNULE',
                'cancelled_at' => now(),
                'cancellation_reason' => $data['cancellation_reason']
                    ?? 'Annulation demandée par le client',
            ];

            $booking = $this->bookingRepository->update($updateData, $bookingId);

            // Remettre la résidence listée si elle avait été marquée indisponible
            // (anciens bookings) — la dispo réelle repose sur les dates.
            if ($wasConfirmed && $booking->bookable_type === 'App\\Models\\Residence') {
                $residence = $booking->bookable;
                if ($residence && !$residence->is_available) {
                    $hasOtherActive = $residence->bookings()
                        ->where('id', '!=', $booking->id)
                        ->where('status', '!=', 'ANNULE')
                        ->where('end_date', '>=', now()->toDateString())
                        ->exists();
                    if (!$hasOtherActive) {
                        $residence->update(['is_available' => true]);
                    }
                }
            }

            DB::commit();

            // Séquestre : remboursement Paystack OU avoir Dolci + rétention plateforme.
            $settlementMeta = null;
            if ($wasPaidAndHeld && $refundPlan) {
                $refundAmount = (float) $refundPlan['amount'];
                // Seul le client (ou admin) peut choisir l'avoir ; le proprio force Paystack
                $actor = Auth::user();
                $wantsCredit = ($data['settlement'] ?? 'paystack') === 'credit';
                $canChooseCredit = $actor && (
                    $actor->isAdmin()
                    || (int) $actor->id === (int) $booking->customer_id
                );
                $settlement = ($wantsCredit && $canChooseCredit) ? 'credit' : 'paystack';

                if ($refundAmount > 0) {
                    if ($settlement === 'credit' && $this->customerCreditService->isEnabled()) {
                        $issued = $this->customerCreditService->issueFromCancellation($booking->fresh(), $refundAmount);
                        $booking->update(['payment_status' => 'REMBOURSE']);
                        $settlementMeta = [
                            'settlement' => 'credit',
                            'refund_amount' => $refundAmount,
                            'credit_issued' => $issued['credited_amount'],
                            'credit_bonus' => $issued['bonus_amount'],
                            'credit_id' => $issued['credit']->id,
                        ];
                    } else {
                        $this->refundBooking($booking, $refundAmount);
                        $settlementMeta = [
                            'settlement' => 'paystack',
                            'refund_amount' => $refundAmount,
                        ];
                    }
                } else {
                    \Illuminate\Support\Facades\Log::info(
                        'Annulation hors délai sans remboursement pour booking #' . $booking->id
                    );
                    $settlementMeta = [
                        'settlement' => 'none',
                        'refund_amount' => 0,
                    ];
                }

                $retained = round((float) $booking->total_price - $refundAmount, 2);
                if ($retained > 0) {
                    $this->creditPlatformRetention($booking->fresh(), $retained);
                }
            } elseif ((float) $booking->credit_applied > 0 && in_array($booking->payment_status, ['EN_ATTENTE', 'ECHEC'], true)) {
                // Annulation avant paiement : restituer l'avoir consommé.
                $this->customerCreditService->restoreForBooking($booking->fresh());
            }

            $this->notificationService->notifyBookingCancelled($booking, $data['cancellation_reason'] ?? null);

            $booking = $booking->fresh();
            if ($settlementMeta) {
                $booking->setAttribute('settlement_result', $settlementMeta);
            }

            return $booking;

        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to cancel booking: ' . $e->getMessage());
        }
    }

    /**
     * Complete a booking.
     *
     * @param array $data
     * @param int $bookingId
     * @return Booking
     */
    public function completeBooking(array $data, int $bookingId)
    {
        DB::beginTransaction();
        try {
            $booking = $this->bookingRepository->getById($bookingId);
            
            if (!$booking) {
                throw new InvalidArgumentException('Booking not found');
            }
            
            // Vérifier que la réservation peut être terminée
            if ($booking->status !== 'CONFIRME') {
                throw new InvalidArgumentException('Seules les réservations confirmées peuvent être terminées.');
            }
            
            // Mettre à jour la réservation
            $updateData = [
                'status' => 'COMPLETE',
                'notes' => $data['notes'] ?? $booking->notes
            ];

            $booking = $this->bookingRepository->update($updateData, $bookingId);

            // Remettre la résidence listée si plus aucune réservation active
            if ($booking->bookable_type === 'App\\Models\\Residence') {
                $residence = $booking->bookable;
                if ($residence && !$residence->is_available) {
                    $hasOtherActive = $residence->bookings()
                        ->where('id', '!=', $booking->id)
                        ->where('status', '!=', 'ANNULE')
                        ->where('end_date', '>=', now()->toDateString())
                        ->exists();
                    if (!$hasOtherActive) {
                        $residence->update(['is_available' => true]);
                    }
                }
            }

            // Séquestre : le propriétaire n'est réellement crédité qu'ici, au
            // moment où la réservation est validée (check-in / QR scanné).
            $fundsJustReleased = $this->releaseFundsToOwner($booking);

            DB::commit();

            if ($fundsJustReleased) {
                $this->notificationService->notifyFundsReleased($booking);
            }

            return $booking;

        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to complete booking: ' . $e->getMessage());
        }
    }

    /**
     * Crédite le wallet du propriétaire avec le montant qui lui revient,
     * une seule fois (idempotent via funds_released_at), uniquement si la
     * réservation a bien été payée. La commission est créditée au ledger
     * plateforme dans le même passage.
     *
     * @return bool true si les fonds viennent d'être libérés à l'instant
     */
    private function releaseFundsToOwner(Booking $booking): bool
    {
        if ($booking->payment_status !== 'PAYE' || $booking->funds_released_at) {
            return false;
        }

        $ownerAmount = (float) $booking->owner_amount;
        $commissionAmount = (float) $booking->commission_amount;

        if ($ownerAmount <= 0 && $commissionAmount <= 0) {
            return false;
        }

        if ($ownerAmount > 0 && $booking->owner_id) {
            $ownerWallet = Wallet::firstOrCreate(
                ['user_id' => $booking->owner_id],
                ['balance' => 0, 'is_platform' => false]
            );

            $ownerWallet->increment('balance', $ownerAmount);

            $ownerWallet->transactions()->create([
                'type' => 'CREDIT',
                'amount' => $ownerAmount,
                'reason' => 'Réservation #' . $booking->id . ' (' . $booking->booking_reference . ') - fonds libérés au check-in',
            ]);

            $this->moneyMovementService->record([
                'type' => MoneyMovementType::OWNER_RELEASE,
                'direction' => MoneyMovementDirection::INTERNAL,
                'amount' => $ownerAmount,
                'idempotency_key' => 'release:' . $booking->id . ':owner',
                'booking_id' => $booking->id,
                'user_id' => $booking->owner_id,
                'counterparty_user_id' => $booking->customer_id,
                'wallet_id' => $ownerWallet->id,
                'external_reference' => $booking->payment_reference,
                'meta' => ['booking_reference' => $booking->booking_reference],
                'occurred_at' => now(),
            ]);
        }

        if ($commissionAmount > 0) {
            $platformWallet = $this->platformLedgerService->credit(
                $commissionAmount,
                'Commission réservation #' . $booking->id,
                $booking->id
            );

            $this->moneyMovementService->record([
                'type' => MoneyMovementType::PLATFORM_COMMISSION,
                'direction' => MoneyMovementDirection::INTERNAL,
                'amount' => $commissionAmount,
                'idempotency_key' => 'release:' . $booking->id . ':commission',
                'booking_id' => $booking->id,
                'user_id' => $booking->customer_id,
                'counterparty_user_id' => $booking->owner_id,
                'wallet_id' => $platformWallet->id,
                'external_reference' => $booking->payment_reference,
                'occurred_at' => now(),
            ]);
        }

        $booking->update(['funds_released_at' => now()]);

        return true;
    }

    /**
     * Crédite le ledger plateforme du montant retenu à l'annulation
     * (total - remboursé). Idempotent via platform_retained_at.
     */
    private function creditPlatformRetention(Booking $booking, float $retained): void
    {
        if ($booking->platform_retained_at || $retained <= 0) {
            \Illuminate\Support\Facades\Log::info(
                'Platform retention skipped (already credited or zero) for booking #' . $booking->id,
                ['retained' => $retained, 'platform_retained_at' => $booking->platform_retained_at]
            );
            return;
        }

        $this->platformLedgerService->credit(
            $retained,
            'Rétention annulation réservation #' . $booking->id,
            $booking->id
        );

        $booking->update(['platform_retained_at' => now()]);

        $platformWallet = $this->platformLedgerService->wallet();
        $this->moneyMovementService->record([
            'type' => MoneyMovementType::PLATFORM_RETENTION,
            'direction' => MoneyMovementDirection::IN,
            'amount' => $retained,
            'idempotency_key' => 'retention:' . $booking->id,
            'booking_id' => $booking->id,
            'user_id' => $booking->customer_id,
            'counterparty_user_id' => $booking->owner_id,
            'wallet_id' => $platformWallet->id,
            'external_reference' => $booking->payment_reference,
            'occurred_at' => now(),
        ]);

        \Illuminate\Support\Facades\Log::info(
            'Platform retention credited for booking #' . $booking->id,
            ['retained' => $retained, 'total_price' => $booking->total_price]
        );
    }

    /**
     * Rembourse automatiquement le client via Paystack quand une réservation
     * payée mais pas encore libérée au propriétaire est annulée. L'argent
     * n'ayant jamais quitté le séquestre de la plateforme, ce remboursement
     * ne concerne que Paystack, pas le wallet du propriétaire (jamais crédité).
     * Un échec de remboursement ne doit pas faire échouer l'annulation elle-même :
     * il est journalisé pour suivi manuel.
     */
    private function refundBooking(Booking $booking, ?float $amount = null): void
    {
        if (!$booking->payment_reference) {
            \Illuminate\Support\Facades\Log::warning('Impossible de rembourser la réservation #' . $booking->id . ' : aucune référence de paiement enregistrée.');
            return;
        }

        $refundAmount = $amount ?? (float) $booking->total_price;
        if ($refundAmount <= 0) {
            return;
        }

        try {
            $this->paystackService->refundTransaction($booking->payment_reference, $refundAmount);
            $booking->update(['payment_status' => 'REMBOURSE']);

            $this->moneyMovementService->record([
                'type' => MoneyMovementType::CLIENT_REFUND,
                'direction' => MoneyMovementDirection::OUT,
                'amount' => $refundAmount,
                'idempotency_key' => 'refund:' . $booking->payment_reference . ':' . number_format($refundAmount, 2, '.', ''),
                'booking_id' => $booking->id,
                'user_id' => $booking->customer_id,
                'counterparty_user_id' => $booking->owner_id,
                'external_reference' => $booking->payment_reference,
                'status' => MoneyMovementStatus::RECORDED,
                'meta' => ['total_price' => (float) $booking->total_price],
                'occurred_at' => now(),
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Échec du remboursement Paystack pour la réservation #' . $booking->id . ' : ' . $e->getMessage());

            $this->moneyMovementService->record([
                'type' => MoneyMovementType::CLIENT_REFUND,
                'direction' => MoneyMovementDirection::OUT,
                'amount' => $refundAmount,
                'idempotency_key' => 'refund-failed:' . $booking->payment_reference . ':' . number_format($refundAmount, 2, '.', ''),
                'booking_id' => $booking->id,
                'user_id' => $booking->customer_id,
                'counterparty_user_id' => $booking->owner_id,
                'external_reference' => $booking->payment_reference,
                'status' => MoneyMovementStatus::FAILED,
                'meta' => ['error' => $e->getMessage()],
                'occurred_at' => now(),
            ]);
        }
    }

    /**
     * Calcule le montant à rembourser selon la politique d'annulation.
     *
     * Gratuit si :
     * - encore ≥ free_cancel_hours avant le début, OU
     * - encore dans la grâce post-réservation (créée récemment).
     *
     * @return array{amount: float, percent: int, free: bool, policy: array}
     */
    public function resolveCancellationRefund(Booking $booking): array
    {
        $policy = $this->pricingService->cancellationPolicy($booking->bookable_type ?? 'residence');
        $hoursBefore = Carbon::now()->diffInHours(Carbon::parse($booking->start_date), false);
        $withinPolicy = $hoursBefore >= (int) $policy['free_cancel_hours'];

        $graceMinutes = max(0, (int) config('booking.post_booking_free_cancel_minutes', 120));
        $created = $booking->created_at
            ? Carbon::parse($booking->created_at)
            : Carbon::now();
        $withinGrace = $graceMinutes > 0
            && Carbon::now()->lt($created->copy()->addMinutes($graceMinutes));

        $free = $withinPolicy || $withinGrace;
        $percent = $free ? 100 : (int) $policy['late_refund_percent'];
        $amount = round(((float) $booking->total_price) * ($percent / 100), 2);

        return [
            'amount' => $amount,
            'percent' => $percent,
            'free' => $free,
            'policy' => $policy,
            'within_grace' => $withinGrace,
        ];
    }

    /**
     * Auto-annule les réservations non payées hors TTL (libère l'inventaire).
     */
    public function expireUnpaidBookings(): int
    {
        $cutoff = $this->availabilityService->unpaidHoldCutoff();
        $expired = Booking::query()
            ->where('status', '!=', 'ANNULE')
            ->whereIn('payment_status', ['EN_ATTENTE', 'ECHEC'])
            ->where('created_at', '<=', $cutoff)
            ->get();

        $count = 0;
        foreach ($expired as $booking) {
            try {
                if ((float) $booking->credit_applied > 0) {
                    $this->customerCreditService->restoreForBooking($booking);
                }
                $this->bookingRepository->update([
                    'status' => 'ANNULE',
                    'cancelled_at' => now(),
                    'cancellation_reason' => 'Expirée : paiement non finalisé dans le délai imparti.',
                ], $booking->id);
                $count++;
            } catch (\Exception $e) {
                report($e);
            }
        }

        return $count;
    }

    /**
     * Hospitality : confirmation automatique dès paiement (pas d'attente owner).
     */
    public function confirmHospitalityAfterPayment(Booking $booking): void
    {
        $hospitality = [
            'App\\Models\\Restaurant',
            'App\\Models\\Lounge',
            'App\\Models\\NightClub',
        ];

        if (!in_array($booking->bookable_type, $hospitality, true)) {
            return;
        }

        if ($booking->status !== 'EN_ATTENTE') {
            return;
        }

        $booking->update([
            'status' => 'CONFIRME',
            'confirmed_at' => now(),
        ]);
    }

    /**
     * Initialize Paystack payment for an existing unpaid booking (reprise checkout).
     */
    public function reinitializePayment(Booking $booking, string $platform = 'web'): string
    {
        if ($booking->payment_status === 'PAYE') {
            throw new InvalidArgumentException('Cette réservation est déjà payée.');
        }

        if ($booking->status === 'ANNULE') {
            throw new InvalidArgumentException('Cette réservation est annulée.');
        }

        $amount = (float) $booking->total_price;
        if ($amount <= 0) {
            throw new InvalidArgumentException('Montant de réservation invalide pour le paiement.');
        }

        $customer = User::findOrFail($booking->customer_id);
        $paymentUrl = $this->initializePaymentForBooking(
            $booking,
            $customer->email,
            $amount,
            $platform,
            true
        );

        if (!$paymentUrl) {
            // Payé entièrement via avoir
            if ($booking->fresh()->payment_status === 'PAYE') {
                return '';
            }
            throw new InvalidArgumentException(
                'Impossible d\'obtenir le lien de paiement Paystack. Vérifiez PAYSTACK_SECRET_KEY dans le .env.'
            );
        }

        return $paymentUrl;
    }

    /**
     * Generate a unique booking reference
     */
    private function generateBookingReference(): string
    {
        do {
            $reference = 'BK' . strtoupper(uniqid());
        } while (Booking::where('booking_reference', $reference)->exists());

        return $reference;
    }

    /**
     * Assure qu'aucune réservation active (non annulée) ne chevauche déjà
     * la période demandée pour ce bookable. Verrouille les lignes concernées
     * (lockForUpdate) pour empêcher deux réservations concurrentes sur les
     * mêmes dates de passer en même temps.
     *
     * @throws \App\Exceptions\BookingConflictException
     */
    private function assertAvailable(string $bookableType, int $bookableId, string $startDate, string $endDate): void
    {
        $this->availabilityService->activeInventoryQuery()
            ->where('bookable_type', $bookableType)
            ->where('bookable_id', $bookableId)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            })
            ->lockForUpdate()
            ->get();

        if ($this->availabilityService->hasConflict($bookableType, $bookableId, $startDate, $endDate)) {
            throw new \App\Exceptions\BookingConflictException(
                'Ces dates ne sont plus disponibles pour cet établissement.'
            );
        }
    }

    private function assertRoomAvailable(int $hotelRoomId, string $startDate, string $endDate): void
    {
        $this->availabilityService->activeInventoryQuery()
            ->where('hotel_room_id', $hotelRoomId)
            ->where(function ($query) use ($startDate, $endDate) {
                $query->whereBetween('start_date', [$startDate, $endDate])
                    ->orWhereBetween('end_date', [$startDate, $endDate])
                    ->orWhere(function ($q) use ($startDate, $endDate) {
                        $q->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $endDate);
                    });
            })
            ->lockForUpdate()
            ->get();

        if ($this->availabilityService->hasRoomConflict($hotelRoomId, $startDate, $endDate)) {
            throw new \App\Exceptions\BookingConflictException(
                'Cette chambre n\'est plus disponible sur ces dates.'
            );
        }
    }

    private function assertResourcesAvailable(string $pivotTable, string $resourceColumn, array $resourceIds, string $startDate, string $endDate): void
    {
        if (empty($resourceIds)) {
            return;
        }

        $holdCutoff = $this->availabilityService->unpaidHoldCutoff();

        $conflicting = DB::table($pivotTable)
            ->join('bookings', 'bookings.id', '=', "{$pivotTable}.booking_id")
            ->whereIn("{$pivotTable}.{$resourceColumn}", $resourceIds)
            ->where('bookings.status', '!=', 'ANNULE')
            ->where(function ($q) use ($holdCutoff) {
                $q->where('bookings.payment_status', 'PAYE')
                    ->orWhere('bookings.created_at', '>', $holdCutoff);
            })
            ->where(function ($query) use ($startDate, $endDate) {
                // Chevauchement de créneaux : start < otherEnd AND end > otherStart
                $query->where('bookings.start_date', '<', $endDate)
                    ->where('bookings.end_date', '>', $startDate);
            })
            ->lockForUpdate()
            ->exists();

        if ($conflicting) {
            throw new \App\Exceptions\BookingConflictException(
                'Une ou plusieurs tables/zones sélectionnées ne sont plus disponibles sur ce créneau.'
            );
        }
    }

    private function assertRestaurantTablesValid(int $restaurantId, array $tableIds, int $guests): void
    {
        $tables = \App\Models\RestaurantTable::where('restaurant_id', $restaurantId)
            ->whereIn('id', $tableIds)
            ->get();

        if ($tables->count() !== count(array_unique($tableIds))) {
            throw new InvalidArgumentException('Une ou plusieurs tables n\'appartiennent pas à ce restaurant.');
        }

        foreach ($tables as $table) {
            if (!$table->is_active) {
                throw new InvalidArgumentException("La table {$table->table_number} n'est pas active.");
            }
            if (!$this->availabilityService->checkCapacity($table, $guests) && $tables->count() === 1) {
                throw new InvalidArgumentException(
                    "La table {$table->table_number} n'accepte que {$table->capacity} convive(s)."
                );
            }
        }

        $totalCapacity = $tables->sum('capacity');
        if ($guests > $totalCapacity) {
            throw new InvalidArgumentException(
                "Capacité insuffisante ({$totalCapacity}) pour {$guests} convive(s)."
            );
        }
    }

    private function assertLoungeTablesValid(int $loungeId, array $tableIds, int $guests): void
    {
        $tables = \App\Models\LoungeTable::where('lounge_id', $loungeId)
            ->whereIn('id', $tableIds)
            ->get();

        if ($tables->count() !== count(array_unique($tableIds))) {
            throw new InvalidArgumentException('Une ou plusieurs tables n\'appartiennent pas à cet établissement.');
        }

        foreach ($tables as $table) {
            if (!$table->is_active) {
                throw new InvalidArgumentException("La table {$table->table_number} n'est pas active.");
            }
        }

        $totalCapacity = $tables->sum('capacity');
        if ($guests > $totalCapacity) {
            throw new InvalidArgumentException(
                "Capacité insuffisante ({$totalCapacity}) pour {$guests} personne(s)."
            );
        }
    }

    private function assertNightClubAreasValid(int $nightClubId, array $areaIds, int $guests): void
    {
        $areas = \App\Models\NightClubArea::where('night_club_id', $nightClubId)
            ->whereIn('id', $areaIds)
            ->get();

        if ($areas->count() !== count(array_unique($areaIds))) {
            throw new InvalidArgumentException('Une ou plusieurs zones n\'appartiennent pas à ce night-club.');
        }

        foreach ($areas as $area) {
            if (!$area->is_active) {
                throw new InvalidArgumentException("La zone {$area->area_name} n'est pas active.");
            }
            if ($area->capacity !== null && $guests > (int) $area->capacity && $areas->count() === 1) {
                throw new InvalidArgumentException(
                    "La zone {$area->area_name} n'accepte que {$area->capacity} personne(s)."
                );
            }
        }

        $capacities = $areas->pluck('capacity')->filter(fn ($c) => $c !== null);
        if ($capacities->isNotEmpty() && $guests > $capacities->sum()) {
            throw new InvalidArgumentException(
                'Capacité insuffisante pour le nombre de personnes demandé.'
            );
        }
    }

    /**
     * Calculate price for residence booking
     */
    private function calculatePrice($residence, string $startDate, string $endDate): float
    {
        return $this->pricingService->calculateNightlyTotal(
            $residence,
            \Carbon\Carbon::parse($startDate),
            \Carbon\Carbon::parse($endDate)
        );
    }

    /**
     * Calculate price for hotel booking, based on the actual room price.
     */
    private function calculateHotelPrice($hotelRoom, string $startDate, string $endDate): float
    {
        return $this->pricingService->calculateNightlyTotal(
            $hotelRoom,
            \Carbon\Carbon::parse($startDate),
            \Carbon\Carbon::parse($endDate)
        );
    }

    /**
     * Get bookable item by type and id
     */
    private function getBookable($type, $id)
    {
        $modelClass = "App\\Models\\{$type}";
        
        if (!class_exists($modelClass)) {
            throw new InvalidArgumentException("Invalid bookable type: {$type}");
        }
        
        $bookable = $modelClass::find($id);
        
        if (!$bookable) {
            throw new InvalidArgumentException("Bookable item not found");
        }
        
        return $bookable;
    }

    /**
     * Update bookingRepository data
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function update(array $data, int $id)
    {
        DB::beginTransaction();
        try {
            $bookingRepository = $this->bookingRepository->update($data, $id);
            DB::commit();
            return $bookingRepository;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to update post data');
        }
    }

    /**
     * Delete bookingRepository by id.
     *
     * @param $id
     * @return String
     */
    public function deleteById(int $id)
    {
        DB::beginTransaction();
        try {
            $bookingRepository = $this->bookingRepository->delete($id);
            DB::commit();
            return $bookingRepository;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to delete post data');
        }
    }

    /**
     * Create a new restaurant booking.
     *
     * @param array $data
     * @param int $restaurantId
     * @return Booking
     */
    public function saveRestaurantBooking(array $data, int $restaurantId)
    {
        DB::beginTransaction();
        try {
            $data = \App\Support\HospitalitySlot::apply($data, 'restaurant');
            $restaurant = \App\Models\Restaurant::findOrFail($restaurantId);

            // Empêcher un double-booking sur les tables demandées
            if (isset($data['restaurant_table_ids']) && is_array($data['restaurant_table_ids'])) {
                $this->assertRestaurantTablesValid($restaurantId, $data['restaurant_table_ids'], (int) $data['guests']);
                $this->assertResourcesAvailable('bookings_restaurant_tables', 'table_id', $data['restaurant_table_ids'], $data['start_date'], $data['end_date']);
            }

            // Préparer les données de réservation
            $totalPrice = $this->calculateRestaurantPrice($restaurant, $data);
            $commissionAmount = $this->calculateCommission($totalPrice, \App\Models\Restaurant::class);
            $ownerAmount = $totalPrice - $commissionAmount;
            
            $bookingData = [
                'customer_id' => $data['customer_id'],
                'owner_id' => $restaurant->owner_id,
                'bookable_type' => 'App\\Models\\Restaurant',
                'bookable_id' => $restaurantId,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'guests' => $data['guests'],
                'notes' => $data['notes'] ?? null,
                'booking_reference' => $this->generateBookingReference(),
                'total_price' => $totalPrice,
                'commission_amount' => $commissionAmount,
                'owner_amount' => $ownerAmount,
                'status' => 'EN_ATTENTE',
                'payment_status' => 'EN_ATTENTE'
            ];
            
            // Créer la réservation
            $booking = $this->bookingRepository->save($bookingData);
            
            // Créer/initialiser le wallet du owner s'il n'en a pas
            $this->ensureOwnerWallet($restaurant->owner_id, $ownerAmount, $booking->id);
            
            // Attacher les tables si spécifiées
            if (isset($data['restaurant_table_ids']) && is_array($data['restaurant_table_ids'])) {
                $booking->restaurantTables()->sync($data['restaurant_table_ids']);
            }
            
            DB::commit();

            $this->notificationService->notifyBookingCreated($booking);

            // Initialize Paystack payment
            $customer = \App\Models\User::findOrFail($data['customer_id']);
            $paymentUrl = $this->initializePaymentForBooking($booking, $customer->email, $totalPrice, $data['platform'] ?? 'web');

            // Return the booking with payment URL
            return [
                'booking' => $booking,
                'payment_url' => $paymentUrl
            ];
            
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to create restaurant booking: ' . $e->getMessage());
        }
    }

    /**
     * Create a new lounge booking.
     *
     * @param array $data
     * @param int $loungeId
     * @return Booking
     */
    public function saveLoungeBooking(array $data, int $loungeId)
    {
        DB::beginTransaction();
        try {
            $data = \App\Support\HospitalitySlot::apply($data, 'lounge');
            $lounge = \App\Models\Lounge::findOrFail($loungeId);

            // Empêcher un double-booking sur les tables demandées
            if (isset($data['lounge_table_ids']) && is_array($data['lounge_table_ids'])) {
                $this->assertLoungeTablesValid($loungeId, $data['lounge_table_ids'], (int) $data['guests']);
                $this->assertResourcesAvailable('bookings_lounge_tables', 'table_id', $data['lounge_table_ids'], $data['start_date'], $data['end_date']);
            }

            // Préparer les données de réservation
            $totalPrice = $this->calculateLoungePrice($lounge, $data);
            $commissionAmount = $this->calculateCommission($totalPrice, \App\Models\Lounge::class);
            $ownerAmount = $totalPrice - $commissionAmount;
            
            $bookingData = [
                'customer_id' => $data['customer_id'],
                'owner_id' => $lounge->owner_id,
                'bookable_type' => 'App\\Models\\Lounge',
                'bookable_id' => $loungeId,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'guests' => $data['guests'],
                'notes' => $data['notes'] ?? null,
                'booking_reference' => $this->generateBookingReference(),
                'total_price' => $totalPrice,
                'commission_amount' => $commissionAmount,
                'owner_amount' => $ownerAmount,
                'status' => 'EN_ATTENTE',
                'payment_status' => 'EN_ATTENTE'
            ];
            
            // Créer la réservation
            $booking = $this->bookingRepository->save($bookingData);
            
            // Créer/initialiser le wallet du owner s'il n'en a pas
            $this->ensureOwnerWallet($lounge->owner_id, $ownerAmount, $booking->id);
            
            // Attacher les tables si spécifiées
            if (isset($data['lounge_table_ids']) && is_array($data['lounge_table_ids'])) {
                $booking->loungeTables()->sync($data['lounge_table_ids']);
            }
            
            DB::commit();

            $this->notificationService->notifyBookingCreated($booking);

            // Initialize Paystack payment
            $customer = \App\Models\User::findOrFail($data['customer_id']);
            $paymentUrl = $this->initializePaymentForBooking($booking, $customer->email, $totalPrice, $data['platform'] ?? 'web');

            // Return the booking with payment URL
            return [
                'booking' => $booking,
                'payment_url' => $paymentUrl
            ];
            
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to create lounge booking: ' . $e->getMessage());
        }
    }

    /**
     * Create a new night club booking.
     *
     * @param array $data
     * @param int $nightClubId
     * @return Booking
     */
    public function saveNightClubBooking(array $data, int $nightClubId)
    {
        DB::beginTransaction();
        try {
            $data = \App\Support\HospitalitySlot::apply($data, 'night_club');
            $nightClub = \App\Models\NightClub::findOrFail($nightClubId);

            // Empêcher un double-booking sur les zones demandées
            if (isset($data['night_club_area_ids']) && is_array($data['night_club_area_ids'])) {
                $this->assertNightClubAreasValid($nightClubId, $data['night_club_area_ids'], (int) $data['guests']);
                $this->assertResourcesAvailable('bookings_night_club_areas', 'area_id', $data['night_club_area_ids'], $data['start_date'], $data['end_date']);
            }

            // Préparer les données de réservation
            $totalPrice = $this->calculateNightClubPrice($nightClub, $data);
            $commissionAmount = $this->calculateCommission($totalPrice, \App\Models\NightClub::class);
            $ownerAmount = $totalPrice - $commissionAmount;
            
            $bookingData = [
                'customer_id' => $data['customer_id'],
                'owner_id' => $nightClub->owner_id,
                'bookable_type' => 'App\\Models\\NightClub',
                'bookable_id' => $nightClubId,
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'],
                'guests' => $data['guests'],
                'notes' => $data['notes'] ?? null,
                'booking_reference' => $this->generateBookingReference(),
                'total_price' => $totalPrice,
                'commission_amount' => $commissionAmount,
                'owner_amount' => $ownerAmount,
                'status' => 'EN_ATTENTE',
                'payment_status' => 'EN_ATTENTE'
            ];
            
            // Créer la réservation
            $booking = $this->bookingRepository->save($bookingData);
            
            // Créer/initialiser le wallet du owner s'il n'en a pas
            $this->ensureOwnerWallet($nightClub->owner_id, $ownerAmount, $booking->id);
            
            // Attacher les zones si spécifiées
            if (isset($data['night_club_area_ids']) && is_array($data['night_club_area_ids'])) {
                $booking->nightClubAreas()->sync($data['night_club_area_ids']);
            }
            
            DB::commit();

            $this->notificationService->notifyBookingCreated($booking);

            // Initialize Paystack payment
            $customer = \App\Models\User::findOrFail($data['customer_id']);
            $paymentUrl = $this->initializePaymentForBooking($booking, $customer->email, $totalPrice, $data['platform'] ?? 'web');

            // Return the booking with payment URL
            return [
                'booking' => $booking,
                'payment_url' => $paymentUrl
            ];
            
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to create night club booking: ' . $e->getMessage());
        }
    }

    /**
     * Calculate restaurant booking price.
     *
     * @param Restaurant $restaurant
     * @param array $data
     * @return float
     */
    private function calculateRestaurantPrice($restaurant, array $data)
    {
        return (float) $this->pricingService->quoteRestaurant($restaurant->id, $data)['total'];
    }

    private function calculateLoungePrice($lounge, array $data)
    {
        return (float) $this->pricingService->quoteLounge($lounge->id, $data)['total'];
    }

    private function calculateNightClubPrice($nightClub, array $data)
    {
        return (float) $this->pricingService->quoteNightClub($nightClub->id, $data)['total'];
    }

    /**
     * Calculate commission amount based on total price. Utilise le taux actif
     * pour la verticale ($bookableType) si un existe, sinon retombe sur le
     * taux global de repli (cf. CommissionRepository::getLastCommission()).
     *
     * @param float $totalPrice
     * @param string|null $bookableType FQCN du modèle réservable (ex: Residence::class)
     * @return float
     */
    private function calculateCommission(float $totalPrice, ?string $bookableType = null): float
    {
        $commissionService = app(\App\Services\CommissionService::class);
        $commission = $commissionService->getLastCommission($bookableType);

        if (!$commission) {
            return 0;
        }

        return $totalPrice * ($commission->commission / 100);
    }

    /**
     * Initialize Paystack payment for a booking. Le paramètre $platform
     * ("web" ou "mobile") est encodé dans callback_url pour que
     * PaymentController::callback() sache où rediriger l'utilisateur après
     * paiement (front-office Next.js ou deep link de l'app mobile) — Paystack
     * nous redirige vers cette URL telle quelle, query string comprise.
     *
     * @param Booking $booking
     * @param string $customerEmail
     * @param float $amount
     * @param string $platform
     * @return string|null
     */
    /**
     * Initialize Paystack Redirect checkout for a booking.
     *
     * @see https://paystack.com/docs/payments/accept-payments/#redirect
     *
     * @param bool $strict Si true, propage l'erreur (bouton Payer). Sinon log + null à la création.
     */
    private function initializePaymentForBooking(
        Booking $booking,
        string $customerEmail,
        float $amount,
        string $platform = 'web',
        bool $strict = false
    ): ?string {
        try {
            // Appliquer l'avoir Dolci avant Paystack (idempotent).
            $creditApplied = $this->customerCreditService->applyToBooking($booking->fresh(), $amount);
            $booking->refresh();
            $remaining = round(max(0, (float) $amount - $creditApplied), 2);

            if ($remaining <= 0) {
                $this->markBookingPaidWithCredit($booking->fresh());
                return null;
            }

            $frontend = rtrim((string) config('app.frontend_url', env('FRONTEND_URL', '')), '/');

            $paymentData = [
                'email' => $customerEmail,
                'amount' => $remaining,
                'reference' => $this->paystackService->generateReference(),
                'callback_url' => config('app.url') . '/api/payments/callback?platform=' . urlencode($platform),
                'metadata' => [
                    'user_id' => $booking->customer_id,
                    'booking_id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'credit_applied' => $creditApplied,
                    'amount_due' => $remaining,
                    'cancel_action' => $frontend !== ''
                        ? $frontend . '/customer/bookings/' . $booking->id
                        : null,
                ],
                'currency' => config('booking.currency', 'XOF'),
            ];

            $paystackResponse = $this->paystackService->initializeTransaction($paymentData);

            if (($paystackResponse['status'] ?? false) && isset($paystackResponse['data']['authorization_url'])) {
                return $paystackResponse['data']['authorization_url'];
            }

            throw new \RuntimeException('Réponse Paystack sans authorization_url.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error(
                'Failed to initialize Paystack payment for booking #' . $booking->id . ': ' . $e->getMessage()
            );

            if ($strict) {
                throw $e;
            }

            return null;
        }
    }

    /**
     * Paiement 100 % avoir Dolci — marque PAYE sans Paystack.
     */
    private function markBookingPaidWithCredit(Booking $booking): void
    {
        if ($booking->payment_status === 'PAYE') {
            return;
        }

        $reference = 'CREDIT_' . $booking->id;
        $booking->update([
            'payment_status' => 'PAYE',
            'payment_reference' => $booking->payment_reference ?: $reference,
        ]);

        $this->moneyMovementService->record([
            'type' => MoneyMovementType::CLIENT_CHARGE,
            'direction' => MoneyMovementDirection::IN,
            'amount' => 0,
            'idempotency_key' => 'charge-credit-full:' . $booking->id,
            'booking_id' => $booking->id,
            'user_id' => $booking->customer_id,
            'counterparty_user_id' => $booking->owner_id,
            'external_reference' => $reference,
            'meta' => [
                'paid_with_credit' => true,
                'credit_applied' => (float) $booking->credit_applied,
                'total_price' => (float) $booking->total_price,
            ],
            'occurred_at' => now(),
        ]);

        $this->confirmHospitalityAfterPayment($booking->fresh());
        $this->notificationService->notifyPaymentHeld($booking->fresh());
    }

    /**
     * Ensure owner has a wallet, create it if it doesn't exist.
     * Note: The wallet will be credited only after payment confirmation via webhook.
     *
     * @param int $ownerId
     * @param float $ownerAmount
     * @param int $bookingId
     * @return void
     */
    private function ensureOwnerWallet(int $ownerId, float $ownerAmount, int $bookingId): void
    {
        Wallet::firstOrCreate(
            ['user_id' => $ownerId],
            ['balance' => 0]
        );
    }

}
