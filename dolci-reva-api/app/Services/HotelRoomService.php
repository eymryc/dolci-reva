<?php

namespace App\Services;

use App\Repositories\HotelRoomRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class HotelRoomService
{
    /**
     * @var HotelRoomRepository
     */
    protected HotelRoomRepository $hotelRoomRepository;

    /**
     * HotelRoomService constructor.
     *
     * @param HotelRoomRepository $hotelRoomRepository
     */
    public function __construct(HotelRoomRepository $hotelRoomRepository)
    {
        $this->hotelRoomRepository = $hotelRoomRepository;
    }

    /**
     * Get all hotel rooms.
     *
     * @return Collection
     */
    public function getAll(): Collection
    {
        return $this->hotelRoomRepository->all();
    }

    /**
     * Get all hotel rooms with pagination.
     *
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getAllWithPagination(int $perPage = 15): LengthAwarePaginator
    {
        return $this->hotelRoomRepository->paginate($perPage);
    }

    /**
     * Get hotel rooms by hotel ID.
     *
     * @param int $hotelId
     * @return Collection
     */
    public function getByHotelId(int $hotelId): Collection
    {
        return $this->hotelRoomRepository->getByHotelId($hotelId);
    }

    /**
     * Get hotel room by id.
     *
     * @param int $id
     * @return mixed
     */
    public function getById(int $id)
    {
        return $this->hotelRoomRepository->getById($id);
    }

    /**
     * Save hotel room.
     *
     * @param array $data
     * @return mixed
     */
    public function save(array $data)
    {
        return $this->hotelRoomRepository->save($data);
    }

    /**
     * Update hotel room.
     *
     * @param array $data
     * @param int $id
     * @return mixed
     */
    public function update(array $data, int $id)
    {
        return $this->hotelRoomRepository->update($data, $id);
    }

    /**
     * Delete hotel room by id.
     *
     * @param int $id
     * @return bool
     */
    public function deleteById(int $id): bool
    {
        return $this->hotelRoomRepository->deleteById($id);
    }
}
