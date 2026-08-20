<?php

namespace Database\Factories;

use App\Models\Hotel;
use App\Models\HotelRoom;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\HotelRoom>
 */
class HotelRoomFactory extends Factory
{
    protected $model = HotelRoom::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $roomTypes = ['SINGLE', 'DOUBLE', 'TWIN', 'TRIPLE', 'QUAD', 'FAMILY'];
        // Doit rester synchronisé avec l'enum réel de la colonne "standing"
        // (cf. migration create_hotel_rooms_table) : "PRESIDENTIELLE" seul
        // n'existe pas, c'est "SUITE_PRESIDENTIELLE".
        $standings = ['STANDARD', 'SUPERIEUR', 'DELUXE', 'EXECUTIVE', 'SUITE', 'SUITE_JUNIOR', 'SUITE_EXECUTIVE', 'SUITE_PRESIDENTIELLE'];

        return [
            'hotel_id' => Hotel::factory(),
            'name' => $this->faker->words(2, true) . ' Room',
            'description' => $this->faker->paragraphs(2, true),
            'room_number' => (string) $this->faker->unique()->numberBetween(100, 999),
            'type' => $this->faker->randomElement($roomTypes),
            'max_guests' => $this->faker->numberBetween(1, 6),
            'price' => $this->faker->randomFloat(2, 30, 300),
            'standing' => $this->faker->randomElement($standings),
            'is_available' => $this->faker->boolean(85),
            'is_active' => $this->faker->boolean(95),
        ];
    }

    /**
     * Indicate that the room is available.
     */
    public function available(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_available' => true,
            'is_active' => true,
        ]);
    }

    /**
     * Indicate that the room is unavailable.
     */
    public function unavailable(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_available' => false,
        ]);
    }

    /**
     * Indicate that the room is a suite.
     */
    public function suite(): static
    {
        return $this->state(fn (array $attributes) => [
            'type' => 'FAMILY',
            'standing' => 'SUITE',
            'max_guests' => 4,
            'price' => $this->faker->randomFloat(2, 200, 500),
        ]);
    }
}
