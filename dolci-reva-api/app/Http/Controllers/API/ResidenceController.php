<?php

namespace App\Http\Controllers\API;

use App\Models\Residence;
use App\Traits\AuthorizesEstablishmentOwnership;
use Illuminate\Http\Request;
use App\Services\ResidenceService;
use App\Http\Controllers\Controller;
use App\Http\Requests\ResidenceRequest;
use App\Http\Resources\ResidenceResource;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Residences")
 */
class ResidenceController extends Controller
{
    use AuthorizesEstablishmentOwnership;

    /**
     * @var ResidenceService
     */
    protected ResidenceService $residenceService;

    /**
     * ResidenceController Constructor
     *
     * @param ResidenceService $residenceService
     */
    public function __construct(ResidenceService $residenceService)
    {
        $this->residenceService = $residenceService;
    }

    /**
     * @OA\Get(
     *     path="/residences",
     *     summary="Liste des résidences",
     *     description="Récupère la liste de toutes les résidences de l'utilisateur authentifié",
     *     operationId="getResidences",
     *     tags={"Residences"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des résidences récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/Residence")
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

        return ResidenceResource::collection(
            $this->residenceService->getAllWithPagination(
                (int) $request->get('per_page', 15),
                $ownerId
            )
        );
    }


    /**
     * @OA\Get(
     *     path="/public/residences",
     *     summary="Liste des résidences (public)",
     *     description="Récupère la liste de toutes les résidences disponibles sans authentification",
     *     operationId="getAllResidences",
     *     tags={"Public", "Residences"},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des résidences récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/Residence")
     *             )
     *         )
     *     )
     * )
     */
    public function getAllResidences(Request $request): AnonymousResourceCollection
    {   
        // Get all residences
        return ResidenceResource::collection($this->residenceService->getAvailable($request));
    }

