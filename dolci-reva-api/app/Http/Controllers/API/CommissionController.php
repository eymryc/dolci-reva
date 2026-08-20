<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Services\CommissionService;
use App\Http\Controllers\Controller;
use App\Http\Requests\CommissionRequest;
use App\Http\Resources\CommissionResource;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CommissionController extends Controller
{
    /**
     * @var CommissionService
     */
    protected CommissionService $commissionService;

    /**
     * DummyModel Constructor
     *
     * @param CommissionService $commissionService
     *
     */
    public function __construct(CommissionService $commissionService)
    {
        $this->commissionService = $commissionService;
    }

    public function index(): AnonymousResourceCollection
    {
        return CommissionResource::collection($this->commissionService->getAll());
    }

    public function store(CommissionRequest $request): CommissionResource|JsonResponse
    {
        try {
            $data = new CommissionResource($this->commissionService->save($request->validated()));

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_CREATED,
                'success'   => true,    
                'message'   => 'Commission created successfully',
                'data'      => $data
            ], Response::HTTP_CREATED);

            // Return the response
            return $response;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function show(int $id): CommissionResource
    {
        return CommissionResource::make($this->commissionService->getById($id));
    }

    public function update(CommissionRequest $request, int $id): CommissionResource|JsonResponse
    {
        try {
            $data = new CommissionResource($this->commissionService->update($request->validated(), $id));
            
            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_OK,
                'success'   => true,
                'message'   => 'Commission updated successfully',
                'data'      => $data
            ], Response::HTTP_OK);

            // Return the response
            return $response;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function destroy(int $id): JsonResponse
    {
        try {
            $this->commissionService->deleteById($id);
            return response()->json([
                'status' => Response::HTTP_OK,
                'success' => true,
                'message' => 'Deleted successfully'
            ], Response::HTTP_OK);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => 'There is an error.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
