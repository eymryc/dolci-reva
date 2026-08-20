<?php

namespace App\Services;

use App\Models\Lounge;
use App\Repositories\LoungeRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class LoungeService
{
    /**
     * @var LoungeRepository
     */
    protected LoungeRepository $loungeRepository;

    public function __construct(LoungeRepository $loungeRepository)
    {
        $this->loungeRepository = $loungeRepository;
    }

    /**
     * Get all lounges.
     */
    public function getAll()
    {
        return $this->loungeRepository->all();
    }

    /**
     * Get all lounges with pagination.
     */
    public function getAllWithPagination(int $perPage = 15, ?int $ownerId = null)
    {
        return $this->loungeRepository->paginate($perPage, $ownerId);
    }

    /**
     * Get lounge by id.
     */
    public function getById(int $id)
    {
        return $this->loungeRepository->getById($id);
    }

    /**
     * Create a new lounge.
     */
    public function save(array $data)
    {
        DB::beginTransaction();
        try {
            $lounge = $this->loungeRepository->save($data);
            
            DB::commit();
            return $lounge;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to create lounge: ' . $e->getMessage());
        }
    }

    /**
     * Update lounge data.
     */
    public function update(array $data, int $id)
    {
        DB::beginTransaction();
        try {
            $lounge = $this->loungeRepository->update($data, $id);
            DB::commit();
            return $lounge;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to update lounge: ' . $e->getMessage());
        }
    }

    /**
     * Delete lounge by id.
     */
    public function deleteById(int $id)
    {
        DB::beginTransaction();
        try {
            $result = $this->loungeRepository->delete($id);
            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to delete lounge: ' . $e->getMessage());
        }
    }


    /**
     * Get available lounges.
     */
    public function getAvailable()
    {
        return $this->loungeRepository->getAvailable();
    }

    /**
     * Get public lounges with optional filters.
     */
    public function getPublicAll(array $filters = [])
    {
        return $this->loungeRepository->getPublicAll($filters);
    }

    /**
     * Get available bars (venue_type=BAR).
     */
    public function getAvailableBars()
    {
        return $this->loungeRepository->getAvailableBars();
    }

    /**
     * Get public bars with optional filters.
     */
    public function getAllBarsPublic(array $filters = [])
    {
        return $this->loungeRepository->getPublicBars($filters);
    }

    /**
     * Get all bars with pagination.
     */
    public function getAllBarsWithPagination(int $perPage = 15, ?int $ownerId = null)
    {
        return $this->loungeRepository->paginateBars($perPage, $ownerId);
    }

    /**
     * Get available tables for a lounge.
     */
    public function getAvailableTables(int $loungeId, string $date, string $time, int $guests)
    {
        return $this->loungeRepository->getAvailableTables($loungeId, $date, $time, $guests);
    }

    /**
     * Get recommended tables for a lounge.
     */
    public function getRecommendedTables(int $loungeId, string $date, string $time, int $guests, string $preference = null)
    {
        return $this->loungeRepository->getRecommendedTables($loungeId, $date, $time, $guests, $preference);
    }

    /**
     * Check if lounge is open at given time.
     */
    public function isOpenAt(int $loungeId, string $date, string $time): bool
    {
        $lounge = $this->getById($loungeId);
        
        if (!$lounge) {
            return false;
        }
        
        return $lounge->isOpenAt($date, $time);
    }

    /**
     * Get time slots available for a lounge on a specific date.
     */
    public function getAvailableTimeSlots(int $loungeId, string $date, int $guests): array
    {
        $lounge = $this->getById($loungeId);
        
        if (!$lounge) {
            return [];
        }
        
        $openingHours = $lounge->opening_hours;
        $dayOfWeek = strtolower(\Carbon\Carbon::parse($date)->format('l'));
        
        if (!isset($openingHours[$dayOfWeek])) {
            return [];
        }
        
        $openTime = \Carbon\Carbon::parse($openingHours[$dayOfWeek]['open']);
        $closeTime = \Carbon\Carbon::parse($openingHours[$dayOfWeek]['close']);
        
        $timeSlots = [];
        $currentTime = $openTime->copy();
        
        // Generate 30-minute slots for lounges
        while ($currentTime->addMinutes(30)->lte($closeTime)) {
            $availableTables = $this->getAvailableTables($loungeId, $date, $currentTime->format('H:i'), $guests);
            
            if ($availableTables->isNotEmpty()) {
                $timeSlots[] = [
                    'time' => $currentTime->format('H:i'),
                    'available_tables' => $availableTables->count(),
                    'tables' => $availableTables->map(function ($table) {
                        return [
                            'id' => $table->id,
                            'table_number' => $table->table_number,
                            'capacity' => $table->capacity,
                            'location' => $table->location,
                            'table_type' => $table->table_type,
                            'reservation_required' => $table->reservation_required,
                            'minimum_spend' => $table->minimum_spend,
                            'display_name' => $table->display_name,
                            'location_description' => $table->location_description,
                            'type_description' => $table->type_description
                        ];
                    })
                ];
            }
        }
        
        return $timeSlots;
    }

}
