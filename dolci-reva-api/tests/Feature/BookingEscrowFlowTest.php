<?php

use App\Models\Commission;
use App\Models\Hotel;
use App\Models\HotelRoom;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

/**
 * Couvre le chemin le plus sensible du produit : un bug ici se traduit
 * directement en argent perdu ou en litige avec un propriétaire (cf. audit
 * juillet 2026, priorité #3). Le flux réel est : création → confirmation →
 * paiement (webhook Paystack) → séquestre → check-in (libération des fonds).
 */
function fakePaystack(): void
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

function signPaystackPayload(array $payload): string
{
    config(['services.paystack.secret_key' => 'test-secret-key']);

    return hash_hmac('sha512', json_encode($payload), config('services.paystack.secret_key'));
}

function makeHotelBookingContext(): array
{
    fakePaystack();

    $owner = User::factory()->create(['type' => 'OWNER']);
    $customer = User::factory()->create(['type' => 'CUSTOMER']);
    $hotel = Hotel::factory()->create(['owner_id' => $owner->id]);
    // type/standing fixés explicitement : HotelRoomFactory tire "PRESIDENTIELLE"
    // au hasard, une valeur absente de l'enum réel de la colonne "standing"
    // (cf. migration create_hotel_rooms_table), ce qui ferait échouer l'insert
    // de façon intermittente si on laissait le tirage aléatoire.
    $hotelRoom = HotelRoom::factory()->available()->create([
        'hotel_id' => $hotel->id,
        'price' => 100,
        'type' => 'DOUBLE',
        'standing' => 'STANDARD',
        'max_guests' => 4,
    ]);

    // 10% de commission globale : total 200 (2 nuits x 100) -> commission 20, owner 180.
    Commission::create(['commission' => 10, 'bookable_type' => null, 'is_active' => true]);

    return compact('owner', 'customer', 'hotel', 'hotelRoom');
}

function createConfirmedHotelBooking(array $ctx): array
{
    Sanctum::actingAs($ctx['customer']);

    $response = test()->postJson("/api/hotels/{$ctx['hotel']->id}/book", [
        'hotel_room_id' => $ctx['hotelRoom']->id,
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(3)->toDateString(),
        'guests' => 2,
    ])->assertCreated();

    $bookingId = $response->json('data.id');

    Sanctum::actingAs($ctx['owner']);
    test()->patchJson("/api/bookings/{$bookingId}/confirm")->assertOk();

    return ['bookingId' => $bookingId];
}

it('calculates commission and owner payout at booking creation, before any payment', function () {
    $ctx = makeHotelBookingContext();
    Sanctum::actingAs($ctx['customer']);

    $response = $this->postJson("/api/hotels/{$ctx['hotel']->id}/book", [
        'hotel_room_id' => $ctx['hotelRoom']->id,
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(3)->toDateString(),
        'guests' => 2,
    ])->assertCreated();

    $response->assertJsonPath('data.total_price', '200.00')
        ->assertJsonPath('data.commission_amount', '20.00')
        ->assertJsonPath('data.owner_amount', '180.00')
        ->assertJsonPath('data.status', 'EN_ATTENTE')
        ->assertJsonPath('data.payment_status', 'EN_ATTENTE');

    expect($response->json('payment_url'))->toBe('https://paystack.test/pay/fake');
});

it('secures funds in escrow on payment webhook without crediting the owner wallet yet', function () {
    $ctx = makeHotelBookingContext();
    ['bookingId' => $bookingId] = createConfirmedHotelBooking($ctx);

    $payload = [
        'event' => 'charge.success',
        'data' => [
            'reference' => 'PSK_REF_' . $bookingId,
            'amount' => 20000, // 200.00 XOF en centimes
            'metadata' => ['booking_id' => $bookingId],
            'customer' => ['email' => $ctx['customer']->email],
        ],
    ];

    $this->postJson('/api/payments/webhook', $payload, [
        'X-Paystack-Signature' => signPaystackPayload($payload),
    ])->assertOk();

    $booking = \App\Models\Booking::find($bookingId);
    expect($booking->payment_status)->toBe('PAYE')
        ->and($booking->payment_reference)->toBe('PSK_REF_' . $bookingId)
        ->and($booking->funds_released_at)->toBeNull()
        ->and($booking->escrowStatus())->toBe('SECURISE');

    $wallet = Wallet::where('user_id', $ctx['owner']->id)->first();
    expect((float) ($wallet->balance ?? 0))->toBe(0.0);
});

it('rejects a payment webhook with an invalid signature and leaves the booking unpaid', function () {
    $ctx = makeHotelBookingContext();
    ['bookingId' => $bookingId] = createConfirmedHotelBooking($ctx);

    $payload = [
        'event' => 'charge.success',
        'data' => [
            'reference' => 'PSK_REF_' . $bookingId,
            'amount' => 20000,
            'metadata' => ['booking_id' => $bookingId],
            'customer' => ['email' => $ctx['customer']->email],
        ],
    ];

    $this->postJson('/api/payments/webhook', $payload, [
        'X-Paystack-Signature' => 'not-the-real-signature',
    ])->assertUnauthorized();

    expect(\App\Models\Booking::find($bookingId)->payment_status)->toBe('EN_ATTENTE');
});

