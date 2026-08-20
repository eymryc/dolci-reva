<?php

namespace App\Http\Controllers\API;

use App\Models\OwnerVerification;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OwnerVerificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OwnerVerification::with(['user', 'reviewer', 'media']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return response()->json([
            'success' => true,
            'data' => $query->latest()->paginate($request->get('per_page', 15)),
        ]);
    }

    public function show(int $id): JsonResponse
    {
        $verification = OwnerVerification::with(['user', 'reviewer', 'media'])->find($id);
        if (!$verification) {
            return response()->json(['success' => false, 'message' => 'Vérification introuvable.'], Response::HTTP_NOT_FOUND);
        }
        return response()->json(['success' => true, 'data' => $verification]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'document_type' => 'required|in:IDENTITY,BUSINESS_REGISTRATION,TAX_CERTIFICATE,OTHER',
            'identity_document_type' => 'nullable|in:CNI,PASSPORT,SEJOUR,OTHER',
            'document_number' => 'nullable|string|max:100',
            'document_issue_date' => 'nullable|date',
            'document_expiry_date' => 'nullable|date|after:document_issue_date',
            'issuing_authority' => 'nullable|string|max:200',
            'document_file' => 'required|file|mimes:jpeg,png,jpg,pdf|max:10240',
        ]);

        /** @var \App\Models\User $user */
        $user = Auth::user();

        unset($data['document_file']);
        $data['user_id'] = $user->id;
        $data['status'] = 'PENDING';

        $verification = OwnerVerification::create($data);

        if ($request->hasFile('document_file')) {
            $verification->addMedia($request->file('document_file'))->toMediaCollection('document');
        }

        return response()->json([
            'status' => Response::HTTP_CREATED,
            'success' => true,
            'message' => 'Document soumis pour vérification.',
            'data' => $verification->load(['user', 'reviewer', 'media']),
        ], Response::HTTP_CREATED);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $verification = OwnerVerification::findOrFail($id);
        $verification->update([
            'status' => 'APPROVED',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
            'notes' => $request->input('notes'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Vérification approuvée.',
            'data' => $verification->fresh(['user', 'reviewer', 'media']),
        ]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $request->validate(['rejection_reason' => 'required|string|max:1000']);

        $verification = OwnerVerification::findOrFail($id);
        $verification->update([
            'status' => 'REJECTED',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
            'rejection_reason' => $request->rejection_reason,
            'notes' => $request->input('notes'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Vérification rejetée.',
            'data' => $verification->fresh(['user', 'reviewer', 'media']),
        ]);
    }

    public function suspend(int $id): JsonResponse
    {
        $verification = OwnerVerification::findOrFail($id);
        $verification->update([
            'status' => 'SUSPENDED',
            'reviewed_by' => Auth::id(),
            'reviewed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Vérification suspendue.',
            'data' => $verification->fresh(['user', 'reviewer', 'media']),
        ]);
    }

    public function myVerifications(): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $verifications = OwnerVerification::with(['reviewer', 'media'])
            ->where('user_id', $user->id)
            ->latest()
            ->get();

        return response()->json(['success' => true, 'data' => $verifications]);
    }
}
