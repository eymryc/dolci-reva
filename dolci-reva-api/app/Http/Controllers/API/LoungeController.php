<?php

namespace App\Http\Controllers\API;

use App\Models\Lounge;
use App\Services\LoungeService;
use App\Traits\AuthorizesEstablishmentOwnership;
use App\Http\Controllers\Controller;
use App\Http\Resources\LoungeResource;
use App\Http\Requests\LoungeRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Lounges")
 */
class LoungeController extends Controller
{
    use AuthorizesEstablishmentOwnership;

    /**
     * @var LoungeService
     */
    protected LoungeService $loungeService;

    /**
     * LoungeController Constructor
     *
     * @param LoungeService $loungeService
     */
    public function __construct(LoungeService $loungeService)
    {
        $this->loungeService = $loungeService;
    }

    /**
     * @OA\Get(
     *     path="/lounges",
     *     summary="Liste des lounges",
     *     description="Récupère la liste de tous les lounges de l'utilisateur authentifié",
     *     operationId="getLounges",
     *     tags={"Lounges"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des lounges récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/Lounge")
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

        return LoungeResource::collection(
            $this->loungeService->getAllWithPagination(
                (int) $request->get('per_page', 15),
                $ownerId
            )
        );
    }

    /**
     * @OA\Get(
     *     path="/public/lounges",
     *     summary="Liste des lounges (public)",
     *     description="Récupère la liste de tous les lounges disponibles sans authentification",
     *     operationId="getAllLounges",
     *     tags={"Public", "Lounges"},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des lounges récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/Lounge")
     *             )
     *         )
     *     )
     * )
     */
    public function getAllLounges(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'city']);

        return LoungeResource::collection($this->loungeService->getPublicAll($filters));
    }

    /**
     * @OA\Post(
     *     path="/lounges",
     *     summary="Créer un lounge",
     *     description="Crée un nouveau lounge",
     *     operationId="createLounge",
     *     tags={"Lounges"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "description", "address", "city", "country"},
     *             @OA\Property(property="name", type="string", example="Lounge VIP"),
     *             @OA\Property(property="description", type="string", example="Lounge élégant avec ambiance feutrée"),
     *             @OA\Property(property="address", type="string", example="123 Rue de la Paix"),
     *             @OA\Property(property="city", type="string", example="Paris"),
     *             @OA\Property(property="country", type="string", example="France"),
     *             @OA\Property(property="opening_hours", type="object",
     *                 @OA\Property(property="monday", type="object",
     *                     @OA\Property(property="open", type="string", example="18:00"),
     *                     @OA\Property(property="close", type="string", example="02:00")
     *                 )
     *             ),
     *             @OA\Property(property="latitude", type="number", format="float", example=48.8566),
     *             @OA\Property(property="longitude", type="number", format="float", example=2.3522),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="age_restriction", type="integer", example=18),
     *             @OA\Property(property="smoking_area", type="boolean", example=false),
     *             @OA\Property(property="outdoor_seating", type="boolean", example=true),
     *             @OA\Property(property="images", type="array", @OA\Items(type="string", format="binary")),
     *             @OA\Property(property="feature_option_ids", type="array", @OA\Items(type="integer"), example={1, 2, 3})
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Lounge créé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Lounge created successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Lounge")
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
    public function store(LoungeRequest $request): LoungeResource|JsonResponse
    {
        try {
            $this->authorizeCanManageEstablishments();
            $data = $this->forceOwnerId($request->validated());
            
            // Save the lounge using the service
            $lounge = $this->loungeService->save($data);

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_CREATED,
                'success'   => true,
                'message'   => 'Lounge created successfully',
                'data'      => new LoungeResource($lounge)
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
     * Create a bar (lounge with venue_type=BAR).
     */
    public function storeBar(LoungeRequest $request): LoungeResource|JsonResponse
    {
        try {
            $this->authorizeCanManageEstablishments();
            $data = $this->forceOwnerId($request->validated());
            $data['venue_type'] = 'BAR';

            $lounge = $this->loungeService->save($data);

            return response()->json([
                'status' => Response::HTTP_CREATED,
                'success' => true,
                'message' => 'Bar created successfully',
                'data' => new LoungeResource($lounge),
            ], Response::HTTP_CREATED);
        } catch (HttpException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Get(
     *     path="/lounges/{id}",
     *     summary="Afficher un lounge",
     *     description="Récupère les détails d'un lounge spécifique",
     *     operationId="getLounge",
     *     tags={"Lounges"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID du lounge",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lounge récupéré avec succès",
     *         @OA\JsonContent(ref="#/components/schemas/Lounge")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Lounge non trouvé",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function show(int $id): LoungeResource
    {
        return LoungeResource::make($this->loungeService->getById($id));
    }

    /**
     * @OA\Put(
     *     path="/lounges/{id}",
     *     summary="Modifier un lounge",
     *     description="Met à jour un lounge existant",
     *     operationId="updateLounge",
     *     tags={"Lounges"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID du lounge à modifier",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Lounge VIP Modifié"),
     *             @OA\Property(property="description", type="string", example="Lounge élégant avec ambiance feutrée"),
     *             @OA\Property(property="address", type="string", example="123 Rue de la Paix"),
     *             @OA\Property(property="city", type="string", example="Paris"),
     *             @OA\Property(property="country", type="string", example="France"),
     *             @OA\Property(property="opening_hours", type="object",
     *                 @OA\Property(property="monday", type="object",
     *                     @OA\Property(property="open", type="string", example="18:00"),
     *                     @OA\Property(property="close", type="string", example="02:00")
     *                 )
     *             ),
     *             @OA\Property(property="latitude", type="number", format="float", example=48.8566),
     *             @OA\Property(property="longitude", type="number", format="float", example=2.3522),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="age_restriction", type="integer", example=18),
     *             @OA\Property(property="smoking_area", type="boolean", example=false),
     *             @OA\Property(property="outdoor_seating", type="boolean", example=true),
     *             @OA\Property(property="images", type="array", @OA\Items(type="string", format="binary")),
     *             @OA\Property(property="feature_option_ids", type="array", @OA\Items(type="integer"), example={1, 2, 3})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lounge modifié avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Lounge updated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Lounge")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Lounge non trouvé",
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
    public function update(LoungeRequest $request, int $id): LoungeResource|JsonResponse
    {
        try {
            $lounge = Lounge::findOrFail($id);
            $this->authorizeEstablishmentOwner($lounge);
            $data = $this->forceOwnerId($request->validated());
            
            // Update the lounge using the service
            $lounge = $this->loungeService->update($data, $id);

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_OK,
                'success'   => true,
                'message'   => 'Lounge updated successfully',
                'data'      => new LoungeResource($lounge)
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
     * Update a bar (force venue_type=BAR).
     */
    public function updateBar(LoungeRequest $request, int $id): LoungeResource|JsonResponse
    {
        try {
            $lounge = Lounge::findOrFail($id);
            $this->authorizeEstablishmentOwner($lounge);
            $data = $this->forceOwnerId($request->validated());
            $data['venue_type'] = 'BAR';

            $lounge = $this->loungeService->update($data, $id);

            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Bar updated successfully',
                'data' => new LoungeResource($lounge),
            ], Response::HTTP_OK);
        } catch (HttpException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Delete(
     *     path="/lounges/{id}",
     *     summary="Supprimer un lounge",
     *     description="Supprime un lounge existant",
     *     operationId="deleteLounge",
     *     tags={"Lounges"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID du lounge à supprimer",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lounge supprimé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Lounge deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Lounge non trouvé",
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
            $lounge = Lounge::findOrFail($id);
            $this->authorizeEstablishmentOwner($lounge);
            $this->loungeService->deleteById($id);
            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Lounge deleted successfully'
            ], Response::HTTP_OK);
        } catch (HttpException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get available tables for a lounge.
     */
    public function getAvailableTables(Request $request, int $lounge = 0, int $loungeId = 0, int $bar = 0): JsonResponse
    {
        $id = $lounge ?: $loungeId ?: $bar;
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'guests' => 'required|integer|min:1|max:20'
        ]);

        try {
            $tables = $this->loungeService->getAvailableTables(
                $id,
                $request->date,
                $request->time,
                $request->guests
            );

            return response()->json([
                'success' => true,
                'data' => $tables->map(function ($table) {
                    return [
                        'id' => $table->id,
                        'table_number' => $table->table_number,
                        'capacity' => $table->capacity,
                        'location' => $table->location,
                        'table_type' => $table->table_type,
                        'minimum_spend' => $table->minimum_spend,
                        'display_name' => $table->display_name,
                        'location_description' => $table->location_description,
                        'type_description' => $table->type_description,
                        'minimum_spend_formatted' => $table->minimum_spend_formatted,
                        'availability' => $table->getAvailabilityStatus(),
                    ];
                })
            ]);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get recommended tables for a lounge.
     */
    public function getRecommendedTables(Request $request, int $loungeId): JsonResponse
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'time' => 'required|date_format:H:i',
            'guests' => 'required|integer|min:1|max:20',
            'preference' => 'nullable|in:intimate,social,outdoor,smoking'
        ]);

        try {
            $tables = $this->loungeService->getRecommendedTables(
                $loungeId,
                $request->date,
                $request->time,
                $request->guests,
                $request->preference
            );

            return response()->json([
                'success' => true,
                'data' => $tables->map(function ($table) {
                    return [
                        'id' => $table->id,
                        'table_number' => $table->table_number,
                        'capacity' => $table->capacity,
                        'location' => $table->location,
                        'table_type' => $table->table_type,
                        'minimum_spend' => $table->minimum_spend,
                        'display_name' => $table->display_name,
                        'location_description' => $table->location_description,
                        'type_description' => $table->type_description,
                        'minimum_spend_formatted' => $table->minimum_spend_formatted,
                        'availability' => $table->getAvailabilityStatus(),
                    ];
                })
            ]);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Get available time slots for a lounge.
     */
    public function getAvailableTimeSlots(Request $request, int $loungeId): JsonResponse
    {
        $request->validate([
            'date' => 'required|date|after_or_equal:today',
            'guests' => 'required|integer|min:1|max:20'
        ]);

        try {
            $timeSlots = $this->loungeService->getAvailableTimeSlots(
                $loungeId,
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

    public function getLounge(int $lounge): LoungeResource
    {
        return $this->show($lounge);
    }

    /**
     * Get all public bars (lounges with venue_type=BAR).
     */
    public function getAllBars(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'city']);
        return LoungeResource::collection($this->loungeService->getAllBarsPublic($filters));
    }

    /**
     * Get a specific public bar.
     */
    public function getBar(int $bar): LoungeResource
    {
        return $this->show($bar);
    }

    /**
     * List bars with pagination (authenticated).
     */
    public function indexBars(Request $request): AnonymousResourceCollection
    {
        $ownerId = $this->resolvePrivateListOwnerId($request);

        return LoungeResource::collection(
            $this->loungeService->getAllBarsWithPagination(
                (int) $request->get('per_page', 15),
                $ownerId
            )
        );
    }

}