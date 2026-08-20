<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use App\Http\Requests\LoginRequest;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\Verified;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use OpenApi\Annotations as OA;

/**
 * @OA\Tag(name="Authentication")
 */
class AuthController extends Controller
{   
    /**
     * @OA\Post(
     *     path="/auth/login",
     *     summary="Connexion utilisateur",
     *     description="Authentifie un utilisateur et retourne un token d'accès",
     *     operationId="login",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com"),
     *             @OA\Property(property="password", type="string", format="password", example="password123")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Connexion réussie",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Login successful"),
     *             @OA\Property(property="data", type="object",
     *                 @OA\Property(property="user", type="object",
     *                     @OA\Property(property="id", type="integer", example=1),
     *                     @OA\Property(property="first_name", type="string", example="John"),
     *                     @OA\Property(property="last_name", type="string", example="Doe"),
     *                     @OA\Property(property="email", type="string", example="user@example.com"),
     *                     @OA\Property(property="type", type="string", example="CUSTOMER")
     *                 ),
     *                 @OA\Property(property="token", type="string", example="1|abcdef123456...")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Identifiants invalides",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=401),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Invalid credentials")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erreur de validation",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="The given data was invalid."),
     *             @OA\Property(property="errors", type="object")
     *         )
     *     )
     * )
     */
    public function login(LoginRequest $request): JsonResponse
    {
        try {
            
            // Find the user by email
            $user = User::where('email', $request->email)->first();

            // Check if user exists and password matches
            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'status'  => Response::HTTP_UNAUTHORIZED,
                    'success' => false,
                    'message' => 'These credentials do not match our records.'
                ], Response::HTTP_UNAUTHORIZED);
            }

            // Check if email is verified
            if (!$user->hasVerifiedEmail()) {
                return response()->json([
                    'status'  => Response::HTTP_FORBIDDEN,
                    'success' => false,
                    'message' => 'Veuillez vérifier votre adresse email avant de vous connecter.',
                    'email_verified' => false,
                ], Response::HTTP_FORBIDDEN);
            }

            // Generate a new token for the user
            $token = $user->createToken('user-token')->plainTextToken;

            // Return the response with user data and token
            $response = [
                'success'       => true,
                'status'        => Response::HTTP_OK,
                'message'       => 'Login successful',
                'token'         => $token,
                'type'          => "Bearer",
                'user'          => new \App\Http\Resources\UserResource(
                    $user->load(['businessTypes', 'ownerVerifications'])
                ),
            ];

            // Return the response with a 200 status code
            return response()->json($response, Response::HTTP_OK);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json([
                'status'  => Response::HTTP_INTERNAL_SERVER_ERROR,
                'success' => false,
                'error'   => 'There is an error.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @OA\Post(
     *     path="/auth/logout",
     *     summary="Déconnexion utilisateur",
     *     description="Déconnecte l'utilisateur authentifié et invalide son token",
     *     operationId="logout",
     *     tags={"Authentication"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Déconnexion réussie",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Logged out successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Non authentifié",
     *         @OA\JsonContent(ref="#/components/schemas/Error")
     *     )
     * )
     */
    public function logout() : JsonResponse
    {
        Auth::user()->tokens->each(function ($token) {
            $token->forceDelete();
        });

        // Return a success response
        return response()->json([
            'status'  => Response::HTTP_OK,
            'success' => true,
            'message' => 'Logged out successfully',
        ], Response::HTTP_OK);
    }

    /**
     * @OA\Get(
     *     path="/email/verify/{id}/{hash}",
     *     summary="Vérifier l'email",
     *     description="Vérifie l'adresse email de l'utilisateur via le lien de vérification",
     *     operationId="verifyEmail",
     *     tags={"Authentication"},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID de l'utilisateur",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="hash",
     *         in="path",
     *         required=true,
     *         description="Hash de l'email",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="expires",
     *         in="query",
     *         required=false,
     *         description="Timestamp d'expiration",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Parameter(
     *         name="signature",
     *         in="query",
     *         required=false,
     *         description="Signature de vérification",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Email vérifié avec succès",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Email verified successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Lien invalide ou expiré",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=403),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Invalid or expired verification link")
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
     *     )
     * )
     */
    public function verifyEmail(Request $request, int $id, string $hash)
    {
        try {
            $user = User::findOrFail($id);

            // Verify the signed URL
            if (!URL::hasValidSignature($request)) {
                return view('auth.email-verified', [
                    'success' => false,
                    'message' => 'Lien de vérification invalide ou expiré.',
                    'user' => $user
                ]);
            }

            // Check if the hash matches
            if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
                return view('auth.email-verified', [
                    'success' => false,
                    'message' => 'Lien de vérification invalide.',
                    'user' => $user
                ]);
            }

            // Check if email is already verified
            $alreadyVerified = $user->hasVerifiedEmail();
            
            if (!$alreadyVerified) {
                // Mark email as verified
                if ($user->markEmailAsVerified()) {
                    event(new Verified($user));
                }
            }

            return view('auth.email-verified', [
                'success' => true,
                'message' => $alreadyVerified 
                    ? 'Votre email a déjà été vérifié. Vous pouvez vous connecter.' 
                    : 'Votre email a été vérifié avec succès ! Vous pouvez maintenant vous connecter.',
                'alreadyVerified' => $alreadyVerified,
                'user' => $user
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return view('auth.email-verified', [
                'success' => false,
                'message' => 'Utilisateur non trouvé.',
                'user' => null
            ]);
        } catch (\Exception $exception) {
            report($exception);
            return view('auth.email-verified', [
                'success' => false,
                'message' => 'Une erreur est survenue lors de la vérification de l\'email.',
                'user' => null
            ]);
        }
    }

    /**
     * @OA\Post(
     *     path="/email/verification-notification",
     *     summary="Renvoyer l'email de vérification",
     *     description="Renvoie un email de vérification à l'utilisateur",
     *     operationId="resendVerificationEmail",
     *     tags={"Authentication"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email"},
     *             @OA\Property(property="email", type="string", format="email", example="user@example.com")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Email de vérification envoyé",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=200),
     *             @OA\Property(property="success", type="boolean", example=true),
     *             @OA\Property(property="message", type="string", example="Verification email sent successfully")
     *         )
     *     ),
     *     @OA\Response(
     *         response=400,
     *         description="Email déjà vérifié",
     *         @OA\JsonContent(
     *             @OA\Property(property="status", type="integer", example=400),
     *             @OA\Property(property="success", type="boolean", example=false),
     *             @OA\Property(property="message", type="string", example="Email already verified")
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
     *     )
     * )
     */
    public function resendVerificationEmail(\Illuminate\Http\Request $request): JsonResponse
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
            ]);

            $user = User::where('email', $request->email)->firstOrFail();

            // Check if email is already verified
            if ($user->hasVerifiedEmail()) {
                return response()->json([
                    'status'  => Response::HTTP_BAD_REQUEST,
                    'success' => false,
                    'message' => 'Email already verified.'
                ], Response::HTTP_BAD_REQUEST);
            }

            // Send verification notification
            $user->sendEmailVerificationNotification();

            return response()->json([
                'status'  => Response::HTTP_OK,
                'success' => true,
                'message' => 'Verification email sent successfully. Please check your inbox.'
            ], Response::HTTP_OK);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status'  => Response::HTTP_UNPROCESSABLE_ENTITY,
                'success' => false,
                'message' => 'Validation error',
                'errors'  => $e->errors()
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'status'  => Response::HTTP_NOT_FOUND,
                'success' => false,
                'message' => 'User not found.'
            ], Response::HTTP_NOT_FOUND);
        } catch (\Exception $exception) {
            report($exception);
            return response()->json([
                'status'  => Response::HTTP_INTERNAL_SERVER_ERROR,
                'success' => false,
                'message' => 'An error occurred while sending the verification email.'
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Envoyer le lien de réinitialisation du mot de passe
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        try {
            $request->validate(['email' => 'required|email|exists:users,email']);

            $status = Password::sendResetLink($request->only('email'));

            if ($status === Password::RESET_LINK_SENT) {
                return response()->json([
                    'status' => Response::HTTP_OK,
                    'success' => true,
                    'message' => 'Un lien de réinitialisation a été envoyé à votre email.',
                ], Response::HTTP_OK);
            }

            return response()->json([
                'status' => Response::HTTP_BAD_REQUEST,
                'success' => false,
                'message' => 'Impossible d\'envoyer le lien de réinitialisation.',
            ], Response::HTTP_BAD_REQUEST);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => Response::HTTP_UNPROCESSABLE_ENTITY,
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'success' => false,
                'message' => 'Une erreur est survenue.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Réinitialiser le mot de passe
     */
    public function resetPassword(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'token' => 'required|string',
                'email' => 'required|email|exists:users,email',
                'password' => 'required|string|min:8|confirmed',
            ]);

            $status = Password::reset(
                $request->only('email', 'password', 'password_confirmation', 'token'),
                function (User $user, string $password) {
                    $user->forceFill(['password' => $password])
                         ->setRememberToken(Str::random(60));
                    $user->save();
                    $user->tokens()->delete();
                    event(new PasswordReset($user));
                }
            );

            if ($status === Password::PASSWORD_RESET) {
                return response()->json([
                    'status' => Response::HTTP_OK,
                    'success' => true,
                    'message' => 'Mot de passe réinitialisé avec succès.',
                ], Response::HTTP_OK);
            }

            return response()->json([
                'status' => Response::HTTP_BAD_REQUEST,
                'success' => false,
                'message' => 'Token invalide ou expiré.',
            ], Response::HTTP_BAD_REQUEST);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'status' => Response::HTTP_UNPROCESSABLE_ENTITY,
                'success' => false,
                'message' => 'Validation error',
                'errors' => $e->errors(),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        } catch (\Exception $e) {
            report($e);
            return response()->json([
                'status' => Response::HTTP_INTERNAL_SERVER_ERROR,
                'success' => false,
                'message' => 'Une erreur est survenue.',
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}
