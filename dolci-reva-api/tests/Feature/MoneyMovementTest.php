<?php

use App\Enums\MoneyMovementType;
use App\Models\Booking;
use App\Models\Commission;
use App\Models\Hotel;
use App\Models\HotelRoom;
use App\Models\MoneyMovement;
use App\Models\User;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

function mmFakePaystack(): void
{
    config([
        'services.paystack.secret_key' => 'sk_test_testing',
        'services.paystack.public_key' => 'pk_test_testing',
        'services.paystack.url' => 'https://api.paystack.co',
    ]);

    Http::fake([
        '*/transaction/initialize' => Http::response([
            'status' => true,
            'data' => [
                'authorization_url' => 'https://paystack.test/pay/fake',
                'access_code' => 'fake_access_code',
                'reference' => 'FAKE_REF',
            ],
        ], 200),
        '*/refund' => Http::response(['status' => true, 'data' => []], 200),
    ]);
}

function mmSign(array $payload): string
{
    config(['services.paystack.secret_key' => 'test-secret-key']);

    return hash_hmac('sha512', json_encode($payload), config('services.paystack.secret_key'));
}

function mmPaidBooking(): array
{
    mmFakePaystack();

    $owner = User::factory()->create(['type' => 'OWNER']);
    $customer = User::factory()->create(['type' => 'CUSTOMER']);
    $hotel = Hotel::factory()->create(['owner_id' => $owner->id]);
    $hotelRoom = HotelRoom::factory()->available()->create([
        'hotel_id' => $hotel->id,
        'price' => 100,
        'type' => 'DOUBLE',
        'standing' => 'STANDARD',
        'max_guests' => 4,
    ]);
    Commission::create(['commission' => 10, 'bookable_type' => null, 'is_active' => true]);

    Sanctum::actingAs($customer);
    $response = test()->postJson("/api/hotels/{$hotel->id}/book", [
        'hotel_room_id' => $hotelRoom->id,
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(3)->toDateString(),
        'guests' => 2,
    ])->assertCreated();

    $bookingId = $response->json('data.id');
    $booking = Booking::findOrFail($bookingId);
    $booking->update(['status' => 'CONFIRME']);

    $reference = 'MM_REF_' . $bookingId;
    $payload = [
        'event' => 'charge.success',
        'data' => [
            'reference' => $reference,
            'amount' => (int) ((float) $booking->total_price * 100),
            'metadata' => [
                'booking_id' => $booking->id,
                'user_id' => $customer->id,
            ],
            'customer' => ['email' => $customer->email],
        ],
    ];

    test()->postJson('/api/payments/webhook', $payload, [
        'X-Paystack-Signature' => mmSign($payload),
    ])->assertOk();

    return [
        'owner' => $owner,
        'customer' => $customer,
        'booking' => $booking->fresh(),
        'reference' => $reference,
    ];
}

it('records CLIENT_CHARGE on payment webhook idempotently', function () {
    $ctx = mmPaidBooking();

    expect(MoneyMovement::where('type', MoneyMovementType::CLIENT_CHARGE->value)->count())->toBe(1)
        ->and(MoneyMovement::where('idempotency_key', 'charge:' . $ctx['reference'])->exists())->toBeTrue();

    $payload = [
        'event' => 'charge.success',
        'data' => [
            'reference' => $ctx['reference'],
            'amount' => (int) ((float) $ctx['booking']->total_price * 100),
            'metadata' => [
                'booking_id' => $ctx['booking']->id,
                'user_id' => $ctx['customer']->id,
            ],
            'customer' => ['email' => $ctx['customer']->email],
        ],
    ];

    test()->postJson('/api/payments/webhook', $payload, [
        'X-Paystack-Signature' => mmSign($payload),
    ])->assertOk();

    expect(MoneyMovement::where('type', MoneyMovementType::CLIENT_CHARGE->value)->count())->toBe(1);
});

