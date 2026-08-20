<?php

namespace App\Services;

use App\Models\NightClub;
use App\Repositories\NightClubRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class NightClubService
{
    /**
     * @var NightClubRepository
     */
    protected NightClubRepository $nightClubRepository;

    public function __construct(NightClubRepository $nightClubRepository)
    {
        $this->nightClubRepository = $nightClubRepository;
    }

    /**
     * Get all night clubs.
     */
    public function getAll()
    {
        return $this->nightClubRepository->all();
    }

    /**
     * Get all night clubs with pagination.
     */
    public function getAllWithPagination(int $perPage = 15, ?int $ownerId = null)
    {
        return $this->nightClubRepository->paginate($perPage, $ownerId);
    }

    /**
     * Get night club by id.
     */
    public function getById(int $id)
    {
        return $this->nightClubRepository->getById($id);
    }

    /**
     * Create a new night club.
     */
    public function save(array $data)
    {
        DB::beginTransaction();
        try {
            $nightClub = $this->nightClubRepository->save($data);
            
            DB::commit();
            return $nightClub;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to create night club: ' . $e->getMessage());
        }
    }

    /**
     * Update night club data.
     */
    public function update(array $data, int $id)
    {
        DB::beginTransaction();
        try {
            $nightClub = $this->nightClubRepository->update($data, $id);
            DB::commit();
            return $nightClub;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to update night club: ' . $e->getMessage());
        }
    }

    /**
     * Delete night club by id.
     */
    public function deleteById(int $id)
    {
        DB::beginTransaction();
        try {
            $result = $this->nightClubRepository->delete($id);
            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to delete night club: ' . $e->getMessage());
        }
    }


    /**
     * Get available night clubs with optional public filters.
     *
     * @param  array{search?: string, city?: string}  $filters
     */
    public function getAvailable(array $filters = [])
    {
        return $this->nightClubRepository->getAvailable($filters);
    }

    /**
     * Get available areas for a night club.
     */
    public function getAvailableAreas(int $nightClubId, string $date, string $time, int $guests)
    {
        return $this->nightClubRepository->getAvailableAreas($nightClubId, $date, $time, $guests);
    }

    /**
     * Get recommended areas for a night club.
     */
    public function getRecommendedAreas(int $nightClubId, string $date, string $time, int $guests, string $preference = null)
    {
        return $this->nightClubRepository->getRecommendedAreas($nightClubId, $date, $time, $guests, $preference);
    }

    /**
     * Check if night club is open at given time.
     */
    public function isOpenAt(int $nightClubId, string $date, string $time): bool
    {
        $nightClub = $this->getById($nightClubId);
        
        if (!$nightClub) {
            return false;
        }
        
        return $nightClub->isOpenAt($date, $time);
    }

    /**
     * Get time slots available for a night club on a specific date.
     */
    public function getAvailableTimeSlots(int $nightClubId, string $date, int $guests): array
    {
        $nightClub = $this->getById($nightClubId);
        
        if (!$nightClub) {
            return [];
        }
        
        $openingHours = $nightClub->opening_hours;
        $dayOfWeek = strtolower(\Carbon\Carbon::parse($date)->format('l'));
        
        if (!isset($openingHours[$dayOfWeek])) {
            return [];
        }
        
        $openTime = \Carbon\Carbon::parse($openingHours[$dayOfWeek]['open']);
        $closeTime = \Carbon\Carbon::parse($openingHours[$dayOfWeek]['close']);
        
        $timeSlots = [];
        $currentTime = $openTime->copy();
        
        // Generate 30-minute slots for night clubs
        while ($currentTime->addMinutes(30)->lte($closeTime)) {
            $availableAreas = $this->getAvailableAreas($nightClubId, $date, $currentTime->format('H:i'), $guests);
            
            if ($availableAreas->isNotEmpty()) {
                $timeSlots[] = [
                    'time' => $currentTime->format('H:i'),
                    'available_areas' => $availableAreas->count(),
                    'areas' => $availableAreas->map(function ($area) {
                        return [
                            'id' => $area->id,
                            'area_name' => $area->area_name,
                            'capacity' => $area->capacity,
                            'location' => $area->location,
                            'area_type' => $area->area_type,
                            'minimum_spend' => $area->minimum_spend,
                            'table_fee' => $area->table_fee,
                            'reservation_required' => $area->reservation_required,
                            'display_name' => $area->display_name,
                            'location_description' => $area->location_description,
                            'type_description' => $area->type_description,
                            'minimum_spend_formatted' => $area->minimum_spend_formatted,
                            'table_fee_formatted' => $area->table_fee_formatted,
                            'total_cost_formatted' => $area->total_cost_formatted
                        ];
                    })
                ];
            }
        }
        
        return $timeSlots;
    }


    /**
     * Get night clubs by age restriction.
     */
    public function getByAgeRestriction(int $ageRestriction)
    {
        return $this->nightClubRepository->search(['age_restriction' => $ageRestriction]);
    }

}
