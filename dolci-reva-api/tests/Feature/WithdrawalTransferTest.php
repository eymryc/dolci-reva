<?php

use App\Enums\WithdrawalEnum;
use App\Models\PayoutAccount;
use App\Models\User;
use App\Models\Wallet;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

function fakePaystackTransfers(): void
{
    config([
        'services.paystack.secret_key' => 'sk_test_testing',
        'services.paystack.public_key' => 'pk_test_testing',
        'services.paystack.url' => 'https://api.paystack.co',
        'services.paystack.transfers_enabled' => true,
        'services.payout.currency' => 'XOF',
        'services.payout.channel_bank_codes' => [
            'wave' => 'WAVE',
            'orange_money' => 'ORANGE',
            'mtn' => 'MTN',
            'moov' => 'MOOV',
        ],
    ]);

    Http::fake([
        '*/transferrecipient' => Http::response([
            'status' => true,
            'data' => [
                'recipient_code' => 'RCP_test_wave',
                'type' => 'mobile_money',
            ],
        ], 200),
        '*/transfer/verify/*' => Http::response([
            'status' => true,
            'data' => ['status' => 'success', 'reference' => 'WD_REF'],
        ], 200),
        '*/transfer' => Http::response([
            'status' => true,
            'data' => [
                'reference' => 'WD_TRANSFER_REF',
                'transfer_code' => 'TRF_test_code',
                'status' => 'pending',
            ],
        ], 200),
        '*/bank*' => Http::response([
            'status' => true,
            'data' => [
                ['name' => 'Wave', 'code' => 'WAVE', 'type' => 'mobile_money'],
            ],
        ], 200),
    ]);
}

function signTransferPayload(array $payload): string
{
    config(['services.paystack.secret_key' => 'sk_test_testing']);

    return hash_hmac('sha512', json_encode($payload), config('services.paystack.secret_key'));
}

it('upserts payout account and stores Paystack recipient code', function () {
    fakePaystackTransfers();

    $owner = User::factory()->create(['type' => 'OWNER']);
    Sanctum::actingAs($owner);

    $this->putJson('/api/payout-account', [
        'channel' => 'wave',
        'account_name' => 'Jean Owner',
        'account_number' => '0700000000',
    ])->assertOk()
        ->assertJsonPath('data.paystack_recipient_code', 'RCP_test_wave')
        ->assertJsonPath('data.is_verified', true)
        ->assertJsonPath('data.channel', 'wave');

    expect(PayoutAccount::where('user_id', $owner->id)->count())->toBe(1);
});

it('saves payout account unverified when Paystack recipient creation fails', function () {
    config([
        'services.paystack.secret_key' => 'sk_test_testing',
        'services.paystack.url' => 'https://api.paystack.co',
    ]);

    Http::fake([
        '*/transferrecipient' => Http::response([
            'status' => false,
            'message' => 'Currency not supported for mobile_money',
        ], 400),
    ]);

    $owner = User::factory()->create(['type' => 'OWNER']);
    Sanctum::actingAs($owner);

    $this->putJson('/api/payout-account', [
        'channel' => 'orange_money',
        'account_name' => 'Marie Owner',
        'account_number' => '0700112233',
    ])->assertOk()
        ->assertJsonPath('data.is_verified', false)
        ->assertJsonPath('data.paystack_recipient_code', null);

    expect(PayoutAccount::where('user_id', $owner->id)->exists())->toBeTrue();
});

it('requires a payout account before creating a withdrawal', function () {
    $owner = User::factory()->create(['type' => 'OWNER']);
    Wallet::create(['user_id' => $owner->id, 'is_platform' => false])
        ->forceFill(['balance' => 5000])
        ->save();
    Sanctum::actingAs($owner);

    $this->postJson('/api/withdrawals', ['amount' => 1000])
        ->assertUnprocessable();
});

it('forbids changing a withdrawal amount after creation', function () {
    $owner = User::factory()->create(['type' => 'OWNER']);
    $withdrawal = Withdrawal::create([
        'user_id' => $owner->id,
        'amount' => 1500,
        'status' => WithdrawalEnum::PENDING->value,
    ]);

    Sanctum::actingAs($owner);

    $this->patchJson("/api/withdrawals/{$withdrawal->id}", ['amount' => 5000])
        ->assertForbidden();

    expect((float) $withdrawal->fresh()->amount)->toBe(1500.0);
});

