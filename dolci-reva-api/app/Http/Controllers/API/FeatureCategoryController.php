<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Services\FeatureCategoryService;
use App\Http\Requests\FeatureCategoryRequest;
use App\Http\Resources\FeatureCategoryResource;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Feature Categories")
 */
class FeatureCategoryController extends Controller
{
    /**
     * @var FeatureCategoryService
     */
    protected FeatureCategoryService $featureCategoryService;

    public function __construct(FeatureCategoryService $featureCategoryService)
    {
        $this->featureCategoryService = $featureCategoryService;
    }

    /**
     * @OA\Get(
     *     path="/feature-categories",
     *     summary="Liste des catégories de caractéristiques",
     *     description="Récupère le catalogue de catégories (et leurs options), filtrable par type d'établissement",
     *     operationId="getFeatureCategories",
     *     tags={"Feature Categories"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="establishment_type",
     *         in="query",
     *         required=false,
     *         description="Ex: HOTEL_ROOM, RESIDENCE, RESTAURANT, LOUNGE, NIGHT_CLUB, NIGHT_CLUB_AREA",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Liste récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/FeatureCategory")
     *             )
     *         )
     *     )
     * )
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        return FeatureCategoryResource::collection(
            $this->featureCategoryService->getAll($request->query('establishment_type'))
        );
    }

    /**
     * @OA\Post(
     *     path="/feature-categories",
     *     summary="Créer une catégorie de caractéristiques",
     *     description="Réservé à l'admin",
     *     operationId="createFeatureCategory",
     *     tags={"Feature Categories"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "establishment_types"},
     *             @OA\Property(property="name", type="string", example="Vues"),
     *             @OA\Property(property="icon", type="string", example="eye"),
     *             @OA\Property(property="display_order", type="integer", example=1),
     *             @OA\Property(property="establishment_types", type="array", @OA\Items(type="string"), example={"App\Models\Residence","App\Models\HotelRoom"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Catégorie créée avec succès",
     *         @OA\JsonContent(ref="#/components/schemas/FeatureCategory")
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     )
     * )
     */
    public function store(FeatureCategoryRequest $request): FeatureCategoryResource|JsonResponse
    {
        try {
            $data = new FeatureCategoryResource($this->featureCategoryService->save($request->validated()));

            return response()->json([
                'status' => Response::HTTP_CREATED,
                'success' => true,
                'message' => 'Feature category created successfully',
                'data' => $data,
            ], Response::HTTP_CREATED);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Get(
     *     path="/feature-categories/{id}",
     *     summary="Afficher une catégorie de caractéristiques",
     *     operationId="getFeatureCategory",
     *     tags={"Feature Categories"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Catégorie récupérée", @OA\JsonContent(ref="#/components/schemas/FeatureCategory")),
     *     @OA\Response(response=404, description="Non trouvée", @OA\JsonContent(ref="#/components/schemas/Error"))
     * )
     */
    public function show(int $id): FeatureCategoryResource|JsonResponse
    {
        $category = $this->featureCategoryService->getById($id);

        if (!$category) {
            return response()->json(['error' => 'Feature category not found.'], Response::HTTP_NOT_FOUND);
        }

        return FeatureCategoryResource::make($category);
    }

    /**
     * @OA\Put(
     *     path="/feature-categories/{id}",
     *     summary="Modifier une catégorie de caractéristiques",
     *     description="Réservé à l'admin",
     *     operationId="updateFeatureCategory",
     *     tags={"Feature Categories"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Catégorie modifiée", @OA\JsonContent(ref="#/components/schemas/FeatureCategory")),
     *     @OA\Response(response=404, description="Non trouvée", @OA\JsonContent(ref="#/components/schemas/Error")),
     *     @OA\Response(response=422, description="Erreur de validation", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
    public function update(FeatureCategoryRequest $request, int $id): FeatureCategoryResource|JsonResponse
    {
        try {
            $category = $this->featureCategoryService->update($request->validated(), $id);

            if (!$category) {
                return response()->json(['error' => 'Feature category not found.'], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Feature category updated successfully',
                'data' => new FeatureCategoryResource($category),
            ], Response::HTTP_OK);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Delete(
     *     path="/feature-categories/{id}",
     *     summary="Supprimer une catégorie de caractéristiques",
     *     description="Réservé à l'admin",
     *     operationId="deleteFeatureCategory",
     *     tags={"Feature Categories"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Catégorie supprimée"),
     *     @OA\Response(response=404, description="Non trouvée", @OA\JsonContent(ref="#/components/schemas/Error"))
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->featureCategoryService->deleteById($id);

            if (!$deleted) {
                return response()->json(['error' => 'Feature category not found.'], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'success' => true,
                'status' => Response::HTTP_OK,
                'message' => 'Deleted successfully',
            ], Response::HTTP_OK);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
