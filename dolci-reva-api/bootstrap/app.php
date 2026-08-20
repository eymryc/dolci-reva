<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Laravel est derrière Nginx (TLS) puis Docker (HTTP :8080).
        // Sans trustProxies, $request voit http://… et les signatures
        // générées en https://dolci-reva.com échouent à la validation.
        // Safe tant que l'API n'écoute que 127.0.0.1 (pas exposée publiquement).
        $middleware->trustProxies(at: '*');

        $middleware->prepend(\Illuminate\Http\Middleware\HandleCors::class);
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureUserIsAdmin::class,
        ]);
        // Le groupe "api" n'appliquait jusqu'ici aucune limite de débit (le
        // limiteur nommé "api" est défini dans AppServiceProvider::boot()) :
        // sans throttleApi(), n'importe quelle route publique (listing,
        // connexion, inscription...) pouvait être scrapée ou brute-forcée
        // sans aucune limite.
        $middleware->throttleApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\App\Exceptions\BookingConflictException $e, \Illuminate\Http\Request $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                ], Response::HTTP_CONFLICT);
            }
        });
    })->create();
