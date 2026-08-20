<?php

use App\Models\FeatureCategory;
use App\Models\FeatureOption;
use App\Models\Hotel;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function hotelUpdatePayload(string $name): array
{
    $category = FeatureCategory::create([
        'name' => 'Hotel amenities',
        'slug' => 'hotel-amenities-' . uniqid(),
        'establishment_types' => [Hotel::class],
    ]);
    $option = FeatureOption::create([
        'feature_category_id' => $category->id,
        'name' => 'Wi-Fi',
    ]);

    return [
        'name' => $name,
        'feature_option_ids' => [$option->id],
    ];
}

it('forbids an owner from updating or deleting another owner hotel', function () {
    $ownerA = User::factory()->create(['type' => 'OWNER']);
    $ownerB = User::factory()->create(['type' => 'OWNER']);
    $hotel = Hotel::factory()->for($ownerB, 'owner')->create();
    Sanctum::actingAs($ownerA);

    $this->putJson("/api/hotels/{$hotel->id}", hotelUpdatePayload('Unauthorized update'))
        ->assertForbidden();

    $this->deleteJson("/api/hotels/{$hotel->id}")
        ->assertForbidden();

    expect($hotel->fresh())->not->toBeNull()
        ->and($hotel->fresh()->name)->not->toBe('Unauthorized update');
});

it('allows an owner to update their own hotel', function () {
    $owner = User::factory()->create(['type' => 'OWNER']);
    $hotel = Hotel::factory()->for($owner, 'owner')->create();
    Sanctum::actingAs($owner);

    $this->putJson("/api/hotels/{$hotel->id}", hotelUpdatePayload('Owner updated hotel'))
        ->assertOk();

    expect($hotel->fresh()->name)->toBe('Owner updated hotel')
        ->and($hotel->fresh()->owner_id)->toBe($owner->id);
});

it('forbids a customer from creating a hotel', function () {
    $customer = User::factory()->create(['type' => 'CUSTOMER']);
    Sanctum::actingAs($customer);

    $this->postJson('/api/hotels', hotelUpdatePayload('Customer hotel'))
        ->assertForbidden();
});

it('scopes private hotel list to the authenticated owner', function () {
    $ownerA = User::factory()->create(['type' => 'OWNER']);
    $ownerB = User::factory()->create(['type' => 'OWNER']);
    $hotelA = Hotel::factory()->for($ownerA, 'owner')->create(['name' => 'Owner A Hotel']);
    Hotel::factory()->for($ownerB, 'owner')->create(['name' => 'Owner B Hotel']);
    Sanctum::actingAs($ownerA);

    $response = $this->getJson('/api/hotels')->assertOk();

    $ids = collect($response->json('data'))->pluck('id');
    expect($ids)->toContain($hotelA->id)
        ->and($ids)->toHaveCount(1);
});

it('allows an admin to see all hotels on the private list', function () {
    $ownerA = User::factory()->create(['type' => 'OWNER']);
    $ownerB = User::factory()->create(['type' => 'OWNER']);
    $admin = User::factory()->create(['type' => 'ADMIN']);
    $hotelA = Hotel::factory()->for($ownerA, 'owner')->create();
    $hotelB = Hotel::factory()->for($ownerB, 'owner')->create();
    Sanctum::actingAs($admin);

    $response = $this->getJson('/api/hotels')->assertOk();

    $ids = collect($response->json('data'))->pluck('id');
    expect($ids)->toContain($hotelA->id, $hotelB->id)
        ->and($ids)->toHaveCount(2);
});