    /**
     * @OA\Post(
     *     path="/residences",
     *     summary="Créer une résidence",
     *     description="Crée une nouvelle résidence",
     *     operationId="createResidence",
     *     tags={"Residences"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "description", "address", "city", "country", "property_type"},
     *             @OA\Property(property="name", type="string", example="Villa de Luxe"),
     *             @OA\Property(property="description", type="string", example="Magnifique villa avec piscine privée"),
     *             @OA\Property(property="address", type="string", example="123 Rue de la Paix"),
     *             @OA\Property(property="city", type="string", example="Nice"),
     *             @OA\Property(property="country", type="string", example="France"),
     *             @OA\Property(property="property_type", type="string", enum={"APARTMENT", "HOUSE", "VILLA", "STUDIO"}, example="VILLA"),
     *             @OA\Property(property="rental_type", type="string", enum={"DAILY", "WEEKLY", "MONTHLY"}, example="DAILY"),
     *             @OA\Property(property="bedrooms", type="integer", example=3),
     *             @OA\Property(property="bathrooms", type="integer", example=2),
     *             @OA\Property(property="max_guests", type="integer", example=6),
     *             @OA\Property(property="price_per_night", type="number", format="float", example=200.00),
     *             @OA\Property(property="latitude", type="number", format="float", example=43.7102),
     *             @OA\Property(property="longitude", type="number", format="float", example=7.2620),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="images", type="array", @OA\Items(type="string", format="binary")),
     *             @OA\Property(property="feature_option_ids", type="array", @OA\Items(type="integer"), example={1, 2, 3})
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Résidence créée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Residence created successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Residence")
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
    public function store(ResidenceRequest $request): ResidenceResource|\Illuminate\Http\JsonResponse
    {
        try {
            $this->authorizeCanManageEstablishments();
            $data = new ResidenceResource($this->residenceService->save(
                $this->forceOwnerId($request->validated())
            ));

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_CREATED,
                'success'   => true,    
                'message'   => 'Residence created successfully',
                'data'      => $data
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
     *     path="/residences/{id}",
     *     summary="Afficher une résidence",
     *     description="Récupère les détails d'une résidence spécifique",
     *     operationId="getResidence",
     *     tags={"Residences"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la résidence",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Résidence récupérée avec succès",
     *         @OA\JsonContent(ref="#/components/schemas/Residence")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Résidence non trouvée",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function show(int $id): ResidenceResource
    {
        return ResidenceResource::make($this->residenceService->getById($id));
    }

    /**
     * @OA\Put(
     *     path="/residences/{id}",
     *     summary="Modifier une résidence",
     *     description="Met à jour une résidence existante",
     *     operationId="updateResidence",
     *     tags={"Residences"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la résidence à modifier",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Villa de Luxe Modifiée"),
     *             @OA\Property(property="description", type="string", example="Magnifique villa avec piscine privée"),
     *             @OA\Property(property="address", type="string", example="123 Rue de la Paix"),
     *             @OA\Property(property="city", type="string", example="Nice"),
     *             @OA\Property(property="country", type="string", example="France"),
     *             @OA\Property(property="property_type", type="string", enum={"APARTMENT", "HOUSE", "VILLA", "STUDIO"}, example="VILLA"),
     *             @OA\Property(property="rental_type", type="string", enum={"DAILY", "WEEKLY", "MONTHLY"}, example="DAILY"),
     *             @OA\Property(property="bedrooms", type="integer", example=3),
     *             @OA\Property(property="bathrooms", type="integer", example=2),
     *             @OA\Property(property="max_guests", type="integer", example=6),
     *             @OA\Property(property="price_per_night", type="number", format="float", example=200.00),
     *             @OA\Property(property="latitude", type="number", format="float", example=43.7102),
     *             @OA\Property(property="longitude", type="number", format="float", example=7.2620),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="images", type="array", @OA\Items(type="string", format="binary")),
     *             @OA\Property(property="feature_option_ids", type="array", @OA\Items(type="integer"), example={1, 2, 3})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Résidence modifiée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Residence updated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Residence")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Résidence non trouvée",
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
    public function update(ResidenceRequest $request, int $id): ResidenceResource|\Illuminate\Http\JsonResponse
    {
        try {
            $residence = Residence::findOrFail($id);
            $this->authorizeEstablishmentOwner($residence);
            $data = new ResidenceResource($this->residenceService->update(
                $this->forceOwnerId($request->validated()),
                $id
            ));
            
            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_OK,
                'success'   => true,
                'message'   => 'Residence updated successfully',
                'data'      => $data
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
     *     path="/residences/{id}",
     *     summary="Supprimer une résidence",
     *     description="Supprime une résidence existante",
     *     operationId="deleteResidence",
     *     tags={"Residences"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de la résidence à supprimer",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Résidence supprimée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Residence deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Résidence non trouvée",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function destroy(int $id): \Illuminate\Http\JsonResponse
    {
        try {
            $residence = Residence::findOrFail($id);
            $this->authorizeEstablishmentOwner($residence);
            $this->residenceService->deleteById($id);
            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Residence deleted successfully'
            ], Response::HTTP_OK);
        } catch (HttpException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Check availability for specific dates.
     */
    public function checkAvailability(Request $request, int $id): \Illuminate\Http\JsonResponse
    {
        try {
            $request->validate([
                'check_in_date' => 'required|date|after_or_equal:today',
                'check_out_date' => 'required|date|after:check_in_date',
            ]);

            $residence = $this->residenceService->getById($id);
            if (!$residence) {
                return response()->json(['error' => 'Residence not found'], Response::HTTP_NOT_FOUND);
            }

            $isAvailable = $residence->isAvailableForDates(
                $request->check_in_date,
                $request->check_out_date
            );

            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'data' => [
                    'residence_id' => $id,
                    'check_in_date' => $request->check_in_date,
                    'check_out_date' => $request->check_out_date,
                    'is_available' => $isAvailable,
                    'next_available_date' => $residence->getNextAvailableDate(),
                ]
            ], Response::HTTP_OK);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }


    public function getResidence(int $id): ResidenceResource|\Illuminate\Http\JsonResponse
    {   
        $residence = $this->residenceService->getById($id);
        if (!$residence) {
            return response()->json(['error' => 'Residence not found'], Response::HTTP_NOT_FOUND);
        }
        return ResidenceResource::make($residence);
    }
}
