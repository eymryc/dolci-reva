<?php

namespace App\Services;

use App\Repositories\NightClubAreaRepository;
use Illuminate\Database\Eloquent\Collection;

class NightClubAreaService
{
    public function __construct(protected NightClubAreaRepository $repository)
    {
    }

    public function getAll(): Collection
    {
        return $this->repository->all();
    }

    public function getByNightClubId(int $nightClubId): Collection
    {
        return $this->repository->getByNightClubId($nightClubId);
    }

    public function getById(int $id)
    {
        return $this->repository->getById($id);
    }

    public function save(array $data)
    {
        $data['is_active'] = $data['is_active'] ?? true;
        $data['reservation_required'] = $data['reservation_required'] ?? false;
        return $this->repository->save($data);
    }

    public function update(array $data, int $id)
    {
        return $this->repository->update($data, $id);
    }

    public function deleteById(int $id): bool
    {
        return $this->repository->delete($id);
    }
}
