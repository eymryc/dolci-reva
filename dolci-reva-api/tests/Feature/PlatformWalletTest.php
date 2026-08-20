<?php

use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use App\Services\PlatformLedgerService;
use Laravel\Sanctum\Sanctum;

it('returns the platform wallet summary for admins', function () {
    $admin = User::factory()->create(['type' => 'ADMIN']);
    $owner = User::factory()->create(['type' => 'OWNER']);

    app(PlatformLedgerService::class)->credit(15000, 'Commission test');

    Withdrawal::create([
        'user_id' => $owner->id,
        'amount' => 5000,
        'status' => 'PENDING',
    ]);

    Sanctum::actingAs($admin);

    $this->getJson('/api/platform-wallet')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->assertJsonPath('data.balance', 15000)
        ->assertJsonPath('data.pending_withdrawals', 1)
        ->assertJsonPath('data.currency', 'XOF');
});

it('forbids platform wallet access for non-admins', function () {
    $owner = User::factory()->create(['type' => 'OWNER']);
    Sanctum::actingAs($owner);

    $this->getJson('/api/platform-wallet')->assertForbidden();
});
