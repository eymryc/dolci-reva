<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// =============================================================================
// ROUTES PUBLIQUES (Sans authentification)
// =============================================================================

// Limiteur "auth" (5/min/IP, cf. AppServiceProvider::boot()) : ces endpoints
// sont les cibles classiques de brute-force / énumération de comptes.
Route::prefix('auth')->name('auth.')->middleware('throttle:auth')->group(function () {
    Route::post('/login', [App\Http\Controllers\API\AuthController::class, 'login']);
    Route::post('/register', [App\Http\Controllers\API\UserController::class, 'store'])->name('register');
    Route::post('/forgot-password', [App\Http\Controllers\API\AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [App\Http\Controllers\API\AuthController::class, 'resetPassword']);
});

// Vérification d'email
Route::prefix('email')->name('email.')->group(function () {
    Route::get('/verify/{id}/{hash}', [App\Http\Controllers\API\AuthController::class, 'verifyEmail'])
        ->name('verification.verify');
    Route::post('/verification-notification', [App\Http\Controllers\API\AuthController::class, 'resendVerificationEmail'])
        ->name('verification.send');
});

Route::get('/business-types', [App\Http\Controllers\API\BusinessTypeController::class, 'index']);
Route::get('/business-types/{business_type}', [App\Http\Controllers\API\BusinessTypeController::class, 'show']);

// Routes publiques (données sans auth)
Route::prefix('public')->name('public.')->group(function () {

    Route::get('/opinions/{id}', [App\Http\Controllers\API\OpinionController::class, 'getOpinionById']);

    // Hébergements (dwellings - location longue durée)
    Route::get('/dwellings', [App\Http\Controllers\API\DwellingController::class, 'getAllPublic']);
    Route::get('/dwellings/{id}', [App\Http\Controllers\API\DwellingController::class, 'getPublicById']);

    // Hôtels
    Route::get('/hotels', [App\Http\Controllers\API\HotelController::class, 'getAllHotels']);
    Route::get('/hotels/{hotel}', [App\Http\Controllers\API\HotelController::class, 'getHotel']);

    // Résidences (location courte durée)
    Route::get('/residences', [App\Http\Controllers\API\ResidenceController::class, 'getAllResidences']);
    Route::get('/residences/{residence}', [App\Http\Controllers\API\ResidenceController::class, 'getResidence']);

    // Restaurants
    Route::get('/restaurants', [App\Http\Controllers\API\RestaurantController::class, 'getAllRestaurants']);
    Route::get('/restaurants/{restaurant}', [App\Http\Controllers\API\RestaurantController::class, 'getRestaurant']);
    Route::get('/restaurants/{restaurant}/available-tables', [App\Http\Controllers\API\RestaurantController::class, 'getAvailableTables']);

    // Lounges
    Route::get('/lounges', [App\Http\Controllers\API\LoungeController::class, 'getAllLounges']);
    Route::get('/lounges/{lounge}', [App\Http\Controllers\API\LoungeController::class, 'getLounge']);
    Route::get('/lounges/{lounge}/available-tables', [App\Http\Controllers\API\LoungeController::class, 'getAvailableTables']);

    // Night Clubs
    Route::get('/night-clubs', [App\Http\Controllers\API\NightClubController::class, 'getAllNightClubs']);
    Route::get('/night-clubs/{nightClub}', [App\Http\Controllers\API\NightClubController::class, 'getNightClub']);
    Route::get('/night-clubs/{nightClub}/available-areas', [App\Http\Controllers\API\NightClubController::class, 'getAvailableAreas']);

    // Bars (filtre venue_type=BAR sur lounges)
    Route::get('/bars', [App\Http\Controllers\API\LoungeController::class, 'getAllBars']);
    Route::get('/bars/{bar}', [App\Http\Controllers\API\LoungeController::class, 'getBar']);
    Route::get('/bars/{bar}/available-tables', [App\Http\Controllers\API\LoungeController::class, 'getAvailableTables']);

    // Devis réservation (prix serveur = montant Paystack)
    Route::post('/bookings/quote/{type}/{id}', [App\Http\Controllers\API\BookingController::class, 'quote'])
        ->where('type', 'residence|hotel|restaurant|lounge|bar|night_club|night-club');
});

// Webhook Paystack : appelé par Paystack (pas de token utilisateur possible),
// protégé uniquement par la vérification de signature HMAC dans le controller.
Route::post('/payments/webhook', [App\Http\Controllers\API\PaymentController::class, 'webhook'])->name('payments.webhook');

// Retour navigateur après un paiement Paystack (redirection du client, pas un
// webhook serveur) : appelé directement par le navigateur/webview de
// l'utilisateur, donc sans token — la vérification se fait via l'API
// Paystack elle-même (cf. PaymentController::callback()).
Route::get('/payments/callback', [App\Http\Controllers\API\PaymentController::class, 'callback'])->name('payments.callback');

// Webhook WhatsApp Business (Meta Cloud API) : handshake GET de vérification,
// puis réception des messages en POST. Protégé par vérification de signature
// Meta (X-Hub-Signature-256) dans le controller, pas de token utilisateur.
Route::get('/whatsapp/webhook', [App\Http\Controllers\API\WhatsAppWebhookController::class, 'verify'])->name('whatsapp.webhook.verify');
Route::post('/whatsapp/webhook', [App\Http\Controllers\API\WhatsAppWebhookController::class, 'handle'])->name('whatsapp.webhook.handle');

// =============================================================================
// ROUTES PROTÉGÉES (Avec authentification)
// =============================================================================

Route::middleware(['auth:sanctum'])->group(function () {

    // -------------------------------------------------------------------------
    // AUTH
    // -------------------------------------------------------------------------
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('/logout', [App\Http\Controllers\API\AuthController::class, 'logout']);
    });

    // -------------------------------------------------------------------------
    // PROFIL
    // -------------------------------------------------------------------------
    Route::get('/profile', [App\Http\Controllers\API\UserController::class, 'getProfile']);
    Route::put('/profile', [App\Http\Controllers\API\UserController::class, 'updateProfile']);

    // -------------------------------------------------------------------------
    // DASHBOARD STATS
    // -------------------------------------------------------------------------
    Route::get('/stats', [App\Http\Controllers\API\StatsController::class, 'index']);

    // -------------------------------------------------------------------------
    // UTILISATEURS
    // -------------------------------------------------------------------------
    Route::middleware('admin')->group(function () {
        Route::get('/users', [App\Http\Controllers\API\UserController::class, 'index']);
        Route::get('/users/{id}', [App\Http\Controllers\API\UserController::class, 'show']);
        Route::post('/users', [App\Http\Controllers\API\UserController::class, 'storeAdmin']);
        Route::put('/users/{id}', [App\Http\Controllers\API\UserController::class, 'update']);
        Route::delete('/users/{id}', [App\Http\Controllers\API\UserController::class, 'destroy']);
    });

    // -------------------------------------------------------------------------
    // OPINIONS
    // -------------------------------------------------------------------------
    Route::apiResource('/opinions', App\Http\Controllers\API\OpinionController::class);

    // -------------------------------------------------------------------------
    // HÉBERGEMENTS (location longue durée)
    // -------------------------------------------------------------------------
    Route::get('/dwellings', [App\Http\Controllers\API\DwellingController::class, 'index']);
    Route::get('/dwellings/{id}', [App\Http\Controllers\API\DwellingController::class, 'show']);
    Route::post('/dwellings', [App\Http\Controllers\API\DwellingController::class, 'store']);
    Route::post('/dwellings/{id}', [App\Http\Controllers\API\DwellingController::class, 'update']); // POST pour multipart/form-data
    Route::put('/dwellings/{id}', [App\Http\Controllers\API\DwellingController::class, 'update']);
    Route::delete('/dwellings/{id}', [App\Http\Controllers\API\DwellingController::class, 'destroy']);
    Route::put('/dwellings/{id}/availability', [App\Http\Controllers\API\DwellingController::class, 'toggleAvailability']);

    // -------------------------------------------------------------------------
    // VÉRIFICATION PROPRIÉTAIRES
    // -------------------------------------------------------------------------
    Route::get('/owner-verifications/my', [App\Http\Controllers\API\OwnerVerificationController::class, 'myVerifications']);
    Route::post('/owner-verifications', [App\Http\Controllers\API\OwnerVerificationController::class, 'store']);

    Route::middleware('admin')->group(function () {
        Route::get('/owner-verifications', [App\Http\Controllers\API\OwnerVerificationController::class, 'index']);
        Route::get('/owner-verifications/{id}', [App\Http\Controllers\API\OwnerVerificationController::class, 'show']);
        Route::patch('/owner-verifications/{id}/approve', [App\Http\Controllers\API\OwnerVerificationController::class, 'approve']);
        Route::patch('/owner-verifications/{id}/reject', [App\Http\Controllers\API\OwnerVerificationController::class, 'reject']);
        Route::patch('/owner-verifications/{id}/suspend', [App\Http\Controllers\API\OwnerVerificationController::class, 'suspend']);

        Route::post('/business-types', [App\Http\Controllers\API\BusinessTypeController::class, 'store']);
        Route::put('/business-types/{business_type}', [App\Http\Controllers\API\BusinessTypeController::class, 'update']);
        Route::delete('/business-types/{business_type}', [App\Http\Controllers\API\BusinessTypeController::class, 'destroy']);
    });

    // -------------------------------------------------------------------------
    // CATALOGUE DE CARACTÉRISTIQUES (feature categories / options)
    // Le catalogue est paramétrable depuis l'admin ; les autres utilisateurs
    // peuvent seulement consulter les catégories/options pour les sélectionner.
    // -------------------------------------------------------------------------
    Route::get('/establishment-types', function () {
        return response()->json(['data' => App\Enums\EstablishmentType::options()]);
    });
    Route::get('/feature-categories', [App\Http\Controllers\API\FeatureCategoryController::class, 'index']);
    Route::get('/feature-categories/{id}', [App\Http\Controllers\API\FeatureCategoryController::class, 'show']);
    Route::get('/feature-options', [App\Http\Controllers\API\FeatureOptionController::class, 'index']);
    Route::get('/feature-options/{id}', [App\Http\Controllers\API\FeatureOptionController::class, 'show']);

    Route::middleware('admin')->group(function () {
        Route::post('/feature-categories', [App\Http\Controllers\API\FeatureCategoryController::class, 'store']);
        Route::put('/feature-categories/{id}', [App\Http\Controllers\API\FeatureCategoryController::class, 'update']);
        Route::delete('/feature-categories/{id}', [App\Http\Controllers\API\FeatureCategoryController::class, 'destroy']);

        Route::post('/feature-options', [App\Http\Controllers\API\FeatureOptionController::class, 'store']);
        Route::put('/feature-options/{id}', [App\Http\Controllers\API\FeatureOptionController::class, 'update']);
        Route::delete('/feature-options/{id}', [App\Http\Controllers\API\FeatureOptionController::class, 'destroy']);
    });

    // -------------------------------------------------------------------------
    // RÉSIDENCES (location courte durée / vacances)
    // -------------------------------------------------------------------------
    Route::apiResource('/residences', App\Http\Controllers\API\ResidenceController::class);
    Route::get('/residences/{residence}/availability', [App\Http\Controllers\API\ResidenceController::class, 'checkAvailability']);

    // -------------------------------------------------------------------------
    // HÔTELS & CHAMBRES
    // -------------------------------------------------------------------------
    Route::apiResource('/hotels', App\Http\Controllers\API\HotelController::class);
    // Chambres : routes plates (alignées controller + frontend) + liste par hôtel
    Route::apiResource('/hotel-rooms', App\Http\Controllers\API\HotelRoomController::class);
    Route::get('/hotels/{hotel}/rooms', [App\Http\Controllers\API\HotelRoomController::class, 'getByHotel']);

    // -------------------------------------------------------------------------
    // RESTAURANTS
    // -------------------------------------------------------------------------
    Route::apiResource('/restaurants', App\Http\Controllers\API\RestaurantController::class);
    Route::apiResource('/restaurant-tables', App\Http\Controllers\API\RestaurantTableController::class);
    Route::get('/restaurants/{restaurant}/tables', [App\Http\Controllers\API\RestaurantTableController::class, 'getByRestaurant']);
    Route::get('/restaurants/{restaurant}/available-tables', [App\Http\Controllers\API\RestaurantController::class, 'getAvailableTables']);
    Route::get('/restaurants/{restaurant}/time-slots', [App\Http\Controllers\API\RestaurantController::class, 'getAvailableTimeSlots']);

    // Menu restaurant (catégories + plats)
    Route::get('/restaurants/{restaurant}/menu-categories', [App\Http\Controllers\API\RestaurantMenuController::class, 'categories']);
    Route::post('/restaurants/{restaurant}/menu-categories', [App\Http\Controllers\API\RestaurantMenuController::class, 'storeCategory']);
    Route::get('/restaurants/{restaurant}/menu-categories/{categoryId}', [App\Http\Controllers\API\RestaurantMenuController::class, 'showCategory']);
    Route::put('/restaurants/{restaurant}/menu-categories/{categoryId}', [App\Http\Controllers\API\RestaurantMenuController::class, 'updateCategory']);
    Route::delete('/restaurants/{restaurant}/menu-categories/{categoryId}', [App\Http\Controllers\API\RestaurantMenuController::class, 'destroyCategory']);

    Route::get('/restaurants/{restaurant}/menu-items', [App\Http\Controllers\API\RestaurantMenuController::class, 'items']);
    Route::post('/restaurants/{restaurant}/menu-items', [App\Http\Controllers\API\RestaurantMenuController::class, 'storeItem']);
    Route::get('/restaurants/{restaurant}/menu-items/{itemId}', [App\Http\Controllers\API\RestaurantMenuController::class, 'showItem']);
    Route::put('/restaurants/{restaurant}/menu-items/{itemId}', [App\Http\Controllers\API\RestaurantMenuController::class, 'updateItem']);
    Route::post('/restaurants/{restaurant}/menu-items/{itemId}', [App\Http\Controllers\API\RestaurantMenuController::class, 'updateItem']); // multipart
    Route::delete('/restaurants/{restaurant}/menu-items/{itemId}', [App\Http\Controllers\API\RestaurantMenuController::class, 'destroyItem']);

    // -------------------------------------------------------------------------
    // LOUNGES
    // -------------------------------------------------------------------------
    Route::apiResource('/lounges', App\Http\Controllers\API\LoungeController::class);
    Route::apiResource('/lounge-tables', App\Http\Controllers\API\LoungeTableController::class);
    Route::get('/lounges/{lounge}/tables', [App\Http\Controllers\API\LoungeTableController::class, 'getByLounge']);
    Route::get('/lounges/{lounge}/available-tables', [App\Http\Controllers\API\LoungeController::class, 'getAvailableTables']);
    Route::get('/lounges/{lounge}/recommended-tables', [App\Http\Controllers\API\LoungeController::class, 'getRecommendedTables']);
    Route::get('/lounges/{lounge}/time-slots', [App\Http\Controllers\API\LoungeController::class, 'getAvailableTimeSlots']);

    // Alias nightlife-venues → lounges (compatibilité frontend)
    Route::get('/nightlife-venues', [App\Http\Controllers\API\LoungeController::class, 'index']);
    Route::post('/nightlife-venues', [App\Http\Controllers\API\LoungeController::class, 'store']);
    Route::get('/nightlife-venues/{id}', [App\Http\Controllers\API\LoungeController::class, 'show']);
    Route::post('/nightlife-venues/{id}', [App\Http\Controllers\API\LoungeController::class, 'update']);
    Route::put('/nightlife-venues/{id}', [App\Http\Controllers\API\LoungeController::class, 'update']);
    Route::delete('/nightlife-venues/{id}', [App\Http\Controllers\API\LoungeController::class, 'destroy']);

    // Produits / catégories lounge (alias nightlife-venues)
    Route::get('/nightlife-venues/{lounge}/product-categories', [App\Http\Controllers\API\LoungeProductController::class, 'categories']);
    Route::post('/nightlife-venues/{lounge}/product-categories', [App\Http\Controllers\API\LoungeProductController::class, 'storeCategory']);
    Route::get('/nightlife-venue-product-categories/{categoryId}', [App\Http\Controllers\API\LoungeProductController::class, 'showCategory']);
    Route::put('/nightlife-venue-product-categories/{categoryId}', [App\Http\Controllers\API\LoungeProductController::class, 'updateCategory']);
    Route::delete('/nightlife-venue-product-categories/{categoryId}', [App\Http\Controllers\API\LoungeProductController::class, 'destroyCategory']);

    Route::get('/nightlife-venues/{lounge}/products', [App\Http\Controllers\API\LoungeProductController::class, 'products']);
    Route::post('/nightlife-venues/{lounge}/products', [App\Http\Controllers\API\LoungeProductController::class, 'storeProduct']);
    Route::get('/nightlife-venue-products/{productId}', [App\Http\Controllers\API\LoungeProductController::class, 'showProduct']);
    Route::put('/nightlife-venue-products/{productId}', [App\Http\Controllers\API\LoungeProductController::class, 'updateProduct']);
    Route::post('/nightlife-venue-products/{productId}', [App\Http\Controllers\API\LoungeProductController::class, 'updateProduct']); // multipart
    Route::delete('/nightlife-venue-products/{productId}', [App\Http\Controllers\API\LoungeProductController::class, 'destroyProduct']);

    // -------------------------------------------------------------------------
    // NIGHT CLUBS
    // -------------------------------------------------------------------------
    Route::apiResource('/night-clubs', App\Http\Controllers\API\NightClubController::class);
    Route::apiResource('/night-club-areas', App\Http\Controllers\API\NightClubAreaController::class);
    Route::get('/night-clubs/{nightClub}/areas', [App\Http\Controllers\API\NightClubAreaController::class, 'getByNightClub']);
    Route::get('/night-clubs/{nightClub}/available-areas', [App\Http\Controllers\API\NightClubController::class, 'getAvailableAreas']);
    Route::get('/night-clubs/{nightClub}/recommended-areas', [App\Http\Controllers\API\NightClubController::class, 'getRecommendedAreas']);
    Route::get('/night-clubs/{nightClub}/time-slots', [App\Http\Controllers\API\NightClubController::class, 'getAvailableTimeSlots']);
    Route::get('/night-clubs/age/{ageRestriction}', [App\Http\Controllers\API\NightClubController::class, 'getByAgeRestriction']);

    // -------------------------------------------------------------------------
    // BARS (alias lounges avec venue_type=BAR)
    // -------------------------------------------------------------------------
    Route::get('/bars', [App\Http\Controllers\API\LoungeController::class, 'indexBars']);
    Route::post('/bars', [App\Http\Controllers\API\LoungeController::class, 'storeBar']);
    Route::get('/bars/{id}', [App\Http\Controllers\API\LoungeController::class, 'show']);
    Route::post('/bars/{id}', [App\Http\Controllers\API\LoungeController::class, 'updateBar']);
    Route::put('/bars/{id}', [App\Http\Controllers\API\LoungeController::class, 'updateBar']);
    Route::delete('/bars/{id}', [App\Http\Controllers\API\LoungeController::class, 'destroy']);

    // -------------------------------------------------------------------------
    // RÉSERVATIONS
    // -------------------------------------------------------------------------
    Route::apiResource('/bookings', App\Http\Controllers\API\BookingController::class);

    Route::post('/residences/{residence}/book', [App\Http\Controllers\API\BookingController::class, 'bookResidence']);
    Route::post('/hotels/{hotel}/book', [App\Http\Controllers\API\BookingController::class, 'bookHotel']);
    Route::post('/restaurants/{restaurant}/book', [App\Http\Controllers\API\BookingController::class, 'bookRestaurant']);
    Route::post('/lounges/{lounge}/book', [App\Http\Controllers\API\BookingController::class, 'bookLounge']);
    Route::post('/night-clubs/{nightClub}/book', [App\Http\Controllers\API\BookingController::class, 'bookNightClub']);
    Route::post('/bars/{lounge}/book', [App\Http\Controllers\API\BookingController::class, 'bookLounge']); // bar = lounge

    Route::patch('/bookings/{booking}/confirm', [App\Http\Controllers\API\BookingController::class, 'confirmBooking']);
    Route::patch('/bookings/{booking}/cancel', [App\Http\Controllers\API\BookingController::class, 'cancelBooking']);
    Route::post('/bookings/{booking}/pay', [App\Http\Controllers\API\BookingController::class, 'pay']);
    Route::patch('/bookings/{booking}/complete', [App\Http\Controllers\API\BookingController::class, 'completeBooking']);

    // -------------------------------------------------------------------------
    // VISITES (hébergements longue durée)
    // -------------------------------------------------------------------------
    Route::get('/visits', [App\Http\Controllers\API\VisitController::class, 'index']);
    Route::post('/visits', [App\Http\Controllers\API\VisitController::class, 'store']);
    Route::get('/visits/{id}', [App\Http\Controllers\API\VisitController::class, 'show']);
    Route::post('/visits/{id}/confirm', [App\Http\Controllers\API\VisitController::class, 'confirm']);

    // Reçu de réservation
    Route::get('/bookings/{booking}/receipt', [App\Http\Controllers\API\BookingController::class, 'getReceipt']);
    Route::get('/customer-credits', [App\Http\Controllers\API\CustomerCreditController::class, 'index']);

    // -------------------------------------------------------------------------
    // MÉDIAS
    // -------------------------------------------------------------------------
    Route::prefix('media')->name('media.')->group(function () {
        Route::post('/upload', [App\Http\Controllers\API\MediaController::class, 'upload']);
        Route::get('/get', [App\Http\Controllers\API\MediaController::class, 'getMedia']);
        Route::delete('/{media}', [App\Http\Controllers\API\MediaController::class, 'deleteMedia']);
        Route::delete('/clear-collection', [App\Http\Controllers\API\MediaController::class, 'clearCollection']);
    });

    // -------------------------------------------------------------------------
    // FINANCE & PAIEMENTS
    // -------------------------------------------------------------------------
    Route::post('/wallets/recharge', [App\Http\Controllers\API\WalletController::class, 'recharge']);
    Route::get('/wallets', [App\Http\Controllers\API\WalletController::class, 'index']);
    Route::get('/wallets/{wallet}', [App\Http\Controllers\API\WalletController::class, 'show']);
    Route::get('/wallet_transactions', [App\Http\Controllers\API\WalletTransactionController::class, 'index']);
    Route::get('/wallet_transactions/{id}', [App\Http\Controllers\API\WalletTransactionController::class, 'show']);
    Route::apiResource('/withdrawals', App\Http\Controllers\API\WithdrawalController::class);

    // Compte de versement propriétaire
    Route::get('/payout-account', [App\Http\Controllers\API\PayoutAccountController::class, 'show']);
    Route::put('/payout-account', [App\Http\Controllers\API\PayoutAccountController::class, 'upsert']);
    Route::get('/paystack/banks', [App\Http\Controllers\API\PayoutAccountController::class, 'banks']);

    Route::middleware('admin')->group(function () {
        Route::get('/platform-wallet', [App\Http\Controllers\API\PlatformWalletController::class, 'show']);
        Route::get('/finance/movements', [App\Http\Controllers\API\FinanceController::class, 'movements']);
        Route::get('/finance/summary', [App\Http\Controllers\API\FinanceController::class, 'summary']);
        Route::get('/finance/escrow', [App\Http\Controllers\API\FinanceController::class, 'escrow']);
        Route::patch('/withdrawals/{id}/approve', [App\Http\Controllers\API\WithdrawalController::class, 'approve']);
        Route::post('/withdrawals/{id}/approve-manual', [App\Http\Controllers\API\WithdrawalController::class, 'approveManual']);
        Route::patch('/withdrawals/{id}/reject', [App\Http\Controllers\API\WithdrawalController::class, 'reject']);
        // Le taux de commission est un levier financier global (aucune portée par
        // utilisateur dans CommissionController) : réservé aux admins.
        Route::apiResource('/commissions', App\Http\Controllers\API\CommissionController::class);
    });

    Route::prefix('payments')->name('payments.')->group(function () {
        Route::post('/initialize', [App\Http\Controllers\API\PaymentController::class, 'initialize']);
        Route::post('/verify', [App\Http\Controllers\API\PaymentController::class, 'verify']);
        Route::post('/qr-code/scan', [App\Http\Controllers\API\PaymentController::class, 'scanQrCode']);
    });
});
