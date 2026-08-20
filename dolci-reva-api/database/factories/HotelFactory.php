<?php

namespace Database\Factories;

use App\Models\Hotel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Hotel>
 */
class HotelFactory extends Factory
{
    protected $model = Hotel::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'name' => $this->faker->company() . ' Hotel',
            'description' => $this->faker->paragraphs(3, true),
            'address' => $this->faker->streetAddress(),
            'city' => $this->faker->city(),
            'country' => $this->faker->country(),
            'latitude' => $this->faker->latitude(),
            'longitude' => $this->faker->longitude(),
            // La disponibilité/le prix se gèrent par chambre (HotelRoom), pas
            // sur l'hôtel lui-même : ces colonnes n'existent pas sur "hotels"
            // (cf. migration create_hotels_table).
            'star_rating' => $this->faker->numberBetween(1, 5),
            'is_active' => $this->faker->boolean(90),
        ];
    }

    /**
     * Indicate that the hotel is active.
     */
    public function active(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the hotel is inactive.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
