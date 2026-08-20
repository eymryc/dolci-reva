<?php

namespace App\Repositories;

use App\Models\Dwelling;
use Illuminate\Support\Facades\Auth;

class DwellingRepository
{
    protected Dwelling $dwelling;

    public function __construct(Dwelling $dwelling)
    {
        $this->dwelling = $dwelling;
    }

    public function all(int $perPage = 15)
    {
        return $this->dwelling->with(['owner', 'media'])->latest()->paginate($perPage);
    }

    public function paginate(int $perPage = 15)
    {
        return $this->dwelling->with(['owner', 'media'])->latest()->paginate($perPage);
    }

    public function getById(int $id)
    {
        return $this->dwelling->with(['owner', 'media'])->find($id);
    }

    public function getByOwner(int $ownerId, int $perPage = 15)
    {
        return $this->dwelling->with(['owner', 'media'])
            ->where('owner_id', $ownerId)
            ->paginate($perPage);
    }

    public function getPublic(array $filters = [], int $perPage = 15)
    {
        $query = $this->dwelling->with(['owner', 'media'])
            ->where('is_active', true);

        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('description', 'like', "%{$filters['search']}%")
                  ->orWhere('city', 'like', "%{$filters['search']}%")
                  ->orWhere('address', 'like', "%{$filters['search']}%");
            });
        }

        if (!empty($filters['city'])) {
            $query->where('city', 'like', "%{$filters['city']}%");
        }

        if (!empty($filters['type'])) {
            $query->where('type', strtoupper($filters['type']));
        }

        if (!empty($filters['structure_type'])) {
            $query->where('structure_type', strtoupper($filters['structure_type']));
        }

        if (!empty($filters['construction_type'])) {
            $query->where('construction_type', strtoupper($filters['construction_type']));
        }

        if (isset($filters['min_price']) && $filters['min_price'] !== '' && $filters['min_price'] !== null) {
            $query->where('rent', '>=', (float) $filters['min_price']);
        }

        if (isset($filters['max_price']) && $filters['max_price'] !== '' && $filters['max_price'] !== null) {
            $query->where('rent', '<=', (float) $filters['max_price']);
        }

        if (!empty($filters['min_rooms'])) {
            $query->where('rooms', '>=', (int) $filters['min_rooms']);
        }

        if (array_key_exists('is_available', $filters) && $filters['is_available'] !== null && $filters['is_available'] !== '') {
            $query->where('is_available', filter_var($filters['is_available'], FILTER_VALIDATE_BOOLEAN));
        }

        if (!empty($filters['order_price'])) {
            $query->orderBy('rent', $filters['order_price'] === 'desc' ? 'desc' : 'asc');
        } else {
            $query->latest();
        }

        return $query->paginate($perPage);
    }

    public function save(array $data): Dwelling
    {
        return $this->dwelling->create($data);
    }

    public function update(int $id, array $data): Dwelling
    {
        $dwelling = $this->dwelling->findOrFail($id);
        $dwelling->update($data);
        return $dwelling->fresh(['owner', 'media']);
    }

    public function delete(int $id): bool
    {
        $dwelling = $this->dwelling->findOrFail($id);
        return $dwelling->delete();
    }
}
