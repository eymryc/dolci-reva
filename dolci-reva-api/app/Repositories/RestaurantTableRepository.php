<?php

namespace App\Repositories;

use App\Models\RestaurantTable;
use Illuminate\Database\Eloquent\Collection;

class RestaurantTableRepository
{
    /**
     * @var RestaurantTable
     */
    protected RestaurantTable $restaurantTable;

    public function __construct(RestaurantTable $restaurantTable)
    {
        $this->restaurantTable = $restaurantTable;
    }

    /**
     * Get all restaurant tables.
     */
    public function all()
    {
        return $this->restaurantTable->with(['restaurant', 'bookings'])->latest()->get();
    }

    /**
     * Get all restaurant tables with pagination.
     */
    public function paginate(int $perPage = 15)
    {
        return $this->restaurantTable->with(['restaurant', 'bookings'])->latest()->paginate($perPage);
    }

    /**
     * Get restaurant table by id.
     */
    public function getById(int $id)
    {
        return $this->restaurantTable->with(['restaurant', 'bookings'])->find($id);
    }

    /**
     * Get tables by restaurant ID.
     */
    public function getByRestaurantId(int $restaurantId)
    {
        return $this->restaurantTable->where('restaurant_id', $restaurantId)
            ->with(['restaurant', 'bookings'])
            ->get();
    }

    /**
     * Save restaurant table.
     */
    public function save(array $data)
    {
        return RestaurantTable::create($data);
    }

    /**
     * Update restaurant table.
     */
    public function update(array $data, int $id)
    {
        $table = $this->restaurantTable->find($id);
        
        if (!$table) {
            return null;
        }
        
        $table->update($data);
        return $table->load('restaurant', 'bookings');
    }

    /**
     * Delete restaurant table by id.
     */
    public function delete(int $id)
    {
        $table = $this->restaurantTable->find($id);
        
        if ($table) {
            return $table->delete();
        }
        
        return false;
    }

    /**
     * Get available tables for a restaurant on a specific date and time.
     */
    public function getAvailableTables(int $restaurantId, string $date, string $time, int $guests): Collection
    {
        return $this->restaurantTable
            ->where('restaurant_id', $restaurantId)
            ->where('is_active', true)
            ->where('capacity', '>=', $guests)
            ->whereDoesntHave('bookings', function ($query) use ($date, $time) {
                $query->where('start_date', $date)
                    ->where('status', '!=', 'CANCELLED');
            })
            ->with(['restaurant'])
            ->get();
    }

    /**
     * Check if a table is available for a specific date and time.
     */
    public function isTableAvailable(int $tableId, string $date, string $time, int $guests): bool
    {
        $table = $this->getById($tableId);
        
        if (!$table) {
            return false;
        }
        
        return $table->isAvailableFor($date, $time, $guests);
    }

    /**
     * Get tables by capacity range.
     */
    public function getByCapacityRange(int $restaurantId, int $minCapacity, int $maxCapacity = null)
    {
        $query = $this->restaurantTable
            ->where('restaurant_id', $restaurantId)
            ->where('is_active', true)
            ->where('capacity', '>=', $minCapacity);
            
        if ($maxCapacity) {
            $query->where('capacity', '<=', $maxCapacity);
        }
        
        return $query->with(['restaurant'])->get();
    }

    /**
     * Get tables by location.
     */
    public function getByLocation(int $restaurantId, string $location)
    {
        return $this->restaurantTable
            ->where('restaurant_id', $restaurantId)
            ->where('location', $location)
            ->where('is_active', true)
            ->with(['restaurant'])
            ->get();
    }

    /**
     * Get tables by type.
     */
    public function getByType(int $restaurantId, string $type)
    {
        return $this->restaurantTable
            ->where('restaurant_id', $restaurantId)
            ->where('table_type', $type)
            ->where('is_active', true)
            ->with(['restaurant'])
            ->get();
    }

    /**
     * Create multiple tables for a restaurant.
     */
    public function createMultiple(array $tablesData): Collection
    {
        $tables = collect();
        
        foreach ($tablesData as $tableData) {
            $table = $this->save($tableData);
            $tables->push($table);
        }
        
        return $tables;
    }

    /**
     * Get table statistics for a restaurant.
     */
    public function getTableStatistics(int $restaurantId): array
    {
        $tables = $this->getByRestaurantId($restaurantId);
        
        return [
            'total_tables' => $tables->count(),
            'active_tables' => $tables->where('is_active', true)->count(),
            'total_capacity' => $tables->sum('capacity'),
            'average_capacity' => $tables->avg('capacity'),
            'by_type' => $tables->groupBy('table_type')->map->count(),
            'by_location' => $tables->groupBy('location')->map->count()
        ];
    }
}
