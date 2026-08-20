<?php

namespace App\Services;

use App\Models\Hotel;
use App\Repositories\HotelRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class HotelService
{
    /**
     * @var HotelRepository
     */
    protected $hotelRepository;

    public function __construct(HotelRepository $hotelRepository)
    {
        $this->hotelRepository = $hotelRepository;
    }

    /**
     * Get all hotels.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAll(int $perPage = 15)
    {
        return $this->hotelRepository->all($perPage);
    }

    /**
     * Get all hotels with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAllWithPagination(int $perPage = 15, ?int $ownerId = null)
    {
        return $this->hotelRepository->paginate($perPage, $ownerId);
    }

    /**
     * Get hotel by id.
     *
     * @param int $id
     * @return Hotel|null
     */
    public function getById(int $id)
    {
        return $this->hotelRepository->getById($id);
    }

    /**
     * Save hotel.
     *
     * @param array $data
     * @return Hotel
     */
    public function save(array $data)
    {
        // Ajouter l'owner_id depuis l'utilisateur authentifié
        $data['owner_id'] = Auth::id();

        return $this->hotelRepository->save($data);
    }

    /**
     * Update hotel.
     *
     * @param array $data
     * @param int $id
     * @return Hotel|null
     */
    public function update(array $data, int $id)
    {
        return $this->hotelRepository->update($data, $id);
    }

    /**
     * Delete hotel by id.
     *
     * @param int $id
     * @return bool
     */
    public function deleteById(int $id)
    {
        return $this->hotelRepository->deleteById($id);
    }

    /**
     * Get hotels by owner.
     *
     * @param int $ownerId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByOwner(int $ownerId)
    {
        return $this->hotelRepository->getByOwner($ownerId);
    }

    /**
     * Get available hotels with optional public filters.
     *
     * @param  array{search?: string, city?: string}  $filters
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAvailable(array $filters = [])
    {
        return $this->hotelRepository->getAvailable($filters);
    }

    /**
     * Search hotels by criteria.
     *
     * @param array $criteria
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function search(array $criteria)
    {
        return $this->hotelRepository->search($criteria);
    }
}