it('releases funds to the owner wallet only at check-in, exactly once', function () {
    $ctx = makeHotelBookingContext();
    ['bookingId' => $bookingId] = createConfirmedHotelBooking($ctx);

    $payload = [
        'event' => 'charge.success',
        'data' => [
            'reference' => 'PSK_REF_' . $bookingId,
            'amount' => 20000,
            'metadata' => ['booking_id' => $bookingId],
            'customer' => ['email' => $ctx['customer']->email],
        ],
    ];
    $this->postJson('/api/payments/webhook', $payload, [
        'X-Paystack-Signature' => signPaystackPayload($payload),
    ])->assertOk();

    Sanctum::actingAs($ctx['owner']);

    // Check-in : les fonds sont libérés.
    $this->patchJson("/api/bookings/{$bookingId}/complete")->assertOk();

    $booking = \App\Models\Booking::find($bookingId);
    expect($booking->status)->toBe('COMPLETE')
        ->and($booking->funds_released_at)->not->toBeNull()
        ->and($booking->escrowStatus())->toBe('LIBERE');

    $wallet = Wallet::where('user_id', $ctx['owner']->id)->first();
    expect((float) $wallet->balance)->toBe(180.0);
    expect($wallet->transactions()->where('type', 'CREDIT')->count())->toBe(1);

    // Commission créditée au ledger plateforme.
    $platformWallet = Wallet::where('is_platform', true)->first();
    expect($platformWallet)->not->toBeNull()
        ->and((float) $platformWallet->balance)->toBe(20.0);
    expect($platformWallet->transactions()->where('reason', 'LIKE', 'Commission réservation #%')->count())->toBe(1);

    // Un second check-in ne doit pas créditer le wallet une seconde fois.
    $this->patchJson("/api/bookings/{$bookingId}/complete");

    $wallet->refresh();
    expect((float) $wallet->balance)->toBe(180.0);
    expect($wallet->transactions()->where('type', 'CREDIT')->count())->toBe(1);

    $platformWallet->refresh();
    expect((float) $platformWallet->balance)->toBe(20.0);
    expect($platformWallet->transactions()->where('type', 'CREDIT')->count())->toBe(1);
});

it('credits the platform wallet with retained amount when late cancel has 0% refund', function () {
    config([
        'booking.cancellation.hotel.free_cancel_hours' => 48,
        'booking.cancellation.hotel.late_refund_percent' => 0,
        'booking.post_booking_free_cancel_minutes' => 0,
    ]);

    $ctx = makeHotelBookingContext();
    Sanctum::actingAs($ctx['customer']);

    // Séjour imminent : hors délai d'annulation gratuite.
    $response = $this->postJson("/api/hotels/{$ctx['hotel']->id}/book", [
        'hotel_room_id' => $ctx['hotelRoom']->id,
        'start_date' => now()->addHours(2)->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'guests' => 2,
    ])->assertCreated();

    $bookingId = $response->json('data.id');

    Sanctum::actingAs($ctx['owner']);
    $this->patchJson("/api/bookings/{$bookingId}/confirm")->assertOk();

    $payload = [
        'event' => 'charge.success',
        'data' => [
            'reference' => 'PSK_REF_' . $bookingId,
            'amount' => 20000,
            'metadata' => ['booking_id' => $bookingId],
            'customer' => ['email' => $ctx['customer']->email],
        ],
    ];
    $this->postJson('/api/payments/webhook', $payload, [
        'X-Paystack-Signature' => signPaystackPayload($payload),
    ])->assertOk();

    Sanctum::actingAs($ctx['customer']);
    $this->patchJson("/api/bookings/{$bookingId}/cancel", [
        'cancellation_reason' => 'Trop tard',
    ])->assertOk();

    Http::assertNotSent(fn ($request) => str_contains($request->url(), '/refund'));

    $booking = \App\Models\Booking::find($bookingId);
    expect($booking->status)->toBe('ANNULE')
        ->and($booking->platform_retained_at)->not->toBeNull();

    $platformWallet = Wallet::where('is_platform', true)->first();
    expect($platformWallet)->not->toBeNull()
        ->and((float) $platformWallet->balance)->toBe(200.0);

    $ownerWallet = Wallet::where('user_id', $ctx['owner']->id)->first();
    expect((float) ($ownerWallet->balance ?? 0))->toBe(0.0);
});

it('refunds the customer via Paystack when a paid-but-not-released booking is cancelled, without touching the owner wallet', function () {
    $ctx = makeHotelBookingContext();
    ['bookingId' => $bookingId] = createConfirmedHotelBooking($ctx);

    $payload = [
        'event' => 'charge.success',
        'data' => [
            'reference' => 'PSK_REF_' . $bookingId,
            'amount' => 20000,
            'metadata' => ['booking_id' => $bookingId],
            'customer' => ['email' => $ctx['customer']->email],
        ],
    ];
    $this->postJson('/api/payments/webhook', $payload, [
        'X-Paystack-Signature' => signPaystackPayload($payload),
    ])->assertOk();

    Sanctum::actingAs($ctx['customer']);
    $this->patchJson("/api/bookings/{$bookingId}/cancel", [
        'cancellation_reason' => 'Empêchement de dernière minute',
    ])->assertOk();

    Http::assertSent(fn ($request) => str_contains($request->url(), '/refund'));

    $booking = \App\Models\Booking::find($bookingId);
    expect($booking->status)->toBe('ANNULE')
        ->and($booking->payment_status)->toBe('REMBOURSE');

    $wallet = Wallet::where('user_id', $ctx['owner']->id)->first();
    expect((float) ($wallet->balance ?? 0))->toBe(0.0);
});
