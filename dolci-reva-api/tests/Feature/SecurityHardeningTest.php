<?php

use App\Models\Booking;
use App\Models\BusinessType;
use App\Models\User;
use App\Models\Wallet;
use Laravel\Sanctum\Sanctum;

it('rejects ADMIN self-registration', function () {
    test()->postJson('/api/auth/register', [
        'first_name' => 'Hack',
        'last_name' => 'Admin',
        'email' => 'hackadmin'.uniqid().'@example.com',
        'phone' => '+2250700'.random_int(100000, 999999),
        'password' => 'Password1!',
        'password_confirmation' => 'Password1!',
        'type' => 'ADMIN',
    ])->assertUnprocessable();
});

it('forbids non-admin users listing', function () {
    $customer = User::factory()->create(['type' => 'CUSTOMER']);
    Sanctum::actingAs($customer);

    test()->getJson('/api/users')->assertForbidden();
});

it('forbids wallet balance update', function () {
    $user = User::factory()->create(['type' => 'CUSTOMER']);
    $wallet = new Wallet(['user_id' => $user->id]);
    $wallet->forceFill(['balance' => 10])->save();
    Sanctum::actingAs($user);

    test()->putJson('/api/wallets/'.$wallet->id, ['balance' => 999999])
        ->assertStatus(405);
});

it('forbids creating wallet transactions via API', function () {
    $user = User::factory()->create(['type' => 'CUSTOMER']);
    $wallet = new Wallet(['user_id' => $user->id]);
    $wallet->forceFill(['balance' => 10])->save();
    Sanctum::actingAs($user);

    test()->postJson('/api/wallet_transactions', [
        'wallet_id' => $wallet->id,
        'type' => 'CREDIT',
        'amount' => 5000,
        'reason' => 'hack',
    ])->assertStatus(405);
});

it('forbids unauthenticated business-type mutations', function () {
    test()->postJson('/api/business-types', [
        'name' => 'Hack Type',
    ])->assertUnauthorized();
});

it('rejects unsigned forgeable QR tokens', function () {
    $owner = User::factory()->create(['type' => 'OWNER']);
    $customer = User::factory()->create(['type' => 'CUSTOMER']);
    $hotel = \App\Models\Hotel::factory()->create(['owner_id' => $owner->id]);

    $booking = Booking::create([
        'customer_id' => $customer->id,
        'owner_id' => $owner->id,
        'bookable_type' => \App\Models\Hotel::class,
        'bookable_id' => $hotel->id,
        'start_date' => now()->addDay(),
        'end_date' => now()->addDays(2),
        'guests' => 1,
        'total_price' => 100,
        'commission_amount' => 10,
        'owner_amount' => 90,
        'status' => 'CONFIRME',
        'payment_status' => 'PAYE',
        'booking_reference' => 'BK-QR-'.uniqid(),
    ]);

    Sanctum::actingAs($owner);
    $forged = base64_encode(json_encode([
        'booking_id' => $booking->id,
        'booking_reference' => $booking->booking_reference,
    ]));

    test()->postJson('/api/payments/qr-code/scan', ['token' => $forged])
        ->assertStatus(422);
});
