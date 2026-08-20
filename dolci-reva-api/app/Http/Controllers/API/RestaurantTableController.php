<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\RestaurantTableRequest;
use App\Http\Resources\RestaurantTableResource;
use App\Models\Restaurant;
use App\Models\RestaurantTable;
use App\Services\RestaurantTableService;
use App\Traits\AuthorizesEstablishmentOwnership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class RestaurantTableController extends Controller
{
    use AuthorizesEstablishmentOwnership;

    public function __construct(protected RestaurantTableService $service)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return RestaurantTableResource::collection($this->service->getAll());
    }

    public function getByRestaurant(int|string|Restaurant $restaurant): AnonymousResourceCollection
    {
        $id = $restaurant instanceof Restaurant ? $restaurant->id : (int) $restaurant;
        return RestaurantTableResource::collection($this->service->getByRestaurantId($id));
    }

    public function store(RestaurantTableRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $this->authorizeEstablishmentOwner(Restaurant::findOrFail($validated['restaurant_id']));
            $table = $this->service->save($validated);
            return response()->json([
                'status' => Response::HTTP_CREATED,
                'success' => true,
                'message' => 'Table créée avec succès',
                'data' => new RestaurantTableResource($table),
            ], Response::HTTP_CREATED);
        } catch (HttpException $e) {
            throw $e;
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function show(int $id): RestaurantTableResource|JsonResponse
    {
        $table = $this->service->getById($id);
        if (!$table) {
            return response()->json(['success' => false, 'message' => 'Table introuvable'], Response::HTTP_NOT_FOUND);
        }
        return new RestaurantTableResource($table);
    }

    public function update(RestaurantTableRequest $request, int $id): JsonResponse
    {
        try {
            $existingTable = RestaurantTable::with('restaurant')->findOrFail($id);
            $this->authorizeEstablishmentOwner($existingTable->restaurant);
            $validated = $request->validated();
            if (isset($validated['restaurant_id']) && (int) $validated['restaurant_id'] !== (int) $existingTable->restaurant_id) {
                $this->authorizeEstablishmentOwner(Restaurant::findOrFail($validated['restaurant_id']));
            }
            $table = $this->service->update($validated, $id);
            if (!$table) {
                return response()->json(['success' => false, 'message' => 'Table introuvable'], Response::HTTP_NOT_FOUND);
            }
            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Table mise à jour',
                'data' => new RestaurantTableResource($table),
            ]);
        } catch (HttpException $e) {
            throw $e;
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $table = RestaurantTable::with('restaurant')->findOrFail($id);
            $this->authorizeEstablishmentOwner($table->restaurant);
            $this->service->deleteById($id);
            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Table supprimée',
            ]);
        } catch (HttpException $e) {
            throw $e;
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
