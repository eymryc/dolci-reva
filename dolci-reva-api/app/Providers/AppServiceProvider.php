<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Les signed URLs (vérif email, reset password…) doivent toujours
        // utiliser APP_URL public. Sinon Laravel reprend le Host de la
        // requête interne BFF → http://127.0.0.1:8080 dans les mails.
        $appUrl = config('app.url');
        if (is_string($appUrl) && $appUrl !== '') {
            URL::forceRootUrl(rtrim($appUrl, '/'));
            if (str_starts_with($appUrl, 'https://')) {
                URL::forceScheme('https');
            }
        }

        // Lien reset → page Next (pas une route web Laravel inexistante).
        ResetPassword::createUrlUsing(function (object $user, string $token) {
            $frontend = rtrim((string) config('app.frontend_url'), '/');

            return $frontend.'/auth/reset-password?'
                .http_build_query([
                    'token' => $token,
                    'email' => $user->getEmailForPasswordReset(),
                ]);
        });

        // Limiteur par défaut de tout le groupe "api" (activé via
        // throttleApi() dans bootstrap/app.php). Par utilisateur connecté
        // si authentifié, sinon par IP — couvre aussi bien les endpoints
        // publics (listing établissements, etc.) que les endpoints protégés.
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Limiteur dédié, plus strict, pour les endpoints d'authentification
        // (connexion, inscription, mot de passe oublié/réinitialisation) :
        // ce sont les cibles classiques de brute-force / énumération de
        // comptes, un débit de 60/min par IP serait largement suffisant pour
        // tester des mots de passe en masse.
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });
    }
}
