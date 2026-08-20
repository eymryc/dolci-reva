<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\WithdrawalRequest;
use App\Http\Resources\WithdrawalResource;
use App\Models\Withdrawal;
use App\Services\WithdrawalService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class WithdrawalController extends Controller
{
    /**
     * @var WithdrawalService
     */
    protected WithdrawalService $withdrawalService;

    /**
     * DummyModel Constructor
     *
     * @param WithdrawalService $withdrawalService
     *
     */
    public function __construct(WithdrawalService $withdrawalService)
    {
        $this->withdrawalService = $withdrawalService;
    }

    public function index(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $withdrawals = $user->isAdmin()
            ? $this->withdrawalService->getAll()
            : $this->withdrawalService->getAll()->where('user_id', $user->id)->values();

        return WithdrawalResource::collection($withdrawals);
    }

    public function store(WithdrawalRequest $request): WithdrawalResource|\Illuminate\Http\JsonResponse
    {
        try {
            $data = new WithdrawalResource($this->withdrawalService->save($request->validated()));

            // Set response
            $response = response()->json([
                'status'    => Response::HTTP_CREATED,
                'success'   => true,
                'message'   => 'Withdrawal created successfully',
                'data'      => $data
            ], Response::HTTP_CREATED);

            // Return the response
            return $response;
        } catch (\Exception $exception) {
            report($exception);
            return response()->json(['error' => $exception->getMessage()], Response::HTTP_UNPROCESSABLE_ENTITY);
        }
    }

    public function show(int $id): WithdrawalResource|\Illuminate\Http\JsonResponse
    {
        $withdrawal = $this->withdrawalService->getById($id);
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if (!$withdrawal || (!$user->isAdmin() && $withdrawal->user_id !== $user->id)) {
            return response()->json(['success' => false, 'message' => 'Retrait introuvable.'], Response::HTTP_NOT_FOUND);
        }

        return WithdrawalResource::make($withdrawal);
    }

    public function update(WithdrawalRequest $request, int $id): WithdrawalResource|\Illuminate\Http\JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => 'Withdrawal requests cannot be modified. Cancel the pending request and create a new one.',
        ], Response::HTTP_FORBIDDEN);
    }

    public function destroy(int $id): \Illuminate\Http\JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $withdrawal = Withdrawal::find($id);

        if (!$withdrawal || (!$user->isAdmin() && $withdrawal->user_id !== $user->id)) {
            return response()->json(['success' => false, 'message' => 'Retrait introuvable.'], Response::HTTP_NOT_FOUND);
        }

        if ($withdrawal->status !== 'PENDING') {
            return response()->json(['success' => false, 'message' => 'Seule une demande en attente peut être annulée.'], Response::HTTP_CONFLICT);
        }

        try {
            $this->withdrawalService->deleteById($id);
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

    /**
     * Approuver une demande de retrait (admin uniquement, cf. routes/api.php).
     * Déclenche un transfert Paystack si possible, sinon approbation manuelle.
     */
    public function approve(int $id): \Illuminate\Http\JsonResponse
    {
        try {
            $withdrawal = $this->withdrawalService->approve($id, Auth::id());
            return response()->json([
                'success' => true,
                'message' => $withdrawal->status === 'PROCESSING'
                    ? 'Transfert Paystack initié.'
                    : 'Retrait approuvé (manuel).',
                'data' => new WithdrawalResource($withdrawal),
            ]);
        } catch (\Exception $exception) {
            return response()->json(['success' => false, 'message' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }
    }

    /**
     * Forcer l'approbation manuelle sans transfert Paystack (admin).
     */
    public function approveManual(int $id): \Illuminate\Http\JsonResponse
    {
        try {
            $withdrawal = $this->withdrawalService->approveManual($id, Auth::id());
            return response()->json([
                'success' => true,
                'message' => 'Retrait approuvé manuellement.',
                'data' => new WithdrawalResource($withdrawal),
            ]);
        } catch (\Exception $exception) {
            return response()->json(['success' => false, 'message' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }
    }

    /**
     * Rejeter une demande de retrait et recréditer le wallet (admin uniquement).
     */
    public function reject(int $id): \Illuminate\Http\JsonResponse
    {
        try {
            $withdrawal = $this->withdrawalService->reject($id, Auth::id());
            return response()->json([
                'success' => true,
                'message' => 'Retrait rejeté, le montant a été recrédité.',
                'data' => new WithdrawalResource($withdrawal),
            ]);
        } catch (\Exception $exception) {
            return response()->json(['success' => false, 'message' => $exception->getMessage()], Response::HTTP_CONFLICT);
        }
    }
}
