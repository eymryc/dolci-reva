<?php

namespace App\Http\Controllers\API;

use App\Models\Hotel;
use App\Models\Booking;
use App\Models\Residence;
use App\Models\Restaurant;
use App\Models\Lounge;
use App\Models\NightClub;
use App\Services\BookingService;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\BookingResource;
use App\Http\Requests\HotelBookingRequest;
use App\Http\Requests\CancelBookingRequest;
use App\Http\Requests\ConfirmBookingRequest;
use App\Http\Requests\ResidenceBookingRequest;
use App\Http\Requests\RestaurantBookingRequest;
use App\Http\Requests\LoungeBookingRequest;
use App\Http\Requests\NightClubBookingRequest;
use App\Services\PricingService;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Bookings")
 */
class BookingController extends Controller
{
    /**
     * @var BookingService
     */
    protected BookingService $bookingService;
    protected PricingService $pricingService;

    /**
     * BookingController Constructor
     *
     * @param BookingService $bookingService
     */
    public function __construct(BookingService $bookingService, PricingService $pricingService)
    {
        $this->bookingService = $bookingService;
        $this->pricingService = $pricingService;
    }

    /**
     * @OA\Get(
     *     path="/bookings",
     *     summary="Liste des réservations",
     *     description="Récupère la liste de toutes les réservations de l'utilisateur authentifié",
     *     operationId="getBookings",
     *     tags={"Bookings"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des réservations récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/Booking")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function index(): AnonymousResourceCollection
    {
        return BookingResource::collection($this->bookingService->getAllWithPagination());
    }

    /**
     * @OA\Get(
     *     path="/bookings/{id}",
     *     summary="Afficher une réservation",
     *     description="Récupère les détails d'une réservation spécifique",
     *     operationId="getBooking",
     *     tags={"Bookings"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la réservation",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Réservation récupérée avec succès",
     *         @OA\JsonContent(ref="#/components/schemas/Booking")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Réservation non trouvée",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function show(int $id): BookingResource|JsonResponse
    {
        $booking = $this->bookingService->getById($id);
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$booking || !$user->can('view', $booking)) {
            return response()->json(['success' => false, 'message' => 'Réservation introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return BookingResource::make($booking);
    }

    /**
     * @OA\Delete(
     *     path="/bookings/{id}",
     *     summary="Supprimer une réservation",
     *     description="Supprime une réservation spécifique",
     *     operationId="deleteBooking",
     *     tags={"Bookings"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la réservation à supprimer",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Réservation supprimée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Réservation non trouvée",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        // Réservé aux admins : contrairement à cancelBooking() (statut +
        // remboursement Paystack si déjà payé, cf. BookingService), ce hard
        // delete ne déclenche aucun remboursement. Ouvert à tout utilisateur
        // authentifié, un client aurait pu supprimer sa propre réservation
        // payée sans jamais être remboursé, sans trace pour litige.
        /** @var \App\Models\User|null $user */
        $user = Auth::user();
        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Vous n\'êtes pas autorisé à supprimer cette réservation.',
            ], Response::HTTP_FORBIDDEN);
        }

        try {
            $this->bookingService->deleteById($id);
            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Deleted successfully'
            ], Response::HTTP_OK);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Post(
     *     path="/residences/{residence}/book",
     *     summary="Réserver une résidence",
     *     description="Crée une nouvelle réservation pour une résidence",
     *     operationId="bookResidence",
     *     tags={"Bookings"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="residence",
     *         in="path",
     *         required=true,
     *         description="ID de la résidence à réserver",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"start_date", "end_date", "guests"},
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-01-20"),
     *             @OA\Property(property="guests", type="integer", example=2),
     *             @OA\Property(property="notes", type="string", example="Demande spéciale")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Réservation créée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Residence booked successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Booking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function bookResidence(ResidenceBookingRequest $request, Residence $residence): BookingResource|JsonResponse
    {
        try {
            $data = $request->validated();
            $data['customer_id'] = Auth::id();
            // Web par défaut ; le client mobile envoie X-Client-Platform:
            // mobile (cf. dolci-reva-mobile/src/core/api/client.ts) pour que
            // le retour de paiement Paystack redirige vers le bon endroit
            // (cf. PaymentController::callback()).
            $data['platform'] = $request->header('X-Client-Platform') === 'mobile' ? 'mobile' : 'web';
            
            // Save the booking using the service
            $result = $this->bookingService->saveResidenceBooking($data, $residence->id);
            $booking = $result['booking'];
            $paymentUrl = $result['payment_url'];

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_CREATED,
                'success'   => true,
                'message'   => 'Residence booked successfully',
                'data'      => new BookingResource($booking->load('customer', 'owner', 'bookable')),
                'payment_url' => $paymentUrl
            ], Response::HTTP_CREATED);

            // Return the response
            return $response;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => $exception->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Post(
     *     path="/hotels/{hotel}/book",
     *     summary="Réserver un hôtel",
     *     description="Crée une nouvelle réservation pour un hôtel",
     *     operationId="bookHotel",
     *     tags={"Bookings"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="hotel",
     *         in="path",
     *         required=true,
     *         description="ID de l'hôtel à réserver",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"start_date", "end_date", "guests", "hotel_room_ids"},
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-01-20"),
     *             @OA\Property(property="guests", type="integer", example=2),
     *             @OA\Property(property="hotel_room_ids", type="array", @OA\Items(type="integer"), example={1, 2}),
     *             @OA\Property(property="notes", type="string", example="Demande spéciale")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Réservation créée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Hotel booked successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Booking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function bookHotel(HotelBookingRequest $request, Hotel $hotel): BookingResource|JsonResponse
    {
        try {
            $data = $request->validated();
            $data['customer_id'] = Auth::id();
            // Web par défaut ; le client mobile envoie X-Client-Platform:
            // mobile (cf. dolci-reva-mobile/src/core/api/client.ts) pour que
            // le retour de paiement Paystack redirige vers le bon endroit
            // (cf. PaymentController::callback()).
            $data['platform'] = $request->header('X-Client-Platform') === 'mobile' ? 'mobile' : 'web';
            
            // Save the booking using the service
            $result = $this->bookingService->saveHotelBooking($data, $hotel->id);
            $booking = $result['booking'];
            $paymentUrl = $result['payment_url'];

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_CREATED,
                'success'   => true,
                'message'   => 'Hotel booked successfully',
                'data'      => new BookingResource($booking->load('customer', 'owner', 'bookable')),
                'payment_url' => $paymentUrl
            ], Response::HTTP_CREATED);

            // Return the response
            return $response;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    /**
     * @OA\Post(
     *     path="/bookings/{booking}/confirm",
     *     summary="Confirmer une réservation",
     *     description="Confirme une réservation (propriétaire ou admin uniquement)",
     *     operationId="confirmBooking",
     *     tags={"Bookings"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="booking",
     *         in="path",
     *         required=true,
     *         description="ID de la réservation à confirmer",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="confirmation_notes", type="string", example="Réservation confirmée")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Réservation confirmée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Réservation confirmée avec succès"),
     *             @OA\Property(property="data", ref="#/components/schemas/Booking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Non autorisé",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function confirmBooking(ConfirmBookingRequest $request, Booking $booking): BookingResource|JsonResponse
    {
        try {
            // Vérifier que l'utilisateur est le propriétaire ou un admin
            /** @var \App\Models\User|null $user */
            $user = Auth::user();
            if (!$user || !$user->can('confirm', $booking)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à confirmer cette réservation.'
                ], Response::HTTP_FORBIDDEN);
            }

            $data = $request->validated();

            // Confirm the booking using the service
            $booking = $this->bookingService->confirmBooking($data, $booking->id);

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_OK,
                'success'   => true,
                'message'   => 'Réservation confirmée avec succès',
                'data'      => new BookingResource($booking->load('customer', 'owner', 'bookable'))
            ], Response::HTTP_OK);

            // Return the response
            return $response;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Post(
     *     path="/bookings/{booking}/cancel",
     *     summary="Annuler une réservation",
     *     description="Annule une réservation (propriétaire, client ou admin)",
     *     operationId="cancelBooking",
     *     tags={"Bookings"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="booking",
     *         in="path",
     *         required=true,
     *         description="ID de la réservation à annuler",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="cancellation_reason", type="string", example="Changement de plans")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Réservation annulée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Réservation annulée avec succès"),
     *             @OA\Property(property="data", ref="#/components/schemas/Booking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Non autorisé",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function cancelBooking(CancelBookingRequest $request, Booking $booking): BookingResource|JsonResponse
    {
        try {
            // Vérifier que l'utilisateur est le propriétaire, le client ou un admin
            /** @var \App\Models\User|null $user */
            $user = Auth::user();
            if (!$user || !$user->can('cancel', $booking)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à annuler cette réservation.'
                ], Response::HTTP_FORBIDDEN);
            }

            $data = $request->validated();

            // Cancel the booking using the service
            $booking = $this->bookingService->cancelBooking($data, $booking->id);

            $settlement = $booking->getAttribute('settlement_result');

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_OK,
                'success'   => true,
                'message'   => 'Réservation annulée avec succès',
                'data'      => new BookingResource($booking->load('customer', 'owner', 'bookable')),
                'settlement' => $settlement,
            ], Response::HTTP_OK);

            // Return the response
            return $response;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Post(
     *     path="/bookings/{booking}/complete",
     *     summary="Finaliser une réservation",
     *     description="Finalise une réservation (propriétaire ou admin uniquement)",
     *     operationId="completeBooking",
     *     tags={"Bookings"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="booking",
     *         in="path",
     *         required=true,
     *         description="ID de la réservation à finaliser",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="completion_notes", type="string", example="Séjour terminé avec succès")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Réservation finalisée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Réservation finalisée avec succès"),
     *             @OA\Property(property="data", ref="#/components/schemas/Booking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Non autorisé",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function completeBooking(ConfirmBookingRequest $request, Booking $booking): BookingResource|JsonResponse
    {
        try {
            // Vérifier que l'utilisateur est le propriétaire ou un admin
            /** @var \App\Models\User|null $user */
            $user = Auth::user();
            if (!$user || !$user->can('complete', $booking)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Vous n\'êtes pas autorisé à terminer cette réservation.'
                ], Response::HTTP_FORBIDDEN);
            }

            $data = $request->validated();

            // Complete the booking using the service
            $booking = $this->bookingService->completeBooking($data, $booking->id);

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_OK,
                'success'   => true,
                'message'   => 'Réservation terminée avec succès',
                'data'      => new BookingResource($booking->load('customer', 'owner', 'bookable'))
            ], Response::HTTP_OK);

            // Return the response
            return $response;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Post(
     *     path="/restaurants/{restaurant}/book",
     *     summary="Réserver une table de restaurant",
     *     description="Crée une nouvelle réservation pour une table de restaurant",
     *     operationId="bookRestaurant",
     *     tags={"Bookings"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="restaurant",
     *         in="path",
     *         required=true,
     *         description="ID du restaurant à réserver",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"start_date", "end_date", "guests", "restaurant_table_ids"},
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="guests", type="integer", example=4),
     *             @OA\Property(property="restaurant_table_ids", type="array", @OA\Items(type="integer"), example={1, 2}),
     *             @OA\Property(property="notes", type="string", example="Anniversaire")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Réservation créée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Restaurant booked successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Booking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function bookRestaurant(RestaurantBookingRequest $request, Restaurant $restaurant): BookingResource|JsonResponse
    {
        try {
            $data = $request->validated();
            $data['customer_id'] = Auth::id();
            // Web par défaut ; le client mobile envoie X-Client-Platform:
            // mobile (cf. dolci-reva-mobile/src/core/api/client.ts) pour que
            // le retour de paiement Paystack redirige vers le bon endroit
            // (cf. PaymentController::callback()).
            $data['platform'] = $request->header('X-Client-Platform') === 'mobile' ? 'mobile' : 'web';
            
            // Save the booking using the service
            $result = $this->bookingService->saveRestaurantBooking($data, $restaurant->id);
            $booking = $result['booking'];
            $paymentUrl = $result['payment_url'];

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_CREATED,
                'success'   => true,
                'message'   => 'Restaurant booked successfully',
                'data'      => new BookingResource($booking->load('customer', 'owner', 'bookable', 'restaurantTables')),
                'payment_url' => $paymentUrl
            ], Response::HTTP_CREATED);

            // Return the response
            return $response;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Post(
     *     path="/lounges/{lounge}/book",
     *     summary="Réserver une table de lounge",
     *     description="Crée une nouvelle réservation pour une table de lounge",
     *     operationId="bookLounge",
     *     tags={"Bookings"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="lounge",
     *         in="path",
     *         required=true,
     *         description="ID du lounge à réserver",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"start_date", "end_date", "guests", "lounge_table_ids"},
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="guests", type="integer", example=6),
     *             @OA\Property(property="lounge_table_ids", type="array", @OA\Items(type="integer"), example={1, 2}),
     *             @OA\Property(property="notes", type="string", example="Soirée entre amis")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Réservation créée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Lounge booked successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Booking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function bookLounge(LoungeBookingRequest $request, Lounge $lounge): BookingResource|JsonResponse
    {
        try {
            $data = $request->validated();
            $data['customer_id'] = Auth::id();
            // Web par défaut ; le client mobile envoie X-Client-Platform:
            // mobile (cf. dolci-reva-mobile/src/core/api/client.ts) pour que
            // le retour de paiement Paystack redirige vers le bon endroit
            // (cf. PaymentController::callback()).
            $data['platform'] = $request->header('X-Client-Platform') === 'mobile' ? 'mobile' : 'web';
            
            // Save the booking using the service
            $result = $this->bookingService->saveLoungeBooking($data, $lounge->id);
            $booking = $result['booking'];
            $paymentUrl = $result['payment_url'];

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_CREATED,
                'success'   => true,
                'message'   => 'Lounge booked successfully',
                'data'      => new BookingResource($booking->load('customer', 'owner', 'bookable', 'loungeTables')),
                'payment_url' => $paymentUrl
            ], Response::HTTP_CREATED);

            // Return the response
            return $response;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Post(
     *     path="/night-clubs/{nightClub}/book",
     *     summary="Réserver une zone de night club",
     *     description="Crée une nouvelle réservation pour une zone de night club",
     *     operationId="bookNightClub",
     *     tags={"Bookings"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="nightClub",
     *         in="path",
     *         required=true,
     *         description="ID du night club à réserver",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"start_date", "end_date", "guests", "night_club_area_ids"},
     *             @OA\Property(property="start_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="end_date", type="string", format="date", example="2024-01-15"),
     *             @OA\Property(property="guests", type="integer", example=8),
     *             @OA\Property(property="night_club_area_ids", type="array", @OA\Items(type="integer"), example={1, 2}),
     *             @OA\Property(property="notes", type="string", example="Soirée VIP")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Réservation créée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Night club booked successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Booking")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function bookNightClub(NightClubBookingRequest $request, NightClub $nightClub): BookingResource|JsonResponse
    {
        try {
            $data = $request->validated();
            $data['customer_id'] = Auth::id();
            // Web par défaut ; le client mobile envoie X-Client-Platform:
            // mobile (cf. dolci-reva-mobile/src/core/api/client.ts) pour que
            // le retour de paiement Paystack redirige vers le bon endroit
            // (cf. PaymentController::callback()).
            $data['platform'] = $request->header('X-Client-Platform') === 'mobile' ? 'mobile' : 'web';

            $result = $this->bookingService->saveNightClubBooking($data, $nightClub->id);
            $booking = $result['booking'];
            $paymentUrl = $result['payment_url'];

            return response()->json([
                'status'    => Response::HTTP_CREATED,
                'success'   => true,
                'message'   => 'Night club booked successfully',
                'data'      => new BookingResource($booking->load('customer', 'owner', 'bookable', 'nightClubAreas')),
                'payment_url' => $paymentUrl
            ], Response::HTTP_CREATED);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Retourne le reçu complet d'une réservation (avec QR code)
     */
    public function getReceipt(Booking $booking): JsonResponse
    {
        try {
            /** @var \App\Models\User|null $user */
            $user = Auth::user();

            if ($booking->customer_id !== $user->id && $booking->owner_id !== $user->id && !$user->isAdmin()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Accès non autorisé.',
                ], Response::HTTP_FORBIDDEN);
            }

            $booking->load(['customer', 'owner', 'bookable']);
            $bookable = $booking->bookable;

            // Générer token QR signé (Crypt + TTL)
            $qrToken = app(\App\Services\BookingQrService::class)->issue($booking);

            $bookingType = match($booking->bookable_type) {
                'App\\Models\\Residence' => 'residence',
                'App\\Models\\Hotel' => 'hotel',
                'App\\Models\\Restaurant' => 'restaurant',
                'App\\Models\\Lounge' => 'lounge',
                'App\\Models\\NightClub' => 'night_club',
                default => 'unknown',
            };

            $customer = $booking->customer;
            $owner = $booking->owner;

            $propertyDetails = [
                'id' => $bookable?->id,
                'name' => $bookable?->name ?? 'N/A',
                'description' => $bookable?->description,
                'address' => [
                    'address' => $bookable?->address,
                    'city' => $bookable?->city,
                    'country' => $bookable?->country,
                    'latitude' => (string) ($bookable?->latitude ?? ''),
                    'longitude' => (string) ($bookable?->longitude ?? ''),
                ],
                'type' => $bookable?->type ?? $bookingType,
                'standing' => $bookable?->standing ?? null,
                'max_guests' => $bookable?->max_guests ?? null,
            ];

            // Compat FO legacy : bloc residence uniquement si pertinent
            if ($bookingType === 'residence' || isset($bookable?->standing) || isset($bookable?->max_guests)) {
                $propertyDetails['residence'] = [
                    'type' => $bookable?->type ?? $bookingType,
                    'standing' => $bookable?->standing ?? null,
                    'max_guests' => $bookable?->max_guests ?? null,
                    'bedrooms' => $bookable?->bedrooms ?? null,
                    'bathrooms' => $bookable?->bathrooms ?? null,
                    'piece_number' => $bookable?->piece_number ?? null,
                    'price' => $bookable?->price ?? null,
                    'average_rating' => $bookable?->average_rating ?? null,
                    'rating_count' => isset($bookable?->rating_count) ? (string) $bookable->rating_count : null,
                ];
            }

            $receiptData = [
                'receipt_info' => [
                    'booking_reference' => $booking->booking_reference,
                    'payment_reference' => $booking->payment_reference ?? $booking->booking_reference,
                    'payment_date' => $booking->confirmed_at?->toISOString() ?? $booking->created_at->toISOString(),
                    'payment_status' => $booking->payment_status,
                    'escrow_status' => $booking->escrowStatus(),
                    'funds_released_at' => $booking->funds_released_at?->toISOString(),
                    'generated_at' => now()->toISOString(),
                ],
                'customer' => [
                    'id' => $customer->id,
                    'first_name' => $customer->first_name,
                    'last_name' => $customer->last_name,
                    'full_name' => $customer->first_name . ' ' . $customer->last_name,
                    'email' => $customer->email,
                    'phone' => $customer->phone,
                ],
                'booking' => [
                    'id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'booking_type' => $bookingType,
                    'start_date' => $booking->start_date?->toISOString(),
                    'end_date' => $booking->end_date?->toISOString(),
                    'guests' => (string) $booking->guests,
                    'status' => $booking->status,
                    'payment_status' => $booking->payment_status,
                    'confirmed_at' => $booking->confirmed_at?->toISOString(),
                    'notes' => $booking->notes,
                ],
                'property' => [
                    'id' => $bookable?->id,
                    'name' => $bookable?->name ?? 'N/A',
                    'type' => $bookingType,
                    'details' => $propertyDetails,
                ],
                'owner' => $owner ? [
                    'id' => $owner->id,
                    'first_name' => $owner->first_name,
                    'last_name' => $owner->last_name,
                    'full_name' => $owner->first_name . ' ' . $owner->last_name,
                    'email' => $owner->email,
                    'phone' => $owner->phone,
                ] : null,
                'payment' => [
                    'total_price' => (float) $booking->total_price,
                    'commission_amount' => (float) ($booking->commission_amount ?? 0),
                    'owner_amount' => (float) ($booking->owner_amount ?? 0),
                    'payment_fees' => null,
                    'amount_received' => (float) $booking->total_price,
                    'payment_method' => 'Paystack',
                    'payment_currency' => 'XOF',
                    'payment_reference' => $booking->booking_reference,
                    'gateway_response' => null,
                    'authorization_code' => null,
                    'paystack_transaction_id' => null,
                ],
                'qr_code' => [
                    'token' => $qrToken,
                    'booking_id' => $booking->id,
                    'booking_reference' => $booking->booking_reference,
                    'qr_code_url' => url('/api/bookings/' . $booking->id . '/receipt'),
                    'generated_at' => now()->toISOString(),
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $receiptData,
            ]);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Devis serveur (prix + politique d'annulation) — source de vérité FO.
     */
    public function quote(Request $request, string $type, int $id): JsonResponse
    {
        try {
            $data = $request->validate([
                'start_date' => 'required|date',
                'end_date' => 'nullable|date|after:start_date',
                'guests' => 'required|integer|min:1|max:50',
                'hotel_room_id' => 'nullable|integer|exists:hotel_rooms,id',
                'restaurant_table_ids' => 'nullable|array',
                'restaurant_table_ids.*' => 'integer|exists:restaurant_tables,id',
                'lounge_table_ids' => 'nullable|array',
                'lounge_table_ids.*' => 'integer|exists:lounge_tables,id',
                'night_club_area_ids' => 'nullable|array',
                'night_club_area_ids.*' => 'integer|exists:night_club_areas,id',
            ]);

            $hospitalityVertical = match ($type) {
                'restaurant' => 'restaurant',
                'lounge', 'bar' => 'lounge',
                'night_club', 'night-club' => 'night_club',
                default => null,
            };
            if ($hospitalityVertical) {
                $data = \App\Support\HospitalitySlot::apply($data, $hospitalityVertical);
            } elseif (empty($data['end_date'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'La date de fin est requise.',
                ], Response::HTTP_UNPROCESSABLE_ENTITY);
            }

            $quote = $this->pricingService->quote($type, $id, $data);

            return response()->json([
                'success' => true,
                'data' => $quote,
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Reprend le checkout Paystack pour une réservation unpaid.
     */
    public function pay(Booking $booking): JsonResponse
    {
        $this->authorize('view', $booking);

        try {
            $platform = request()->header('X-Client-Platform') === 'mobile' ? 'mobile' : 'web';
            $paymentUrl = $this->bookingService->reinitializePayment($booking, $platform);
            $fresh = $booking->fresh();

            if ($paymentUrl === '' && $fresh?->payment_status === 'PAYE') {
                return response()->json([
                    'success' => true,
                    'message' => 'Réservation payée avec votre avoir Dolci',
                    'payment_url' => null,
                    'paid_with_credit' => true,
                    'data' => new BookingResource($fresh),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Lien de paiement Paystack généré',
                'payment_url' => $paymentUrl,
                'authorization_url' => $paymentUrl,
                'data' => new BookingResource($fresh),
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\RuntimeException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], Response::HTTP_BAD_GATEWAY);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage() ?: 'Erreur lors de l\'initialisation du paiement',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
