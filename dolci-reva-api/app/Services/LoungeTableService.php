<?php

namespace App\Services;

use App\Repositories\LoungeTableRepository;
use Illuminate\Database\Eloquent\Collection;

class LoungeTableService
{
    public function __construct(protected LoungeTableRepository $repository)
    {
    }

    public function getAll(): Collection
    {
        return $this->repository->all();
    }

    public function getByLoungeId(int $loungeId): Collection
    {
        return $this->repository->getByLoungeId($loungeId);
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
        return $this->repository->delete($id);
    }
}
