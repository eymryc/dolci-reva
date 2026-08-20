<?php

use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Laravel\Sanctum\Sanctum;

function userPayload(array $overrides = []): array
{
    return array_merge([
        'first_name' => 'Jane',
        'last_name' => 'Doe',
        'phone' => '+2250102030405',
        'email' => 'jane@example.com',
        'type' => 'CUSTOMER',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ], $overrides);
}

it('rejects privileged roles during public registration', function (string $type) {
    Notification::fake();

    $this->postJson('/api/auth/register', userPayload(['type' => $type]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('type', 'data');

    expect(User::where('email', 'jane@example.com')->exists())->toBeFalse();
})->with(['ADMIN', 'SUPER_ADMIN']);

it('does not accept verification or remember token fields during registration', function () {
    Notification::fake();

    $this->postJson('/api/auth/register', userPayload([
        'email_verified_at' => now()->toISOString(),
        'remember_token' => 'client-controlled-token',
    ]))->assertCreated();

    $user = User::where('email', 'jane@example.com')->firstOrFail();

    expect($user->email_verified_at)->toBeNull()
        ->and($user->getRememberToken())->not->toBe('client-controlled-token')
        ->and($user->type)->toBe('CUSTOMER');
});

it('forbids non-admin users from user management routes', function () {
    $customer = User::factory()->create(['type' => 'CUSTOMER']);
    Sanctum::actingAs($customer);

    $this->getJson('/api/users')->assertForbidden();
    $this->putJson("/api/users/{$customer->id}", ['type' => 'ADMIN'])->assertForbidden();
    $this->deleteJson("/api/users/{$customer->id}")->assertForbidden();
});

it('allows admins to create and promote users to admin', function () {
    Notification::fake();

    $admin = User::factory()->create(['type' => 'ADMIN']);
    $customer = User::factory()->create(['type' => 'CUSTOMER']);
    Sanctum::actingAs($admin);

    $this->postJson('/api/users', userPayload([
        'phone' => '+2250506070809',
        'email' => 'new-admin@example.com',
        'type' => 'ADMIN',
    ]))->assertCreated();

    $this->putJson("/api/users/{$customer->id}", [
        'type' => 'ADMIN',
    ])->assertOk();

    expect(User::where('email', 'new-admin@example.com')->value('type'))->toBe('ADMIN')
        ->and($customer->fresh()->type)->toBe('ADMIN');
});
