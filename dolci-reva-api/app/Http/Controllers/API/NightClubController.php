<?php

namespace App\Http\Controllers\API;

use App\Models\NightClub;
use App\Services\NightClubService;
use App\Traits\AuthorizesEstablishmentOwnership;
use App\Http\Controllers\Controller;
use App\Http\Resources\NightClubResource;
use App\Http\Requests\NightClubRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Night Clubs")
 */
class NightClubController extends Controller
{
    use AuthorizesEstablishmentOwnership;

    /**
     * @var NightClubService
     */
    protected NightClubService $nightClubService;

    /**
     * NightClubController Constructor
     *
     * @param NightClubService $nightClubService
     */
    public function __construct(NightClubService $nightClubService)
    {
        $this->nightClubService = $nightClubService;
    }

    /**
     * @OA\Get(
     *     path="/night-clubs",
     *     summary="Liste des night clubs",
     *     description="Récupère la liste de tous les night clubs de l'utilisateur authentifié",
     *     operationId="getNightClubs",
     *     tags={"Night Clubs"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des night clubs récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/NightClub")
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
    public function index(Request $request): AnonymousResourceCollection
    {
        $ownerId = $this->resolvePrivateListOwnerId($request);

        return NightClubResource::collection(
            $this->nightClubService->getAllWithPagination(
                (int) $request->get('per_page', 15),
                $ownerId
            )
        );
    }

    /**
     * @OA\Get(
     *     path="/public/night-clubs",
     *     summary="Liste des night clubs (public)",
     *     description="Récupère la liste de tous les night clubs disponibles sans authentification",
     *     operationId="getAllNightClubs",
     *     tags={"Public", "Night Clubs"},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des night clubs récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/NightClub")
     *             )
     *         )
     *     )
     * )
     */
    public function getAllNightClubs(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'city']);

        return NightClubResource::collection($this->nightClubService->getAvailable($filters));
    }

    /**
     * @OA\Post(
     *     path="/night-clubs",
     *     summary="Créer un night club",
     *     description="Crée un nouveau night club",
     *     operationId="createNightClub",
     *     tags={"Night Clubs"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "description", "address", "city", "country"},
     *             @OA\Property(property="name", type="string", example="Club VIP"),
     *             @OA\Property(property="description", type="string", example="Night club exclusif avec ambiance électrisante"),
     *             @OA\Property(property="address", type="string", example="123 Rue de la Paix"),
     *             @OA\Property(property="city", type="string", example="Paris"),
     *             @OA\Property(property="country", type="string", example="France"),
     *             @OA\Property(property="opening_hours", type="object",
     *                 @OA\Property(property="friday", type="object",
     *                     @OA\Property(property="open", type="string", example="22:00"),
     *                     @OA\Property(property="close", type="string", example="06:00")
     *                 )
     *             ),
     *             @OA\Property(property="latitude", type="number", format="float", example=48.8566),
     *             @OA\Property(property="longitude", type="number", format="float", example=2.3522),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="age_restriction", type="integer", example=18),
     *             @OA\Property(property="parking", type="boolean", example=true),
     *             @OA\Property(property="images", type="array", @OA\Items(type="string", format="binary")),
     *             @OA\Property(property="feature_option_ids", type="array", @OA\Items(type="integer"), example={1, 2, 3}),
     *             @OA\Property(property="area_feature_options", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="area_id", type="integer", example=1),
     *                     @OA\Property(property="feature_option_ids", type="array", @OA\Items(type="integer"), example={1, 2})
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Night club créé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Night club created successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/NightClub")
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
    public function store(NightClubRequest $request): NightClubResource|JsonResponse
    {
        try {
            $this->authorizeCanManageEstablishments();
            $data = $this->forceOwnerId($request->validated());
            
            // Save the night club using the service
            $nightClub = $this->nightClubService->save($data);

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_CREATED,
                'success'   => true,
                'message'   => 'Night club created successfully',
                'data'      => new NightClubResource($nightClub)
            ], Response::HTTP_CREATED);

            // Return the response
            return $response;
        } catch (HttpException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Get(
     *     path="/night-clubs/{id}",
     *     summary="Afficher un night club",
     *     description="Récupère les détails d'un night club spécifique",
     *     operationId="getNightClub",
     *     tags={"Night Clubs"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID du night club",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Night club récupéré avec succès",
     *         @OA\JsonContent(ref="#/components/schemas/NightClub")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Night club non trouvé",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function show(int $id): NightClubResource
    {
        return NightClubResource::make($this->nightClubService->getById($id));
    }

    /**
     * @OA\Put(
     *     path="/night-clubs/{id}",
     *     summary="Modifier un night club",
     *     description="Met à jour un night club existant",
     *     operationId="updateNightClub",
     *     tags={"Night Clubs"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID du night club à modifier",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Club VIP Modifié"),
     *             @OA\Property(property="description", type="string", example="Night club exclusif avec ambiance électrisante"),
     *             @OA\Property(property="address", type="string", example="123 Rue de la Paix"),
     *             @OA\Property(property="city", type="string", example="Paris"),
     *             @OA\Property(property="country", type="string", example="France"),
     *             @OA\Property(property="opening_hours", type="object",
     *                 @OA\Property(property="friday", type="object",
     *                     @OA\Property(property="open", type="string", example="22:00"),
     *                     @OA\Property(property="close", type="string", example="06:00")
     *                 )
     *             ),
     *             @OA\Property(property="latitude", type="number", format="float", example=48.8566),
     *             @OA\Property(property="longitude", type="number", format="float", example=2.3522),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="age_restriction", type="integer", example=18),
     *             @OA\Property(property="parking", type="boolean", example=true),
     *             @OA\Property(property="images", type="array", @OA\Items(type="string", format="binary")),
     *             @OA\Property(property="feature_option_ids", type="array", @OA\Items(type="integer"), example={1, 2, 3}),
     *             @OA\Property(property="area_feature_options", type="array",
     *                 @OA\Items(
     *                     @OA\Property(property="area_id", type="integer", example=1),
     *                     @OA\Property(property="feature_option_ids", type="array", @OA\Items(type="integer"), example={1, 2})
     *                 )
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Night club modifié avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Night club updated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/NightClub")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Night club non trouvé",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
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
    public function update(NightClubRequest $request, int $id): NightClubResource|JsonResponse
    {
        try {
            $nightClub = NightClub::findOrFail($id);
            $this->authorizeEstablishmentOwner($nightClub);
            $data = $this->forceOwnerId($request->validated());
            
            // Update the night club using the service
            $nightClub = $this->nightClubService->update($data, $id);

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_OK,
                'success'   => true,
                'message'   => 'Night club updated successfully',
                'data'      => new NightClubResource($nightClub)
            ], Response::HTTP_OK);

            // Return the response
            return $response;
        } catch (HttpException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Delete(
     *     path="/night-clubs/{id}",
     *     summary="Supprimer un night club",
     *     description="Supprime un night club existant",
     *     operationId="deleteNightClub",
     *     tags={"Night Clubs"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID du night club à supprimer",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Night club supprimé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Night club deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Night club non trouvé",
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
        try {
            $nightClub = NightClub::findOrFail($id);
            $this->authorizeEstablishmentOwner($nightClub);
            $this->nightClubService->deleteById($id);
            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Night club deleted successfully'
            ], Response::HTTP_OK);
        } catch (HttpException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get available areas for a night club.
     */
    public function getAvailableAreas(Request $request, int $nightClub = 0, int $nightClubId = 0): JsonResponse
    {
        $id = $nightClub ?: $nightClubId;
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'guests' => 'required|integer|min:1|max:50'
        ]);

        try {
            $areas = $this->nightClubService->getAvailableAreas(
                $id,
                $request->date,
                $request->time,
                $request->guests
            );

            return response()->json([
                'success' => true,
                'data' => $areas->map(function ($area) {
                    return [
                        'id' => $area->id,
                        'area_name' => $area->area_name,
                        'capacity' => $area->capacity,
                        'location' => $area->location,
                        'area_type' => $area->area_type,
                        'minimum_spend' => $area->minimum_spend,
                        'table_fee' => $area->table_fee,
                        'reservation_required' => $area->reservation_required,
                        'display_name' => $area->display_name,
                        'location_description' => $area->location_description,
                        'type_description' => $area->type_description,
                        'minimum_spend_formatted' => $area->minimum_spend_formatted,
                        'table_fee_formatted' => $area->table_fee_formatted,
                        'total_cost_formatted' => $area->total_cost_formatted,
                        'feature_options_string' => $area->feature_options_string,
                        'availability' => $area->getAvailabilityStatus(),
                    ];
                })
            ]);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get recommended areas for a night club.
     */
    public function getRecommendedAreas(Request $request, int $nightClubId): JsonResponse
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'guests' => 'required|integer|min:1|max:50',
            'preference' => 'nullable|in:vip,dance,private,bottle,terrace'
        ]);

        try {
            $areas = $this->nightClubService->getRecommendedAreas(
                $nightClubId,
                $request->date,
                $request->time,
                $request->guests,
                $request->preference
            );

            return response()->json([
                'success' => true,
                'data' => $areas->map(function ($area) {
                    return [
                        'id' => $area->id,
                        'area_name' => $area->area_name,
                        'capacity' => $area->capacity,
                        'location' => $area->location,
                        'area_type' => $area->area_type,
                        'minimum_spend' => $area->minimum_spend,
                        'table_fee' => $area->table_fee,
                        'reservation_required' => $area->reservation_required,
                        'display_name' => $area->display_name,
                        'location_description' => $area->location_description,
                        'type_description' => $area->type_description,
                        'minimum_spend_formatted' => $area->minimum_spend_formatted,
                        'table_fee_formatted' => $area->table_fee_formatted,
                        'total_cost_formatted' => $area->total_cost_formatted,
                        'feature_options_string' => $area->feature_options_string
                    ];
                })
            ]);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get available time slots for a night club.
     */
    public function getAvailableTimeSlots(Request $request, int $nightClubId): JsonResponse
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'guests' => 'required|integer|min:1|max:50'
        ]);

        try {
            $timeSlots = $this->nightClubService->getAvailableTimeSlots(
                $nightClubId,
                $request->date,
                $request->guests
            );

            return response()->json([
                'success' => true,
                'data' => $timeSlots
            ]);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }



    /**
     * Get night clubs by age restriction.
     */
    public function getByAgeRestriction(int $ageRestriction): AnonymousResourceCollection
    {
        $nightClubs = $this->nightClubService->getByAgeRestriction($ageRestriction);

        return NightClubResource::collection($nightClubs);
    }

    public function getNightClub(int $nightClub): NightClubResource
    {
        return $this->show($nightClub);
    }

}