<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\AdminUserRequest;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Users")
 */
class UserController extends Controller
{
    /**
     * Service layer for managing user-related business logic.
     *
     * @var UserService
     */
    protected UserService $userService;

    /**
     * Inject the UserService dependency.
     *
     * @param UserService $userService
     */
    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * @OA\Get(
     *     path="/users",
     *     summary="Liste des utilisateurs",
     *     description="Récupère la liste de tous les utilisateurs",
     *     operationId="getUsers",
     *     tags={"Users"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Liste des utilisateurs récupérée avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="data", type="array",
     *                 @OA\Items(ref="#/components/schemas/User")
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
    public function index(): \Illuminate\Http\Resources\Json\AnonymousResourceCollection
    {
        abort_unless(Auth::user()?->isAdmin(), Response::HTTP_FORBIDDEN);

        return UserResource::collection($this->userService->getAllWithPagination());
    }

    /**
     * @OA\Post(
     *     path="/register",
     *     summary="Inscription utilisateur",
     *     description="Crée un nouveau compte utilisateur",
     *     operationId="register",
     *     tags={"Authentication", "Users"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"first_name", "last_name", "email", "password", "password_confirmation", "type"},
     *             @OA\Property(property="first_name", type="string", example="John"),
     *             @OA\Property(property="last_name", type="string", example="Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="phone", type="string", example="+33123456789"),
     *             @OA\Property(property="password", type="string", format="password", example="password123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="password123"),
     *             @OA\Property(property="type", type="string", enum={"CUSTOMER", "OWNER", "ADMIN"}, example="CUSTOMER")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Compte créé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=201),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Account created successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation",
     *         @OA\JsonContent(ref="#/components/schemas/ValidationError")
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erreur serveur",
     *         @OA\JsonContent(
     *             @OA\Property(property="error", type="string", example="Internal server error.")
     *         )
     *     )
     * )
     */
    public function store(UserRequest $request): UserResource|\Illuminate\Http\JsonResponse
    {
        $data = $request->validated();
        unset($data['email_verified_at'], $data['remember_token']);

        if (!in_array($data['type'] ?? null, ['CUSTOMER', 'OWNER'], true)) {
            unset($data['type']);
            abort(Response::HTTP_UNPROCESSABLE_ENTITY, 'Public registration only allows CUSTOMER or OWNER users.');
        }

        try {
            /** @var \App\Models\User $user */
            $user = $this->userService->save($data);

            $emailSent = $this->sendVerificationEmailSafely($user);

            return response()->json([
                'status'  => Response::HTTP_CREATED,
                'success' => true,
                'message' => $emailSent
                    ? 'Account created successfully. Please check your email to verify your account.'
                    : 'Account created successfully. Verification email could not be sent; you can request a new one later.',
                'data'    => new UserResource($user),
                'email_verified' => false,
                'email_sent' => $emailSent,
            ], Response::HTTP_CREATED);

        } catch (\Exception $exception) {
            report($exception);

            return response()->json([
                'error' => 'Internal server error.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    public function storeAdmin(AdminUserRequest $request): UserResource|\Illuminate\Http\JsonResponse
    {
        abort_unless(Auth::user()?->isAdmin(), Response::HTTP_FORBIDDEN);

        try {
            /** @var \App\Models\User $user */
            $user = $this->userService->save($request->validated());
            $emailSent = $this->sendVerificationEmailSafely($user);

            return response()->json([
                'status' => Response::HTTP_CREATED,
                'success' => true,
                'message' => $emailSent
                    ? 'Account created successfully.'
                    : 'Account created successfully. Verification email could not be sent.',
                'data' => new UserResource($user),
                'email_verified' => false,
                'email_sent' => $emailSent,
            ], Response::HTTP_CREATED);
        } catch (\Exception $exception) {
            report($exception);

            return response()->json([
                'error' => 'Internal server error.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Delivery failures must not roll back a successful registration.
     */
    private function sendVerificationEmailSafely(User $user): bool
    {
        try {
            $user->sendEmailVerificationNotification();

            return true;
        } catch (\Throwable $exception) {
            report($exception);

            return false;
        }
    }

    /**
     * @OA\Get(
     *     path="/users/{id}",
     *     summary="Afficher un utilisateur",
     *     description="Récupère les détails d'un utilisateur spécifique",
     *     operationId="getUser",
     *     tags={"Users"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'utilisateur",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Utilisateur récupéré avec succès",
     *         @OA\JsonContent(ref="#/components/schemas/User")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Utilisateur non trouvé",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function show(int $id): UserResource
    {
        abort_unless(Auth::user()?->isAdmin(), Response::HTTP_FORBIDDEN);

        return UserResource::make($this->userService->getById($id));
    }

    /**
     * @OA\Put(
     *     path="/users/{id}",
     *     summary="Modifier un utilisateur",
     *     description="Met à jour un utilisateur existant",
     *     operationId="updateUser",
     *     tags={"Users"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'utilisateur à modifier",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="first_name", type="string", example="John"),
     *             @OA\Property(property="last_name", type="string", example="Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="phone", type="string", example="+33123456789"),
     *             @OA\Property(property="password", type="string", format="password", example="newpassword123"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="newpassword123"),
     *             @OA\Property(property="type", type="string", enum={"CUSTOMER", "OWNER", "ADMIN"}, example="CUSTOMER")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Utilisateur modifié avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Account updated successfully"),
     *             @OA\Property(property="data", ref="#/components/schemas/User")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Utilisateur non trouvé",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=404),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="User not found")
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
    public function update(AdminUserRequest $request, int $id): UserResource|\Illuminate\Http\JsonResponse
    {
        abort_unless(Auth::user()?->isAdmin(), Response::HTTP_FORBIDDEN);

        try {
            $user = $this->userService->update($request->validated(), $id);

            if (!$user) {
                return response()->json([
                    'status'  => Response::HTTP_NOT_FOUND,
                    'success' => false,
                    'message' => 'User not found',
                ], Response::HTTP_NOT_FOUND);
            }

            $data = new UserResource($user);

            return response()->json([
                'status'  => Response::HTTP_OK,
                'success' => true,
                'message' => 'Account updated successfully',
                'data'    => $data,
            ], Response::HTTP_OK);

        } catch (\Exception $exception) {
            report($exception);

            return response()->json([
                'error' => 'Internal server error.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Delete(
     *     path="/users/{id}",
     *     summary="Supprimer un utilisateur",
     *     description="Supprime un utilisateur existant",
     *     operationId="deleteUser",
     *     tags={"Users"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'utilisateur à supprimer",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Utilisateur supprimé avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Deleted successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Utilisateur non trouvé",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=404),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="User not found")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function destroy(int $id): \Illuminate\Http\JsonResponse
    {
        abort_unless(Auth::user()?->isAdmin(), Response::HTTP_FORBIDDEN);

        try {
            $deleted = $this->userService->deleteById($id);

            if (!$deleted) {
                return response()->json([
                    'status'  => Response::HTTP_NOT_FOUND,
                    'success' => false,
                    'message' => 'User not found',
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json([
                'status'  => Response::HTTP_OK,
                'success' => true,
                'message' => 'Deleted successfully',
            ], Response::HTTP_OK);

        } catch (\Exception $exception) {
            report($exception);

            return response()->json([
                'error' => 'Internal server error.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }



    /**
     * @OA\Get(
     *     path="/profile",
     *     summary="Afficher le profil utilisateur",
     *     description="Récupère les détails du profil utilisateur",
     *     operationId="getProfile",
     *     tags={"Users"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Profil utilisateur récupéré avec succès",
     *         @OA\JsonContent(ref="#/components/schemas/User")
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function getProfile(): UserResource
    {
        /** @var User $user */
        $user = Auth::user();

        // Retourne le profil avec business types, wallet et vérifications d'identité
        return UserResource::make($user->load(['businessTypes', 'wallet', 'ownerVerifications.media']));
    }
}
