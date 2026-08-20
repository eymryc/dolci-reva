<?php

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Laravel\Sanctum\Sanctum;

/**
 * GET /api/wallets et /api/wallet_transactions n'avaient aucune portée par
 * utilisateur avant ce correctif : n'importe quel client authentifié
 * pouvait lister le solde et l'historique financier de tout le monde
 * (découvert le 10/07/2026 en construisant la page portefeuille client).
 */
it('only returns the authenticated user\'s own wallet, not everyone\'s', function () {
    $me = User::factory()->create(['type' => 'CUSTOMER']);
    $someoneElse = User::factory()->create(['type' => 'CUSTOMER']);

    $myWallet = Wallet::create(['user_id' => $me->id, 'balance' => 1000]);
    Wallet::create(['user_id' => $someoneElse->id, 'balance' => 99999]);

    Sanctum::actingAs($me);

    $response = $this->getJson('/api/wallets')->assertOk();
    $walletIds = collect($response->json('data'))->pluck('id');

    expect($walletIds)->toContain($myWallet->id)
        ->and($walletIds->count())->toBe(1);
});

it('only returns transactions from the authenticated user\'s own wallet', function () {
    $me = User::factory()->create(['type' => 'CUSTOMER']);
    $someoneElse = User::factory()->create(['type' => 'CUSTOMER']);

    $myWallet = Wallet::create(['user_id' => $me->id, 'balance' => 1000]);
    $otherWallet = Wallet::create(['user_id' => $someoneElse->id, 'balance' => 500]);

    $myTransaction = WalletTransaction::create(['wallet_id' => $myWallet->id, 'type' => 'CREDIT', 'amount' => 100, 'reason' => 'Test']);
    WalletTransaction::create(['wallet_id' => $otherWallet->id, 'type' => 'CREDIT', 'amount' => 500, 'reason' => 'Secret']);

    Sanctum::actingAs($me);

    $response = $this->getJson('/api/wallet_transactions')->assertOk();
    $transactionIds = collect($response->json('data'))->pluck('id');

    expect($transactionIds)->toContain($myTransaction->id)
        ->and($transactionIds->count())->toBe(1);
});

it('lets an admin see every wallet and transaction', function () {
    $admin = User::factory()->create(['type' => 'ADMIN']);
    $customer = User::factory()->create(['type' => 'CUSTOMER']);
    Wallet::create(['user_id' => $customer->id, 'balance' => 500]);

    Sanctum::actingAs($admin);

    $this->getJson('/api/wallets')->assertOk()->assertJsonCount(1, 'data');
});

it('does not expose wallet or transaction write routes', function () {
    $user = User::factory()->create(['type' => 'CUSTOMER']);
    $wallet = Wallet::create(['user_id' => $user->id]);
    $transaction = WalletTransaction::create([
        'wallet_id' => $wallet->id,
        'type' => 'CREDIT',
        'amount' => 100,
        'reason' => 'System credit',
    ]);

    Sanctum::actingAs($user);

    $this->postJson('/api/wallets', ['balance' => 999999])->assertMethodNotAllowed();
    $this->patchJson("/api/wallets/{$wallet->id}", ['balance' => 999999])->assertMethodNotAllowed();
    $this->deleteJson("/api/wallets/{$wallet->id}")->assertMethodNotAllowed();
    $this->postJson('/api/wallet_transactions', ['amount' => 999999])->assertMethodNotAllowed();
    $this->patchJson("/api/wallet_transactions/{$transaction->id}", ['amount' => 999999])->assertMethodNotAllowed();
    $this->deleteJson("/api/wallet_transactions/{$transaction->id}")->assertMethodNotAllowed();
});

it('does not expose another user transaction by id', function () {
    $me = User::factory()->create(['type' => 'CUSTOMER']);
    $someoneElse = User::factory()->create(['type' => 'CUSTOMER']);
    $otherWallet = Wallet::create(['user_id' => $someoneElse->id]);
    $transaction = WalletTransaction::create([
        'wallet_id' => $otherWallet->id,
        'type' => 'CREDIT',
        'amount' => 500,
        'reason' => 'Secret',
    ]);

    Sanctum::actingAs($me);

    $this->getJson("/api/wallet_transactions/{$transaction->id}")->assertNotFound();
});

it('does not mass assign wallet balances', function () {
    $user = User::factory()->create(['type' => 'CUSTOMER']);

    $wallet = Wallet::create(['user_id' => $user->id, 'balance' => 999999]);

    expect((float) $wallet->balance)->toBe(0.0);
});