it('records CLIENT_REFUND on free cancellation', function () {
    $ctx = mmPaidBooking();

    Sanctum::actingAs($ctx['customer']);
    test()->patchJson("/api/bookings/{$ctx['booking']->id}/cancel", [
        'cancellation_reason' => 'Test refund movement',
    ])->assertOk();

    expect(
        MoneyMovement::where('type', MoneyMovementType::CLIENT_REFUND->value)
            ->where('booking_id', $ctx['booking']->id)
            ->where('status', 'RECORDED')
            ->exists()
    )->toBeTrue();
});

it('records OWNER_RELEASE and PLATFORM_COMMISSION at check-in', function () {
    $ctx = mmPaidBooking();

    Sanctum::actingAs($ctx['owner']);
    test()->patchJson("/api/bookings/{$ctx['booking']->id}/complete")->assertOk();

    expect(MoneyMovement::where('type', MoneyMovementType::OWNER_RELEASE->value)->where('booking_id', $ctx['booking']->id)->exists())->toBeTrue()
        ->and(MoneyMovement::where('type', MoneyMovementType::PLATFORM_COMMISSION->value)->where('booking_id', $ctx['booking']->id)->exists())->toBeTrue();

    // Second complete must not duplicate
    test()->patchJson("/api/bookings/{$ctx['booking']->id}/complete");
    expect(MoneyMovement::where('type', MoneyMovementType::OWNER_RELEASE->value)->where('booking_id', $ctx['booking']->id)->count())->toBe(1);
});

it('exposes finance summary and movements to admins only', function () {
    $ctx = mmPaidBooking();
    $admin = User::factory()->create(['type' => 'ADMIN']);

    Sanctum::actingAs($ctx['customer']);
    test()->getJson('/api/finance/summary')->assertForbidden();

    Sanctum::actingAs($admin);
    $summary = test()->getJson('/api/finance/summary')
        ->assertOk()
        ->assertJsonPath('success', true)
        ->json('data');

    expect((float) $summary['gmv'])->toBe((float) $ctx['booking']->total_price);

    test()->getJson('/api/finance/movements')
        ->assertOk()
        ->assertJsonFragment(['type' => MoneyMovementType::CLIENT_CHARGE->value]);

    test()->getJson('/api/finance/escrow')
        ->assertOk()
        ->assertJsonPath('success', true);
});

it('backfills money movements from existing bookings', function () {
    mmFakePaystack();

    $owner = User::factory()->create(['type' => 'OWNER']);
    $customer = User::factory()->create(['type' => 'CUSTOMER']);
    $hotel = Hotel::factory()->create(['owner_id' => $owner->id]);
    $room = HotelRoom::factory()->available()->create([
        'hotel_id' => $hotel->id,
        'price' => 50,
        'type' => 'DOUBLE',
        'standing' => 'STANDARD',
        'max_guests' => 2,
    ]);

    $booking = Booking::create([
        'customer_id' => $customer->id,
        'owner_id' => $owner->id,
        'bookable_type' => Hotel::class,
        'bookable_id' => $hotel->id,
        'hotel_room_id' => $room->id,
        'start_date' => now()->addDay(),
        'end_date' => now()->addDays(2),
        'guests' => 1,
        'booking_reference' => 'BF-TEST-1',
        'total_price' => 50,
        'commission_amount' => 0,
        'owner_amount' => 50,
        'status' => 'ANNULE',
        'payment_status' => 'REMBOURSE',
        'payment_reference' => 'BF_REF_1',
        'cancelled_at' => now(),
    ]);

    expect(MoneyMovement::count())->toBe(0);

    Artisan::call('finance:backfill-money-movements');

    expect(MoneyMovement::where('idempotency_key', 'charge:BF_REF_1')->exists())->toBeTrue()
        ->and(MoneyMovement::where('booking_id', $booking->id)->where('type', MoneyMovementType::CLIENT_REFUND->value)->exists())->toBeTrue();

    // Idempotent second run
    Artisan::call('finance:backfill-money-movements');
    expect(MoneyMovement::where('idempotency_key', 'charge:BF_REF_1')->count())->toBe(1);
});
