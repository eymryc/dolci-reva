<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Services\BusinessTypeService;
use App\Http\Requests\BusinessTypeRequest;
use App\Http\Resources\BusinessTypeResource;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Business Types")
 */
class BusinessTypeController extends Controller
{
    /**
     * @var BusinessTypeService
     */
    protected BusinessTypeService $businessTypeService;

    /**
     * DummyModel Constructor
     *
     * @param BusinessTypeService $businessTypeService
     *
     */
    public function __construct(BusinessTypeService $businessTypeService)
    {
        $this->businessTypeService = $businessTypeService;
    }

    /**
     * @OA\Get(
     *     path="/business-types",
     *     summary="Liste des types de business",
     *     description="Récupère la liste de tous les types de business",
     *     operationId="getBusinessTypes",
     *     tags={"Business Types"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des types de business récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/BusinessType")
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
        //
        return BusinessTypeResource::collection($this->businessTypeService->getAllWithPagination());
    }

    /**
     * @OA\Post(
     *     path="/business-types",
     *     summary="Créer un type de business",
     *     description="Crée un nouveau type de business",
     *     operationId="createBusinessType",
     *     tags={"Business Types"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "description"},
     *             @OA\Property(property="name", type="string", example="Restaurant"),
     *             @OA\Property(property="description", type="string", example="Établissement de restauration"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Type de business créé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Business type created successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/BusinessType")
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
    public function store(BusinessTypeRequest $request): BusinessTypeResource|JsonResponse
    {       
        try {

            // Save the category using the service
            $data =  new BusinessTypeResource($this->businessTypeService->save($request->validated()));

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_CREATED,
                'success'   => true,
                'message'   => 'Business type created successfully',
                'data'      =>  $data
            ], Response::HTTP_CREATED);

            // Return response
            return $response;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Get(
     *     path="/business-types/{id}",
     *     summary="Afficher un type de business",
     *     description="Récupère les détails d'un type de business spécifique",
     *     operationId="getBusinessType",
     *     tags={"Business Types"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID du type de business",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Type de business récupéré avec succès",
     *         @OA\JsonContent(ref="#/components/schemas/BusinessType")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Type de business non trouvé",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function show(int $id): BusinessTypeResource
    {
        return BusinessTypeResource::make($this->businessTypeService->getById($id));
    }

    /**
     * @OA\Put(
     *     path="/business-types/{id}",
     *     summary="Modifier un type de business",
     *     description="Met à jour un type de business existant",
     *     operationId="updateBusinessType",
     *     tags={"Business Types"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID du type de business à modifier",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Restaurant Modifié"),
     *             @OA\Property(property="description", type="string", example="Établissement de restauration"),
     *             @OA\Property(property="is_active", type="boolean", example=true)
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Type de business modifié avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Business type updated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/BusinessType")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Type de business non trouvé",
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
    public function update(BusinessTypeRequest $request, int $id): BusinessTypeResource|JsonResponse
    {
        try {

            // Update the category using the service
            $data = new BusinessTypeResource($this->businessTypeService->update($request->validated(), $id));

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_OK,
                'success'   => true,
                'message'   => 'Business type updated successfully',
                'data'      => $data
            ], Response::HTTP_OK);

            // Return response
            return $response;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Delete(
     *     path="/business-types/{id}",
     *     summary="Supprimer un type de business",
     *     description="Supprime un type de business existant",
     *     operationId="deleteBusinessType",
     *     tags={"Business Types"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID du type de business à supprimer",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Type de business supprimé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="message", type="string", example="Deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Type de business non trouvé",
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
            $this->businessTypeService->deleteById($id);
            return response()->json([
                'success' => true,
                'status' => Response::HTTP_OK,
                'message' => 'Deleted successfully'
            ], Response::HTTP_OK);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
