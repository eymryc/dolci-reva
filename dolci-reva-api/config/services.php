<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'paystack' => [
        'secret_key' => env('PAYSTACK_SECRET_KEY'),
        'public_key' => env('PAYSTACK_PUBLIC_KEY'),
        'merchant_email' => env('PAYSTACK_MERCHANT_EMAIL'),
        // PAYSTACK_PAYMENT_URL conservé pour compat (.env existants)
        'url' => env('PAYSTACK_URL', env('PAYSTACK_PAYMENT_URL', 'https://api.paystack.co')),
        // Transferts Paystack (retraits propriétaires) — désactiver pour forcer le manuel.
        'transfers_enabled' => (bool) env('PAYSTACK_TRANSFERS_ENABLED', true),
    ],

    /*
    |--------------------------------------------------------------------------
    | Payouts propriétaires (XOF)
    |--------------------------------------------------------------------------
    |
    | bank_code Paystack pour mobile money XOF : valeurs indicatives / à
    | aligner sur GET /bank?currency=XOF&type=mobile_money. Si Paystack
    | rejette le recipient (XOF mobile money peu documenté hors GHS/KES),
    | le compte est quand même enregistré (is_verified=false) et le retrait
    | tombe en approbation manuelle.
    |
    */
    'payout' => [
        'currency' => env('PAYOUT_CURRENCY', 'XOF'),
        'channel_bank_codes' => [
            'wave' => env('PAYSTACK_CODE_WAVE', 'WAVE'),
            'orange_money' => env('PAYSTACK_CODE_ORANGE', 'ORANGE'),
            'mtn' => env('PAYSTACK_CODE_MTN', 'MTN'),
            'moov' => env('PAYSTACK_CODE_MOOV', 'MOOV'),
        ],
    ],

    'whatsapp' => [
        // Identifiants de l'app Meta WhatsApp Business (Cloud API).
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID'),
        'access_token' => env('WHATSAPP_ACCESS_TOKEN'),
        // Jeton choisi par vous, à renseigner aussi dans la config du webhook Meta.
        'verify_token' => env('WHATSAPP_VERIFY_TOKEN'),
        // App Secret Meta, utilisé pour vérifier la signature X-Hub-Signature-256.
        'app_secret' => env('WHATSAPP_APP_SECRET'),
        'api_version' => env('WHATSAPP_API_VERSION', 'v20.0'),
        'url' => env('WHATSAPP_API_URL', 'https://graph.facebook.com'),
    ],

];