it('initiates a Paystack transfer on admin approve when recipient exists', function () {
    fakePaystackTransfers();

    $owner = User::factory()->create(['type' => 'OWNER']);
    $admin = User::factory()->create(['type' => 'ADMIN']);
    Wallet::create(['user_id' => $owner->id, 'is_platform' => false])
        ->forceFill(['balance' => 5000])
        ->save();

    PayoutAccount::create([
        'user_id' => $owner->id,
        'channel' => 'wave',
        'account_name' => 'Jean Owner',
        'account_number' => '0700000000',
        'bank_code' => 'WAVE',
        'currency' => 'XOF',
        'paystack_recipient_code' => 'RCP_test_wave',
        'paystack_recipient_type' => 'mobile_money',
        'is_verified' => true,
    ]);

    Sanctum::actingAs($owner);
    $create = $this->postJson('/api/withdrawals', ['amount' => 1500])->assertCreated();
    $withdrawalId = $create->json('data.id');

    expect((float) Wallet::where('user_id', $owner->id)->value('balance'))->toBe(3500.0);

    Sanctum::actingAs($admin);
    $this->patchJson("/api/withdrawals/{$withdrawalId}/approve")
        ->assertOk()
        ->assertJsonPath('data.status', WithdrawalEnum::PROCESSING->value)
        ->assertJsonPath('data.transfer_reference', 'WD_TRANSFER_REF');

    Http::assertSent(fn ($request) => str_contains($request->url(), '/transfer')
        && ! str_contains($request->url(), 'transferrecipient')
        && ! str_contains($request->url(), 'verify'));
});

it('marks withdrawal approved on transfer.success webhook', function () {
    fakePaystackTransfers();

    $owner = User::factory()->create(['type' => 'OWNER']);
    $withdrawal = Withdrawal::create([
        'user_id' => $owner->id,
        'amount' => 1500,
        'status' => WithdrawalEnum::PROCESSING->value,
        'transfer_reference' => 'WD_TRANSFER_REF',
        'transfer_code' => 'TRF_test_code',
        'payout_snapshot' => ['paystack_recipient_code' => 'RCP_test_wave'],
    ]);

    $payload = [
        'event' => 'transfer.success',
        'data' => [
            'reference' => 'WD_TRANSFER_REF',
            'transfer_code' => 'TRF_test_code',
            'status' => 'success',
        ],
    ];

    $this->postJson('/api/payments/webhook', $payload, [
        'X-Paystack-Signature' => signTransferPayload($payload),
    ])->assertOk();

    expect($withdrawal->fresh()->status)->toBe(WithdrawalEnum::APPROVED->value);
});

it('recredits wallet on transfer.failed webhook idempotently', function () {
    fakePaystackTransfers();

    $owner = User::factory()->create(['type' => 'OWNER']);
    $wallet = Wallet::create(['user_id' => $owner->id, 'is_platform' => false]);
    $wallet->forceFill(['balance' => 1000])->save();

    $withdrawal = Withdrawal::create([
        'user_id' => $owner->id,
        'amount' => 1500,
        'status' => WithdrawalEnum::PROCESSING->value,
        'transfer_reference' => 'WD_FAIL_REF',
        'payout_snapshot' => ['paystack_recipient_code' => 'RCP_test_wave'],
    ]);

    $payload = [
        'event' => 'transfer.failed',
        'data' => [
            'reference' => 'WD_FAIL_REF',
            'reason' => 'Insufficient balance',
        ],
    ];

    $this->postJson('/api/payments/webhook', $payload, [
        'X-Paystack-Signature' => signTransferPayload($payload),
    ])->assertOk();

    expect($withdrawal->fresh()->status)->toBe(WithdrawalEnum::FAILED->value);
    expect((float) $wallet->fresh()->balance)->toBe(2500.0);

    // Second webhook must not double-credit.
    $this->postJson('/api/payments/webhook', $payload, [
        'X-Paystack-Signature' => signTransferPayload($payload),
    ])->assertOk();

    expect((float) $wallet->fresh()->balance)->toBe(2500.0);
});

it('allows admin forced manual approve without Paystack transfer', function () {
    fakePaystackTransfers();

    $owner = User::factory()->create(['type' => 'OWNER']);
    $admin = User::factory()->create(['type' => 'ADMIN']);
    Wallet::create(['user_id' => $owner->id, 'is_platform' => false])
        ->forceFill(['balance' => 5000])
        ->save();

    PayoutAccount::create([
        'user_id' => $owner->id,
        'channel' => 'bank',
        'account_name' => 'Jean Owner',
        'account_number' => '1234567890',
        'bank_code' => '058',
        'currency' => 'XOF',
        'paystack_recipient_code' => null,
        'is_verified' => false,
    ]);

    Sanctum::actingAs($owner);
    $withdrawalId = $this->postJson('/api/withdrawals', ['amount' => 2000])
        ->assertCreated()
        ->json('data.id');

    Sanctum::actingAs($admin);
    $this->postJson("/api/withdrawals/{$withdrawalId}/approve-manual")
        ->assertOk()
        ->assertJsonPath('data.status', WithdrawalEnum::APPROVED->value);

    Http::assertNotSent(fn ($request) => str_ends_with(parse_url($request->url(), PHP_URL_PATH) ?? '', '/transfer'));
});
