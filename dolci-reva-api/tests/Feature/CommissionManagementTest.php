<?php

use App\Models\Commission;
use App\Models\Hotel;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

it('forbids a non-admin user from creating a commission rate', function () {
    $customer = User::factory()->create(['type' => 'CUSTOMER']);
    Sanctum::actingAs($customer);

    $this->postJson('/api/commissions', [
        'commission' => 0,
        'is_active' => true,
    ])->assertForbidden();

    expect(Commission::count())->toBe(0);
});

it('forbids an owner from listing or updating commission rates', function () {
    $owner = User::factory()->create(['type' => 'OWNER']);
    $commission = Commission::create(['commission' => 15, 'bookable_type' => null, 'is_active' => true]);

    Sanctum::actingAs($owner);

    $this->getJson('/api/commissions')->assertForbidden();
    $this->putJson("/api/commissions/{$commission->id}", ['commission' => 0])->assertForbidden();
});

it('allows an admin to create commission rates', function () {
    $admin = User::factory()->create(['type' => 'ADMIN']);
    Sanctum::actingAs($admin);

    $this->postJson('/api/commissions', [
        'commission' => 12.5,
        'is_active' => true,
    ])->assertCreated();

    expect(Commission::where('is_active', true)->count())->toBe(1);
});

it('activating a vertical-specific rate does not deactivate the global rate or other verticals', function () {
    $global = Commission::create(['commission' => 10, 'bookable_type' => null, 'is_active' => true]);
    $residence = Commission::create(['commission' => 8, 'bookable_type' => \App\Models\Residence::class, 'is_active' => true]);

    $admin = User::factory()->create(['type' => 'ADMIN']);
    Sanctum::actingAs($admin);

    // Activer un nouveau taux Hôtels ne doit désactiver ni le taux global ni celui des résidences.
    $this->postJson('/api/commissions', [
        'commission' => 20,
        'bookable_type' => Hotel::class,
        'is_active' => true,
    ])->assertCreated();

    expect($global->fresh()->is_active)->toBeTrue()
        ->and($residence->fresh()->is_active)->toBeTrue();

    // Un second taux Hôtels actif désactive bien le précédent taux Hôtels (et lui seul).
    $this->postJson('/api/commissions', [
        'commission' => 25,
        'bookable_type' => Hotel::class,
        'is_active' => true,
    ])->assertCreated();

    $hotelRates = Commission::where('bookable_type', Hotel::class)->get();
    expect($hotelRates->where('is_active', true))->toHaveCount(1)
        ->and((float) $hotelRates->firstWhere('is_active', true)->commission)->toEqual(25.0);
});
