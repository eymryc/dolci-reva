<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;
use App\Services\OpinionService;
use App\Http\Requests\OpinionRequest;
use App\Http\Resources\OpinionResource;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Opinions")
 */
class OpinionController extends Controller
{
    /**
     * @var OpinionService
     */
    protected OpinionService $opinionService;

    /**
     * OpinionController Constructor
     *
     * @param OpinionService $opinionService
     *
     */
    public function __construct(OpinionService $opinionService)
    {
        $this->opinionService = $opinionService;
    }

    /**
     * @OA\Get(
     *     path="/opinions",
     *     summary="Liste des opinions",
     *     description="Récupère la liste de toutes les opinions",
     *     operationId="getOpinions",
     *     tags={"Opinions"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des opinions récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/Opinion")
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
        return OpinionResource::collection($this->opinionService->getAllWithPagination());
    }

    /**
     * @OA\Post(
     *     path="/opinions",
     *     summary="Créer une opinion",
     *     description="Crée une nouvelle opinion",
     *     operationId="createOpinion",
     *     tags={"Opinions"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"residence_id", "comment", "note"},
     *             @OA\Property(property="residence_id", type="integer", example=1),
     *             @OA\Property(property="comment", type="string", example="Très bon service, je recommande vivement !"),
     *             @OA\Property(property="display", type="boolean", example=true),
     *             @OA\Property(property="note", type="integer", example=5, description="Note entre 0 et 5")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Opinion créée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Opinion created successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Opinion")
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
    public function store(OpinionRequest $request): OpinionResource|JsonResponse
    {       
        try {

            // Save the opinion using the service
            $data =  new OpinionResource($this->opinionService->save($request->validated()));

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_CREATED,
                'success'   => true,
                'message'   => 'Opinion created successfully',
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
     *     path="/opinions/{id}",
     *     summary="Afficher une opinion",
     *     description="Récupère les détails d'une opinion spécifique",
     *     operationId="getOpinion",
     *     tags={"Opinions"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'opinion",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Opinion récupérée avec succès",
     *         @OA\JsonContent(ref="#/components/schemas/Opinion")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Opinion non trouvée",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function show(int $id): OpinionResource
    {
        return OpinionResource::make($this->opinionService->getById($id));
    }

    /**
     * @OA\Put(
     *     path="/opinions/{id}",
     *     summary="Modifier une opinion",
     *     description="Met à jour une opinion existante",
     *     operationId="updateOpinion",
     *     tags={"Opinions"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'opinion à modifier",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="residence_id", type="integer", example=1),
     *             @OA\Property(property="comment", type="string", example="Service excellent, je recommande !"),
     *             @OA\Property(property="display", type="boolean", example=true),
     *             @OA\Property(property="note", type="integer", example=5, description="Note entre 0 et 5")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Opinion modifiée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Opinion updated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Opinion")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Opinion non trouvée",
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
    public function update(OpinionRequest $request, int $id): OpinionResource|JsonResponse
    {
        try {
            $opinion = $this->opinionService->getById($id);
            /** @var \App\Models\User $user */
            $user = auth()->user();
            if (!$opinion || (!$user->isAdmin() && (int) $opinion->user_id !== (int) $user->id)) {
                return response()->json(['success' => false, 'message' => 'Accès non autorisé.'], Response::HTTP_FORBIDDEN);
            }

            $data = new OpinionResource($this->opinionService->update($request->validated(), $id));

            return response()->json([
                'status'    => Response::HTTP_OK,
                'success'   => true,
                'message'   => 'Opinion updated successfully',
                'data'      => $data
            ], Response::HTTP_OK);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Delete(
     *     path="/opinions/{id}",
     *     summary="Supprimer une opinion",
     *     description="Supprime une opinion existante",
     *     operationId="deleteOpinion",
     *     tags={"Opinions"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'opinion à supprimer",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Opinion supprimée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="message", type="string", example="Deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Opinion non trouvée",
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
            $opinion = $this->opinionService->getById($id);
            /** @var \App\Models\User $user */
            $user = auth()->user();
            if (!$opinion || (!$user->isAdmin() && (int) $opinion->user_id !== (int) $user->id)) {
                return response()->json(['success' => false, 'message' => 'Accès non autorisé.'], Response::HTTP_FORBIDDEN);
            }

            $this->opinionService->deleteById($id);
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


    public function getOpinionById(int $id): AnonymousResourceCollection|JsonResponse
    {   
        // find the opinions by residence id
        $opinions = $this->opinionService->getOpinionById($id);
        if (!$opinions || $opinions->isEmpty()) {
            return response()->json(['error' => 'Opinions not found'], Response::HTTP_NOT_FOUND);
        }
        return OpinionResource::collection($opinions);
    }
}

