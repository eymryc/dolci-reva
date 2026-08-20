<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\VisitRequest;
use App\Http\Resources\VisitResource;
use App\Services\VisitService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VisitController extends Controller
{
    public function __construct(protected VisitService $service)
    {
    }

    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        $filters = $request->only(['dwelling_id', 'status']);

        if ($user->isAdmin()) {
            $filters = array_merge($filters, $request->only(['owner_id', 'visitor_id']));
        } elseif ($user->type === 'OWNER') {
            $filters['owner_id'] = $user->id;
        } else {
            $filters['visitor_id'] = $user->id;
        }

        $visits = $this->service->paginate($filters, (int) $request->get('per_page', 15));

        return response()->json([
            'status' => Response::HTTP_OK,
            'success' => true,
            'message' => 'Visites récupérées',
            'data' => VisitResource::collection($visits->items()),
            'meta' => [
                'current_page' => $visits->currentPage(),
                'last_page' => $visits->lastPage(),
                'per_page' => $visits->perPage(),
                'total' => $visits->total(),
            ],
        ]);
    }

    public function store(VisitRequest $request): JsonResponse
    {
        try {
            $visit = $this->service->save($request->validated());
            return response()->json([
                'status' => Response::HTTP_CREATED,
                'success' => true,
                'message' => 'Demande de visite envoyée avec succès',
                'data' => new VisitResource($visit),
            ], Response::HTTP_CREATED);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }

    public function show(int $id): JsonResponse
    {
        $visit = $this->service->getById($id);
        if (!$visit) {
            return response()->json(['success' => false, 'message' => 'Visite introuvable'], Response::HTTP_NOT_FOUND);
        }

        /** @var \App\Models\User $user */
        $user = request()->user();
        if (
            !$user->isAdmin()
            && (int) $visit->owner_id !== (int) $user->id
            && (int) $visit->visitor_id !== (int) $user->id
        ) {
            return response()->json(['success' => false, 'message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
        }

        return response()->json([
            'status' => Response::HTTP_OK,
            'success' => true,
            'data' => new VisitResource($visit),
        ]);
    }

    public function confirm(int $id): JsonResponse
    {
        try {
            $visit = $this->service->getById($id);
            if (!$visit) {
                return response()->json(['success' => false, 'message' => 'Visite introuvable'], Response::HTTP_NOT_FOUND);
            }

            /** @var \App\Models\User $user */
            $user = request()->user();
            if (!$user->isAdmin() && (int) $visit->owner_id !== (int) $user->id) {
                return response()->json(['success' => false, 'message' => 'Accès non autorisé'], Response::HTTP_FORBIDDEN);
            }

            $visit = $this->service->confirm($id);
            if (!$visit) {
                return response()->json(['success' => false, 'message' => 'Visite introuvable'], Response::HTTP_NOT_FOUND);
            }
            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Visite confirmée avec succès',
                'data' => new VisitResource($visit),
            ]);
        } catch (\Exception $e) {
            report($e);
            return response()->json(['success' => false, 'message' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }
    }
}
