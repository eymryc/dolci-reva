<?php

use App\Enums\MoneyMovementType;
use App\Models\Booking;
use App\Models\Commission;
use App\Models\CustomerCredit;
use App\Models\Hotel;
use App\Models\HotelRoom;
use App\Models\MoneyMovement;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

function creditFakePaystack(): void
{
    config([
        'services.paystack.secret_key' => 'sk_test_testing',
        'services.paystack.public_key' => 'pk_test_testing',
        'services.paystack.url' => 'https://api.paystack.co',
        'booking.credit.enabled' => true,
        'booking.credit.bonus_percent' => 10,
        'booking.credit.expires_months' => 12,
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

function creditSign(array $payload): string
{
    config(['services.paystack.secret_key' => 'test-secret-key']);

    return hash_hmac('sha512', json_encode($payload), config('services.paystack.secret_key'));
}

function creditPaidBooking(): array
{
    creditFakePaystack();

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
    Commission::create(['commission' => 0, 'bookable_type' => null, 'is_active' => true]);

    Sanctum::actingAs($customer);
    $response = test()->postJson("/api/hotels/{$hotel->id}/book", [
        'hotel_room_id' => $hotelRoom->id,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(7)->toDateString(),
        'guests' => 2,
    ])->assertCreated();

    $booking = Booking::findOrFail($response->json('data.id'));
    $booking->update(['status' => 'CONFIRME']);

    $reference = 'CREDIT_FLOW_' . $booking->id;
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
        'X-Paystack-Signature' => creditSign($payload),
    ])->assertOk();

    return [
        'owner' => $owner,
        'customer' => $customer,
        'hotel' => $hotel,
        'hotelRoom' => $hotelRoom,
        'booking' => $booking->fresh(),
    ];
}

it('issues avoir with 10% bonus on cancel with settlement=credit and does not call Paystack refund', function () {
    $ctx = creditPaidBooking();

    Sanctum::actingAs($ctx['customer']);
    test()->patchJson("/api/bookings/{$ctx['booking']->id}/cancel", [
        'cancellation_reason' => 'Je prends un avoir',
        'settlement' => 'credit',
    ])
        ->assertOk()
        ->assertJsonPath('settlement.settlement', 'credit');

    $expectedBase = (float) $ctx['booking']->total_price;
    $expectedCredit = round($expectedBase * 1.1, 2);

    expect(CustomerCredit::where('user_id', $ctx['customer']->id)->count())->toBe(1)
        ->and((float) CustomerCredit::first()->remaining_amount)->toBe($expectedCredit)
        ->and(MoneyMovement::where('type', MoneyMovementType::CREDIT_ISSUED->value)->exists())->toBeTrue();

    Http::assertNotSent(fn ($request) => str_contains($request->url(), '/refund'));
});

it('still refunds via Paystack when settlement is omitted', function () {
    $ctx = creditPaidBooking();

    Sanctum::actingAs($ctx['customer']);
    test()->patchJson("/api/bookings/{$ctx['booking']->id}/cancel", [
        'cancellation_reason' => 'Rembourse-moi',
    ])->assertOk();

    Http::assertSent(fn ($request) => str_contains($request->url(), '/refund'));
    expect(CustomerCredit::count())->toBe(0);
});

it('pays a new booking fully with avoir without Paystack initialize', function () {
    $ctx = creditPaidBooking();

    Sanctum::actingAs($ctx['customer']);
    test()->patchJson("/api/bookings/{$ctx['booking']->id}/cancel", [
        'settlement' => 'credit',
    ])->assertOk();

    Http::fake([
        '*/transaction/initialize' => Http::response(['status' => false], 500),
    ]);

    $response = test()->postJson("/api/hotels/{$ctx['hotel']->id}/book", [
        'hotel_room_id' => $ctx['hotelRoom']->id,
        'start_date' => now()->addDays(10)->toDateString(),
        'end_date' => now()->addDays(11)->toDateString(),
        'guests' => 1,
    ])->assertCreated();

    $newBooking = Booking::findOrFail($response->json('data.id'));
    expect($newBooking->payment_status)->toBe('PAYE')
        ->and((float) $newBooking->credit_applied)->toBeGreaterThan(0)
        ->and(MoneyMovement::where('type', MoneyMovementType::CREDIT_REDEEMED->value)
            ->where('booking_id', $newBooking->id)->exists())->toBeTrue();

    Http::assertNotSent(fn ($request) => str_contains($request->url(), '/transaction/initialize'));
});

it('returns customer credit balance on GET /customer-credits', function () {
    $ctx = creditPaidBooking();
    Sanctum::actingAs($ctx['customer']);
    test()->patchJson("/api/bookings/{$ctx['booking']->id}/cancel", [
        'settlement' => 'credit',
    ])->assertOk();

    $balance = round((float) $ctx['booking']->total_price * 1.1, 2);

    $response = test()->getJson('/api/customer-credits')
        ->assertOk()
        ->assertJsonPath('data.enabled', true);

    expect((float) $response->json('data.balance'))->toBe($balance);
});

it('initializes Paystack only for the remainder when avoir is partial', function () {
    creditFakePaystack();

    $owner = User::factory()->create(['type' => 'OWNER']);
    $customer = User::factory()->create(['type' => 'CUSTOMER']);
    $hotel = Hotel::factory()->create(['owner_id' => $owner->id]);
    $cheapRoom = HotelRoom::factory()->available()->create([
        'hotel_id' => $hotel->id,
        'price' => 50,
        'type' => 'DOUBLE',
        'standing' => 'STANDARD',
        'max_guests' => 4,
    ]);
    $expensiveRoom = HotelRoom::factory()->available()->create([
        'hotel_id' => $hotel->id,
        'price' => 200,
        'type' => 'DOUBLE',
        'standing' => 'STANDARD',
        'max_guests' => 4,
    ]);
    Commission::create(['commission' => 0, 'bookable_type' => null, 'is_active' => true]);

    // Petite résa payée puis annulée en avoir (~50 * 1 nuit * 1.1 = 55)
    Sanctum::actingAs($customer);
    $small = test()->postJson("/api/hotels/{$hotel->id}/book", [
        'hotel_room_id' => $cheapRoom->id,
        'start_date' => now()->addDays(5)->toDateString(),
        'end_date' => now()->addDays(6)->toDateString(),
        'guests' => 1,
    ])->assertCreated();

    $smallBooking = Booking::findOrFail($small->json('data.id'));
    $smallBooking->update(['status' => 'CONFIRME']);

    $reference = 'PARTIAL_CREDIT_' . $smallBooking->id;
    $payload = [
        'event' => 'charge.success',
        'data' => [
            'reference' => $reference,
            'amount' => (int) ((float) $smallBooking->total_price * 100),
            'metadata' => [
                'booking_id' => $smallBooking->id,
                'user_id' => $customer->id,
            ],
            'customer' => ['email' => $customer->email],
        ],
    ];

    test()->postJson('/api/payments/webhook', $payload, [
        'X-Paystack-Signature' => creditSign($payload),
    ])->assertOk();

    test()->patchJson("/api/bookings/{$smallBooking->id}/cancel", [
        'settlement' => 'credit',
    ])->assertOk();

    $creditBalance = round((float) $smallBooking->fresh()->total_price * 1.1, 2);

    Http::fake([
        '*/transaction/initialize' => Http::response([
            'status' => true,
            'data' => [
                'authorization_url' => 'https://paystack.test/pay/partial',
                'access_code' => 'partial_access',
                'reference' => 'PARTIAL_REF',
            ],
        ], 200),
    ]);

    $big = test()->postJson("/api/hotels/{$hotel->id}/book", [
        'hotel_room_id' => $expensiveRoom->id,
        'start_date' => now()->addDays(10)->toDateString(),
        'end_date' => now()->addDays(12)->toDateString(),
        'guests' => 1,
    ])->assertCreated();

    $newBooking = Booking::findOrFail($big->json('data.id'));

    expect((float) $newBooking->credit_applied)->toBe($creditBalance)
        ->and($newBooking->payment_status)->not->toBe('PAYE')
        ->and($big->json('payment_url') ?? $big->json('data.payment_url'))->not->toBeNull();

    Http::assertSent(function ($request) use ($newBooking, $creditBalance) {
        if (! str_contains($request->url(), '/transaction/initialize')) {
            return false;
        }
        $body = $request->data();
        $amountKobo = (int) ($body['amount'] ?? 0);
        $expected = (int) (round((float) $newBooking->total_price - $creditBalance, 2) * 100);

        return $amountKobo === $expected;
    });
});
