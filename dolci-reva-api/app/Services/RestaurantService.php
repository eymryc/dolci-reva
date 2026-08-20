<?php

namespace App\Services;

use App\Models\Restaurant;
use App\Repositories\RestaurantRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class RestaurantService
{
    /**
     * @var RestaurantRepository
     */
    protected RestaurantRepository $restaurantRepository;

    public function __construct(RestaurantRepository $restaurantRepository)
    {
        $this->restaurantRepository = $restaurantRepository;
    }

    /**
     * Get all restaurants.
     */
    public function getAll()
    {
        return $this->restaurantRepository->all();
    }

    /**
     * Get all restaurants with pagination.
     */
    public function getAllWithPagination(int $perPage = 15, ?int $ownerId = null)
    {
        return $this->restaurantRepository->paginate($perPage, $ownerId);
    }

    /**
     * Get restaurant by id.
     */
    public function getById(int $id)
    {
        return $this->restaurantRepository->getById($id);
    }

    /**
     * Create a new restaurant.
     */
    public function save(array $data)
    {
        DB::beginTransaction();
        try {
            $restaurant = $this->restaurantRepository->save($data);
            
            DB::commit();
            return $restaurant;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to create restaurant: ' . $e->getMessage());
        }
    }

    /**
     * Update restaurant data.
     */
    public function update(array $data, int $id)
    {
        DB::beginTransaction();
        try {
            $restaurant = $this->restaurantRepository->update($data, $id);
            DB::commit();
            return $restaurant;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to update restaurant: ' . $e->getMessage());
        }
    }

    /**
     * Delete restaurant by id.
     */
    public function deleteById(int $id)
    {
        DB::beginTransaction();
        try {
            $result = $this->restaurantRepository->delete($id);
            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to delete restaurant: ' . $e->getMessage());
        }
    }


    /**
     * Get available restaurants with optional public filters.
     *
     * @param  array{search?: string, city?: string}  $filters
     */
    public function getAvailable(array $filters = [])
    {
        return $this->restaurantRepository->getAvailable($filters);
    }

    /**
     * Get available tables for a restaurant.
     */
    public function getAvailableTables(int $restaurantId, string $date, string $time, int $guests)
    {
        return $this->restaurantRepository->getAvailableTables($restaurantId, $date, $time, $guests);
    }


    /**
     * Check if restaurant is open at given time.
     */
    public function isOpenAt(int $restaurantId, string $date, string $time): bool
    {
        $restaurant = $this->getById($restaurantId);
        
        if (!$restaurant) {
            return false;
        }
        
        return $restaurant->isOpenAt($date, $time);
    }

    /**
     * Get time slots available for a restaurant on a specific date.
     */
    public function getAvailableTimeSlots(int $restaurantId, string $date, int $guests): array
    {
        $restaurant = $this->getById($restaurantId);
        
        if (!$restaurant) {
            return [];
        }
        
        $openingHours = $restaurant->opening_hours;
        $dayOfWeek = strtolower(\Carbon\Carbon::parse($date)->format('l'));
        
        if (!isset($openingHours[$dayOfWeek])) {
            return [];
        }
        
        $openTime = \Carbon\Carbon::parse($openingHours[$dayOfWeek]['open']);
        $closeTime = \Carbon\Carbon::parse($openingHours[$dayOfWeek]['close']);
        
        $timeSlots = [];
        $currentTime = $openTime->copy();
        
        // Generate 30-minute slots
        while ($currentTime->addMinutes(30)->lte($closeTime)) {
            $availableTables = $this->getAvailableTables($restaurantId, $date, $currentTime->format('H:i'), $guests);
            
            if ($availableTables->isNotEmpty()) {
                $timeSlots[] = [
                    'time' => $currentTime->format('H:i'),
                    'available_tables' => $availableTables->count(),
                    'tables' => $availableTables->map(function ($table) {
                        return [
                            'id' => $table->id,
                            'table_number' => $table->table_number,
                            'capacity' => $table->capacity,
                            'location' => $table->location
                        ];
                    })
                ];
            }
        }
        
        return $timeSlots;
    }
}
