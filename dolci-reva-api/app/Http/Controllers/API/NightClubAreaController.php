<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\NightClubAreaRequest;
use App\Http\Resources\NightClubAreaResource;
use App\Models\NightClub;
use App\Models\NightClubArea;
use App\Services\NightClubAreaService;
use App\Traits\AuthorizesEstablishmentOwnership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class NightClubAreaController extends Controller
{
    use AuthorizesEstablishmentOwnership;

    public function __construct(protected NightClubAreaService $service)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return NightClubAreaResource::collection($this->service->getAll());
    }

    public function getByNightClub(int|string|NightClub $nightClub): AnonymousResourceCollection
    {
        $id = $nightClub instanceof NightClub ? $nightClub->id : (int) $nightClub;
        return NightClubAreaResource::collection($this->service->getByNightClubId($id));
    }

    public function store(NightClubAreaRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $this->authorizeEstablishmentOwner(NightClub::findOrFail($validated['night_club_id']));
            $area = $this->service->save($validated);
            return response()->json([
                'status' => Response::HTTP_CREATED,
                'success' => true,
                'message' => 'Zone créée avec succès',
                'data' => new NightClubAreaResource($area),
            ], Response::HTTP_CREATED);
        } catch (HttpException $e) {
            throw $e;
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function show(int $id): NightClubAreaResource|JsonResponse
    {
        $area = $this->service->getById($id);
        if (!$area) {
            return response()->json(['success' => false, 'message' => 'Zone introuvable'], Response::HTTP_NOT_FOUND);
        }
        return new NightClubAreaResource($area);
    }

    public function update(NightClubAreaRequest $request, int $id): JsonResponse
    {
        try {
            $existingArea = NightClubArea::with('nightClub')->findOrFail($id);
            $this->authorizeEstablishmentOwner($existingArea->nightClub);
            $validated = $request->validated();
            if (isset($validated['night_club_id']) && (int) $validated['night_club_id'] !== (int) $existingArea->night_club_id) {
                $this->authorizeEstablishmentOwner(NightClub::findOrFail($validated['night_club_id']));
            }
            $area = $this->service->update($validated, $id);
            if (!$area) {
                return response()->json(['success' => false, 'message' => 'Zone introuvable'], Response::HTTP_NOT_FOUND);
            }
            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Zone mise à jour',
                'data' => new NightClubAreaResource($area),
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
            $area = NightClubArea::with('nightClub')->findOrFail($id);
            $this->authorizeEstablishmentOwner($area->nightClub);
            $this->service->deleteById($id);
            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Zone supprimée',
            ]);
        } catch (HttpException $e) {
            throw $e;
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
