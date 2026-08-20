<?php

namespace App\Http\Controllers\API;

use App\Models\Dwelling;
use App\Services\DwellingService;
use App\Http\Controllers\Controller;
use App\Http\Requests\DwellingRequest;
use App\Http\Resources\DwellingResource;
use App\Traits\AuthorizesEstablishmentOwnership;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DwellingController extends Controller
{
    use AuthorizesEstablishmentOwnership;

    protected DwellingService $dwellingService;

    public function __construct(DwellingService $dwellingService)
    {
        $this->dwellingService = $dwellingService;
    }

    // -------------------------------------------------------------------------
    // Routes publiques
    // -------------------------------------------------------------------------

    public function getAllPublic(Request $request): AnonymousResourceCollection
    {
        $filters = $request->only([
            'search',
            'city',
            'type',
            'order_price',
            'structure_type',
            'construction_type',
            'min_price',
            'max_price',
            'min_rooms',
            'is_available',
        ]);
        $perPage = $request->get('per_page', 15);
        return DwellingResource::collection($this->dwellingService->getPublic($filters, $perPage));
    }

    public function getPublicById(int $id): DwellingResource|JsonResponse
    {
        $dwelling = $this->dwellingService->getById($id);
        if (!$dwelling) {
            return response()->json(['success' => false, 'message' => 'Hébergement introuvable.'], Response::HTTP_NOT_FOUND);
        }
        return DwellingResource::make($dwelling);
    }

    // -------------------------------------------------------------------------
    // Routes protégées
    // -------------------------------------------------------------------------

    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $perPage = $request->get('per_page', 15);

        if ($user->isAdmin()) {
            $ownerId = $request->get('owner_id');
            if ($ownerId) {
                return DwellingResource::collection($this->dwellingService->getByOwner($ownerId, $perPage));
            }
            return DwellingResource::collection($this->dwellingService->getAllWithPagination($perPage));
        }

        return DwellingResource::collection($this->dwellingService->getByOwner($user->id, $perPage));
    }

    public function show(int $id): DwellingResource|JsonResponse
    {
        $dwelling = $this->dwellingService->getById($id);
        if (!$dwelling) {
            return response()->json(['success' => false, 'message' => 'Hébergement introuvable.'], Response::HTTP_NOT_FOUND);
        }
        return DwellingResource::make($dwelling);
    }

    public function store(DwellingRequest $request): JsonResponse
    {
        try {
            $this->authorizeCanManageEstablishments();
            $data = $this->forceOwnerId($request->validated());

            $images = $request->file('images') ?? [];
            $mainImage = !empty($images) ? array_shift($images) : null;

            $dwelling = $this->dwellingService->create($data, $mainImage, $images);

            return response()->json([
                'status' => Response::HTTP_CREATED,
                'success' => true,
                'message' => 'Hébergement créé avec succès.',
                'data' => new DwellingResource($dwelling),
            ], Response::HTTP_CREATED);
        } catch (HttpException $e) {
            throw $e;
        } catch (\Exception $e) {
            report($e);
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function update(DwellingRequest $request, int $id): JsonResponse
    {
        try {
            $dwelling = Dwelling::findOrFail($id);
            $this->authorizeEstablishmentOwner($dwelling);
            $data = $this->forceOwnerId($request->validated());
            $images = $request->file('images') ?? [];
            $mainImage = !empty($images) ? array_shift($images) : null;

            $dwelling = $this->dwellingService->update($id, $data, $mainImage, $images);

            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Hébergement mis à jour avec succès.',
                'data' => new DwellingResource($dwelling),
            ], Response::HTTP_OK);
        } catch (HttpException $e) {
            throw $e;
        } catch (\Exception $e) {
            report($e);
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $dwelling = Dwelling::findOrFail($id);
            $this->authorizeEstablishmentOwner($dwelling);
            $this->dwellingService->delete($id);
            return response()->json(['status' => Response::HTTP_OK, 'success' => true, 'message' => 'Hébergement supprimé.'], Response::HTTP_OK);
        } catch (HttpException $e) {
            throw $e;
        } catch (\Exception $e) {
            report($e);
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function toggleAvailability(int $id): JsonResponse
    {
        try {
            $dwelling = $this->dwellingService->toggleAvailability($id);
            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Disponibilité mise à jour.',
                'data' => new DwellingResource($dwelling),
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['error' => $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
