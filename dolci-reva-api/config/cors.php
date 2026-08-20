<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration CORS pour permettre au frontend Next.js de communiquer
    | avec l'API Laravel depuis un domaine différent.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'https://dolci-reva.com'),
        'https://dolci-reva.com',
        'https://www.dolci-reva.com',
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
    ],

    'allowed_origins_patterns' => [
        // Previews du projet uniquement (pas tout *.vercel.app)
        '#^https://dolci-reva-[a-z0-9\-]+-[a-z0-9]+\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
