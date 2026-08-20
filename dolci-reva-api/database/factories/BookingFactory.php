<?php

namespace Database\Factories;

use App\Models\User;
use App\Models\Property;
use Illuminate\Database\Eloquent\Factories\Factory;
use Carbon\Carbon;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $startDate = $this->faker->dateTimeBetween('+1 day', '+30 days');
        $endDate = Carbon::parse($startDate)->addDays($this->faker->numberBetween(1, 7));
        $totalPrice = $this->faker->randomFloat(2, 50, 1000);
        
        return [
            'customer_id' => User::factory(),
            'owner_id' => User::factory(),
            'bookable_type' => 'Property',
            'bookable_id' => Property::factory(),
            'start_date' => $startDate,
            'end_date' => $endDate,
            'total_price' => $totalPrice,
            'commission_amount' => $totalPrice * 0.1,
            'owner_amount' => $totalPrice * 0.9,
            'status' => $this->faker->randomElement(['CONFIRME', 'ANNULE', 'EN_ATTENTE']),
            'payment_status' => $this->faker->randomElement(['PAYE', 'REMBOURSE', 'EN_ATTENTE']),
            'notes' => $this->faker->optional()->sentence(),
            'cancellation_reason' => $this->faker->optional()->sentence(),
        ];
    }
    
    /**
     * Indicate that the booking is confirmed.
     */
    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'CONFIRME',
            'payment_status' => 'PAYE',
        ]);
    }
    
    /**
     * Indicate that the booking is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'EN_ATTENTE',
            'payment_status' => 'EN_ATTENTE',
        ]);
    }
    
    /**
     * Indicate that the booking is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'ANNULE',
            'cancellation_reason' => $this->faker->sentence(),
        ]);
    }
}