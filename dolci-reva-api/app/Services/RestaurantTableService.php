<?php

namespace App\Services;

use App\Repositories\RestaurantTableRepository;
use Illuminate\Database\Eloquent\Collection;

class RestaurantTableService
{
    public function __construct(protected RestaurantTableRepository $repository)
    {
    }

    public function getAll(): Collection
    {
        return $this->repository->all();
    }

    public function getByRestaurantId(int $restaurantId): Collection
    {
        return $this->repository->getByRestaurantId($restaurantId);
    }

    public function getById(int $id)
    {
        return $this->repository->getById($id);
    }

    public function save(array $data)
    {
        $data['is_active'] = $data['is_active'] ?? true;
        return $this->repository->save($data);
    }

    public function update(array $data, int $id)
    {
        return $this->repository->update($data, $id);
    }

    public function deleteById(int $id): bool
    {
        return (bool) $this->repository->delete($id);
    }
}
