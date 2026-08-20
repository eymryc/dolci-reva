<?php

use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

/**
 * POST /api/wallets/recharge n'existait pas du tout : le hook web
 * useRechargeWallet() (et le bouton "Recharger" de la page wallet) appelait
 * un endpoint inexistant. Le crédit effectif reste géré par le webhook
 * Paystack (handleSuccessfulCharge, sans booking_id en métadonnée), cette
 * route ne fait qu'initialiser la transaction.
 */
it('initializes a Paystack transaction for a wallet recharge', function () {
    config([
        'services.paystack.secret_key' => 'sk_test_testing',
        'services.paystack.public_key' => 'pk_test_testing',
    ]);

    Http::fake(['*/transaction/initialize' => Http::response([
        'status' => true,
        'data' => [
            'authorization_url' => 'https://paystack.test/pay/recharge',
            'access_code' => 'abc',
            'reference' => 'RECHARGE_REF',
        ],
    ], 200)]);

    $user = User::factory()->create(['type' => 'CUSTOMER']);
    Sanctum::actingAs($user);

    $response = $this->postJson('/api/wallets/recharge', ['amount' => 5000])->assertOk();

    expect($response->json('data.payment_url'))->toBe('https://paystack.test/pay/recharge');

    Http::assertSent(function ($request) {
        // PaystackService convertit en centimes (plus petite unité de devise).
        return str_contains($request->url(), '/transaction/initialize')
            && (float) $request['amount'] === 500000.0
            && !isset($request['metadata']['booking_id']);
    });
});

it('forbids viewing someone else\'s wallet by id', function () {
    $me = User::factory()->create(['type' => 'CUSTOMER']);
    $someoneElse = User::factory()->create(['type' => 'CUSTOMER']);
    $otherWallet = Wallet::create(['user_id' => $someoneElse->id, 'balance' => 500]);

    Sanctum::actingAs($me);

    $this->getJson("/api/wallets/{$otherWallet->id}")->assertNotFound();
});
