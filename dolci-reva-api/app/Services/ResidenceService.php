<?php

namespace App\Services;

use Illuminate\Http\Request;
use App\Repositories\ResidenceRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ResidenceService
{
    /**
     * @var ResidenceRepository
     */
    protected ResidenceRepository $residenceRepository;

    /**
     * ResidenceService constructor.
     *
     * @param ResidenceRepository $residenceRepository
     */
    public function __construct(ResidenceRepository $residenceRepository)
    {
        $this->residenceRepository = $residenceRepository;
    }

    /**
     * Get all residences.
     *
     * @return Collection
     */
    public function getAll(int $perPage = 15): Collection
    {
        return $this->residenceRepository->all($perPage);
    }

    /**
     * Get all residences with pagination.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllWithPagination(int $perPage = 15, ?int $ownerId = null): LengthAwarePaginator
    {
        return $this->residenceRepository->paginate($perPage, $ownerId);
    }

    /**
     * Get available residences.
     *
     * @param Request $request
     * @return LengthAwarePaginator
     */
    public function getAvailable(Request $request): LengthAwarePaginator
    {
        return $this->residenceRepository->getAvailable($request);
    }

    /**
     * Get residence by id.
     *
     * @param int $id
     * @return mixed
     */
    public function getById(int $id)
    {
        return $this->residenceRepository->getById($id);
    }

    /**
     * Save residence.
     *
     * @param array $data
     * @return mixed
     */
    public function save(array $data)
    {
        return $this->residenceRepository->save($data);
    }

    /**
     * Update residence.
     *
     * @param array $data
     * @param int $id
     * @return mixed
     */
    public function update(array $data, int $id)
    {
        return $this->residenceRepository->update($data, $id);
    }

    /**
     * Delete residence by id.
     *
     * @param int $id
     * @return bool
     */
    public function deleteById(int $id): bool
    {
        return $this->residenceRepository->deleteById($id);
    }
}
