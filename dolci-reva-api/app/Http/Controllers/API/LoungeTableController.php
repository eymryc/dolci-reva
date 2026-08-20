<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoungeTableRequest;
use App\Http\Resources\LoungeTableResource;
use App\Models\Lounge;
use App\Models\LoungeTable;
use App\Services\LoungeTableService;
use App\Traits\AuthorizesEstablishmentOwnership;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class LoungeTableController extends Controller
{
    use AuthorizesEstablishmentOwnership;

    public function __construct(protected LoungeTableService $service)
    {
    }

    public function index(): AnonymousResourceCollection
    {
        return LoungeTableResource::collection($this->service->getAll());
    }

    public function getByLounge(int|string|Lounge $lounge): AnonymousResourceCollection
    {
        $id = $lounge instanceof Lounge ? $lounge->id : (int) $lounge;
        return LoungeTableResource::collection($this->service->getByLoungeId($id));
    }

    public function store(LoungeTableRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            $this->authorizeEstablishmentOwner(Lounge::findOrFail($validated['lounge_id']));
            $table = $this->service->save($validated);
            return response()->json([
                'status' => Response::HTTP_CREATED,
                'success' => true,
                'message' => 'Table créée avec succès',
                'data' => new LoungeTableResource($table),
            ], Response::HTTP_CREATED);
        } catch (HttpException $e) {
            throw $e;
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function show(int $id): LoungeTableResource|JsonResponse
    {
        $table = $this->service->getById($id);
        if (!$table) {
            return response()->json(['success' => false, 'message' => 'Table introuvable'], Response::HTTP_NOT_FOUND);
        }
        return new LoungeTableResource($table);
    }

    public function update(LoungeTableRequest $request, int $id): JsonResponse
    {
        try {
            $existingTable = LoungeTable::with('lounge')->findOrFail($id);
            $this->authorizeEstablishmentOwner($existingTable->lounge);
            $validated = $request->validated();
            if (isset($validated['lounge_id']) && (int) $validated['lounge_id'] !== (int) $existingTable->lounge_id) {
                $this->authorizeEstablishmentOwner(Lounge::findOrFail($validated['lounge_id']));
            }
            $table = $this->service->update($validated, $id);
            if (!$table) {
                return response()->json(['success' => false, 'message' => 'Table introuvable'], Response::HTTP_NOT_FOUND);
            }
            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Table mise à jour',
                'data' => new LoungeTableResource($table),
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
            $table = LoungeTable::with('lounge')->findOrFail($id);
            $this->authorizeEstablishmentOwner($table->lounge);
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
