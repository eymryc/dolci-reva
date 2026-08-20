<?php

use App\Models\Booking;
use App\Models\Hotel;
use App\Models\HotelRoom;
use App\Models\User;
use Illuminate\Support\Facades\Http;

/**
 * Avant ce correctif (audit du 10/07/2026, priorité #4), callback_url
 * pointait vers une route /api/payments/callback qui n'existait pas du tout
 * (404 Laravel après paiement) et le mobile n'avait aucun moyen de savoir
 * où rediriger l'utilisateur. Ces tests couvrent la redirection selon la
 * plateforme d'origine (web vs mobile) et le cas d'échec.
 */
function fakePaystackVerify(array $data, bool $status = true): void
{
    Http::fake([
        '*/transaction/verify/*' => Http::response(['status' => $status, 'data' => $data], 200),
    ]);
}

function makePendingHotelBooking(): array
{
    config([
        'services.paystack.secret_key' => 'sk_test_testing',
        'services.paystack.public_key' => 'pk_test_testing',
    ]);

    Http::fake(['*/transaction/initialize' => Http::response([
        'status' => true,
        'data' => ['authorization_url' => 'https://paystack.test/pay/fake', 'access_code' => 'x', 'reference' => 'FAKE_REF'],
    ], 200)]);

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

    \Laravel\Sanctum\Sanctum::actingAs($customer);
    $response = test()->postJson("/api/hotels/{$hotel->id}/book", [
        'hotel_room_id' => $hotelRoom->id,
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'guests' => 2,
    ])->assertCreated();

    return ['bookingId' => $response->json('data.id')];
}

it('redirects to the mobile deep link with a success status when the platform is mobile', function () {
    ['bookingId' => $bookingId] = makePendingHotelBooking();
    $booking = Booking::find($bookingId);

    fakePaystackVerify([
        'status' => 'success',
        'metadata' => ['booking_id' => $bookingId],
    ]);

    $response = $this->get('/api/payments/callback?reference=PSK_123&platform=mobile');

    $response->assertRedirect();
    expect($response->headers->get('Location'))
        ->toStartWith('dolcireva://payment/callback?')
        ->toContain('status=success')
        ->toContain('booking_reference=' . urlencode($booking->booking_reference));

    expect($booking->fresh()->payment_status)->toBe('PAYE');
});

it('redirects to the web receipt page with a success status by default (no platform param)', function () {
    ['bookingId' => $bookingId] = makePendingHotelBooking();

    fakePaystackVerify([
        'status' => 'success',
        'metadata' => ['booking_id' => $bookingId],
    ]);

    $response = $this->get('/api/payments/callback?reference=PSK_123');

    $response->assertRedirect();
    expect($response->headers->get('Location'))
        ->toContain('/bookings/' . $bookingId . '/receipt')
        ->toContain('status=success');
});

it('redirects with a failed status when Paystack verification does not confirm success', function () {
    ['bookingId' => $bookingId] = makePendingHotelBooking();

    fakePaystackVerify(['status' => 'failed'], status: true);

    $response = $this->get('/api/payments/callback?reference=PSK_BAD&platform=mobile');

    expect($response->headers->get('Location'))->toContain('status=failed');
    expect(Booking::find($bookingId)->payment_status)->toBe('EN_ATTENTE');
});

it('does not reprocess a booking already marked as paid by the webhook', function () {
    ['bookingId' => $bookingId] = makePendingHotelBooking();
    $booking = Booking::find($bookingId);
    $booking->update(['payment_status' => 'PAYE', 'payment_reference' => 'ALREADY_PAID_REF']);

    fakePaystackVerify([
        'status' => 'success',
        'metadata' => ['booking_id' => $bookingId],
    ]);

    $this->get('/api/payments/callback?reference=PSK_123&platform=mobile');

    // La référence posée par le webhook ne doit pas être écrasée par le callback.
    expect($booking->fresh()->payment_reference)->toBe('ALREADY_PAID_REF');
});
