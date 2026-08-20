<?php

use App\Models\Booking;
use App\Models\Hotel;
use App\Models\HotelRoom;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;

/**
 * DELETE /api/bookings/{id} (route apiResource) n'avait aucune vérification
 * d'autorisation avant ce correctif : n'importe quel utilisateur authentifié
 * pouvait supprimer la réservation de n'importe qui. Contrairement à
 * cancelBooking(), ce hard delete ne déclenche aucun remboursement Paystack
 * — un client aurait pu supprimer sa propre réservation payée sans jamais
 * être remboursé (cf. audit du 10/07/2026).
 */
it('forbids a non-admin from deleting someone else\'s booking', function () {
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
    $otherCustomer = User::factory()->create(['type' => 'CUSTOMER']);
    $hotel = Hotel::factory()->create(['owner_id' => $owner->id]);
    $hotelRoom = HotelRoom::factory()->available()->create([
        'hotel_id' => $hotel->id,
        'price' => 100,
        'type' => 'DOUBLE',
        'standing' => 'STANDARD',
    ]);

    Sanctum::actingAs($customer);
    $response = $this->postJson("/api/hotels/{$hotel->id}/book", [
        'hotel_room_id' => $hotelRoom->id,
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'guests' => 2,
    ])->assertCreated();
    $bookingId = $response->json('data.id');

    Sanctum::actingAs($otherCustomer);
    $this->deleteJson("/api/bookings/{$bookingId}")->assertForbidden();

    Sanctum::actingAs($owner);
    $this->deleteJson("/api/bookings/{$bookingId}")->assertForbidden();

    expect(Booking::find($bookingId))->not->toBeNull();
});

it('allows an admin to delete a booking', function () {
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
    $admin = User::factory()->create(['type' => 'ADMIN']);
    $hotel = Hotel::factory()->create(['owner_id' => $owner->id]);
    $hotelRoom = HotelRoom::factory()->available()->create([
        'hotel_id' => $hotel->id,
        'price' => 100,
        'type' => 'DOUBLE',
        'standing' => 'STANDARD',
        'max_guests' => 4,
    ]);

    Sanctum::actingAs($customer);
    $response = $this->postJson("/api/hotels/{$hotel->id}/book", [
        'hotel_room_id' => $hotelRoom->id,
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addDays(2)->toDateString(),
        'guests' => 2,
    ])->assertCreated();
    $bookingId = $response->json('data.id');

    Sanctum::actingAs($admin);
    $this->deleteJson("/api/bookings/{$bookingId}")->assertOk();

    expect(Booking::find($bookingId))->toBeNull();
});
