<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Services\FeatureOptionService;
use App\Http\Requests\FeatureOptionRequest;
use App\Http\Resources\FeatureOptionResource;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Feature Options")
 */
class FeatureOptionController extends Controller
{
    /**
     * @var FeatureOptionService
     */
    protected FeatureOptionService $featureOptionService;

    public function __construct(FeatureOptionService $featureOptionService)
    {
        $this->featureOptionService = $featureOptionService;
    }

    /**
     * @OA\Get(
     *     path="/feature-options",
     *     summary="Liste des options de caractéristiques",
     *     operationId="getFeatureOptions",
     *     tags={"Feature Options"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array", @OA\Items(ref="#/components/schemas/FeatureOption"))
     *         )
     *     )
     * )
     */
    public function index(): AnonymousResourceCollection
    {
        return FeatureOptionResource::collection($this->featureOptionService->getAll());
    }

    /**
     * @OA\Post(
     *     path="/feature-options",
     *     summary="Créer une option de caractéristique",
     *     description="Réservé à l'admin",
     *     operationId="createFeatureOption",
     *     tags={"Feature Options"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"feature_category_id", "name"},
     *             @OA\Property(property="feature_category_id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="Vue sur la ville"),
     *             @OA\Property(property="has_surcharge", type="boolean", example=false),
     *             @OA\Property(property="display_order", type="integer", example=1)
     *         )
     *     ),
     *     @OA\Response(response=201, description="Option créée avec succès", @OA\JsonContent(ref="#/components/schemas/FeatureOption")),
     *     @OA\Response(response=422, description="Erreur de validation", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
    public function store(FeatureOptionRequest $request): FeatureOptionResource|JsonResponse
    {
        try {
            $data = new FeatureOptionResource($this->featureOptionService->save($request->validated()));

            return response()->json([
                'status' => Response::HTTP_CREATED,
                'success' => true,
                'message' => 'Feature option created successfully',
                'data' => $data,
            ], Response::HTTP_CREATED);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Get(
     *     path="/feature-options/{id}",
     *     summary="Afficher une option de caractéristique",
     *     operationId="getFeatureOption",
     *     tags={"Feature Options"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Option récupérée", @OA\JsonContent(ref="#/components/schemas/FeatureOption")),
     *     @OA\Response(response=404, description="Non trouvée", @OA\JsonContent(ref="#/components/schemas/Error"))
     * )
     */
    public function show(int $id): FeatureOptionResource|JsonResponse
    {
        $option = $this->featureOptionService->getById($id);

        if (!$option) {
            return response()->json(['error' => 'Feature option not found.'], Response::HTTP_NOT_FOUND);
        }

        return FeatureOptionResource::make($option);
    }

    /**
     * @OA\Put(
     *     path="/feature-options/{id}",
     *     summary="Modifier une option de caractéristique",
     *     description="Réservé à l'admin",
     *     operationId="updateFeatureOption",
     *     tags={"Feature Options"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Option modifiée", @OA\JsonContent(ref="#/components/schemas/FeatureOption")),
     *     @OA\Response(response=404, description="Non trouvée", @OA\JsonContent(ref="#/components/schemas/Error")),
     *     @OA\Response(response=422, description="Erreur de validation", @OA\JsonContent(ref="#/components/schemas/ValidationError"))
     * )
     */
    public function update(FeatureOptionRequest $request, int $id): FeatureOptionResource|JsonResponse
    {
        try {
            $option = $this->featureOptionService->update($request->validated(), $id);

            if (!$option) {
                return response()->json(['error' => 'Feature option not found.'], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Feature option updated successfully',
                'data' => new FeatureOptionResource($option),
            ], Response::HTTP_OK);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Delete(
     *     path="/feature-options/{id}",
     *     summary="Supprimer une option de caractéristique",
     *     description="Réservé à l'admin",
     *     operationId="deleteFeatureOption",
     *     tags={"Feature Options"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(name="id", in="path", required=true, @OA\Schema(type="integer")),
     *     @OA\Response(response=200, description="Option supprimée"),
     *     @OA\Response(response=404, description="Non trouvée", @OA\JsonContent(ref="#/components/schemas/Error"))
     * )
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $deleted = $this->featureOptionService->deleteById($id);

            if (!$deleted) {
                return response()->json(['error' => 'Feature option not found.'], Response::HTTP_NOT_FOUND);
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
