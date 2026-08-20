<?php

namespace App\Http\Controllers\API;

use App\Models\Hotel;
use Illuminate\Http\Request;
use App\Services\HotelService;
use App\Http\Requests\HotelRequest;
use App\Http\Controllers\Controller;
use App\Http\Resources\HotelResource;
use App\Traits\AuthorizesEstablishmentOwnership;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Hotels")
 */
class HotelController extends Controller
{
    use AuthorizesEstablishmentOwnership;

    /**
     * @var HotelService
     */
    protected $hotelService;

    public function __construct(HotelService $hotelService)
    {
        $this->hotelService = $hotelService;
    }

    /**
     * @OA\Get(
     *     path="/hotels",
     *     summary="Liste des hôtels",
     *     description="Récupère la liste de tous les hôtels de l'utilisateur authentifié",
     *     operationId="getHotels",
     *     tags={"Hotels"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des hôtels récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/Hotel")
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

        return HotelResource::collection(
            $this->hotelService->getAllWithPagination(
                (int) $request->get('per_page', 15),
                $ownerId
            )
        );
    }

    /**
     * @OA\Get(
     *     path="/public/hotels",
     *     summary="Liste des hôtels (public)",
     *     description="Récupère la liste de tous les hôtels disponibles sans authentification",
     *     operationId="getAllHotels",
     *     tags={"Public", "Hotels"},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des hôtels récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/Hotel")
     *             )
     *         )
     *     )
     * )
     */
    public function getAllHotels(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only(['search', 'city', 'star_rating']);

        return HotelResource::collection($this->hotelService->getAvailable($filters));
    }

    /**
     * @OA\Post(
     *     path="/hotels",
     *     summary="Créer un hôtel",
     *     description="Crée un nouvel hôtel",
     *     operationId="createHotel",
     *     tags={"Hotels"},
     *     security={{"bearerAuth": {}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name", "description", "address", "city", "country"},
     *             @OA\Property(property="name", type="string", example="Hôtel de Luxe"),
     *             @OA\Property(property="description", type="string", example="Un hôtel de luxe au cœur de la ville"),
     *             @OA\Property(property="address", type="string", example="123 Rue de la Paix"),
     *             @OA\Property(property="city", type="string", example="Paris"),
     *             @OA\Property(property="country", type="string", example="France"),
     *             @OA\Property(property="latitude", type="number", format="float", example=48.8566),
     *             @OA\Property(property="longitude", type="number", format="float", example=2.3522),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="images", type="array", @OA\Items(type="string", format="binary")),
     *             @OA\Property(property="feature_option_ids", type="array", @OA\Items(type="integer"), example={1, 2, 3})
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Hôtel créé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Hotel created successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Hotel")
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
    public function store(HotelRequest $request)
    {
        try {
            $this->authorizeCanManageEstablishments();
            $data = $this->forceOwnerId($request->validated());
            $hotel = $this->hotelService->save($data);

            return response()->json([
                'status' => Response::HTTP_CREATED,
                'success' => true,
                'message' => 'Hotel created successfully',
                'data' => new HotelResource($hotel->load('owner', 'hotelRooms', 'media', 'featureOptions'))
            ], Response::HTTP_CREATED);
        } catch (HttpException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * @OA\Get(
     *     path="/hotels/{hotel}",
     *     summary="Afficher un hôtel",
     *     description="Récupère les détails d'un hôtel spécifique",
     *     operationId="getHotel",
     *     tags={"Hotels"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="hotel",
     *         in="path",
     *         required=true,
     *         description="ID de l'hôtel",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Hôtel récupéré avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Hotel retrieved successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Hotel")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Hôtel non trouvé",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function show(Hotel $hotel)
    {
        try {
            $hotel = $this->hotelService->getById($hotel->id);

            if (!$hotel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hotel not found'
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Hotel retrieved successfully',
                'data' => new HotelResource($hotel->load('owner', 'hotelRooms', 'media', 'featureOptions'))
            ], Response::HTTP_OK);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * @OA\Put(
     *     path="/hotels/{hotel}",
     *     summary="Modifier un hôtel",
     *     description="Met à jour un hôtel existant",
     *     operationId="updateHotel",
     *     tags={"Hotels"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="hotel",
     *         in="path",
     *         required=true,
     *         description="ID de l'hôtel à modifier",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="name", type="string", example="Hôtel de Luxe Modifié"),
     *             @OA\Property(property="description", type="string", example="Un hôtel de luxe au cœur de la ville"),
     *             @OA\Property(property="address", type="string", example="123 Rue de la Paix"),
     *             @OA\Property(property="city", type="string", example="Paris"),
     *             @OA\Property(property="country", type="string", example="France"),
     *             @OA\Property(property="latitude", type="number", format="float", example=48.8566),
     *             @OA\Property(property="longitude", type="number", format="float", example=2.3522),
     *             @OA\Property(property="is_active", type="boolean", example=true),
     *             @OA\Property(property="images", type="array", @OA\Items(type="string", format="binary")),
     *             @OA\Property(property="feature_option_ids", type="array", @OA\Items(type="integer"), example={1, 2, 3})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Hôtel modifié avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Hotel updated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/Hotel")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Hôtel non trouvé",
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
    public function update(HotelRequest $request, Hotel $hotel)
    {
        try {
            $this->authorizeEstablishmentOwner($hotel);
            $data = $this->forceOwnerId($request->validated());
            $hotel = $this->hotelService->update($data, $hotel->id);

            if (!$hotel) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hotel not found'
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Hotel updated successfully',
                'data' => new HotelResource($hotel->load('owner', 'hotelRooms', 'media', 'featureOptions'))
            ], Response::HTTP_OK);
        } catch (HttpException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    /**
     * @OA\Delete(
     *     path="/hotels/{hotel}",
     *     summary="Supprimer un hôtel",
     *     description="Supprime un hôtel existant",
     *     operationId="deleteHotel",
     *     tags={"Hotels"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="hotel",
     *         in="path",
     *         required=true,
     *         description="ID de l'hôtel à supprimer",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Hôtel supprimé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Hotel deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Hôtel non trouvé",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function destroy(Hotel $hotel)
    {
        try {
            $this->authorizeEstablishmentOwner($hotel);
            $deleted = $this->hotelService->deleteById($hotel->id);

            if (!$deleted) {
                return response()->json([
                    'success' => false,
                    'message' => 'Hotel not found'
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Hotel deleted successfully'
            ], Response::HTTP_OK);
        } catch (HttpException $exception) {
            throw $exception;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json([
                'success' => false,
                'message' => $exception->getMessage()
            ], Response::HTTP_BAD_REQUEST);
        }
    }

    public function getHotel(Hotel $hotel)
    {
        return $this->show($hotel);
    }
}
