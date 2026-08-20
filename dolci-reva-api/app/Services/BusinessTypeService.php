<?php
namespace App\Services;

use App\Models\BusinessType;
use App\Repositories\BusinessTypeRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class BusinessTypeService
{
	/**
     * @var BusinessTypeRepository $businessTypeRepository
     */
    protected $businessTypeRepository;

    /**
     * DummyClass constructor.
     *
     * @param BusinessTypeRepository $businessTypeRepository
     */
    public function __construct(BusinessTypeRepository $businessTypeRepository)
    {
        $this->businessTypeRepository = $businessTypeRepository;
    }

    /**
     * Get all businessTypeRepository.
     *
     * @return String
     */
    public function getAll()
    {
        return $this->businessTypeRepository->all();
    }

    /**
     * Get businessTypeRepository with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\Paginator
     */
    public function getAllWithPagination(int $perPage = 15)
    {
        return $this->businessTypeRepository->paginate($perPage);
    }

    /**
     * Get businessTypeRepository by id.
     *
     * @param $id
     * @return String
     */
    public function getById(int $id)
    {
        return $this->businessTypeRepository->getById($id);
    }

    /**
     * Validate businessTypeRepository data.
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function save(array $data)
    {
        return $this->businessTypeRepository->save($data);
    }

    /**
     * Update businessTypeRepository data
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function update(array $data, int $id)
    {
        DB::beginTransaction();
        try {
            $businessTypeRepository = $this->businessTypeRepository->update($data, $id);
            DB::commit();
            return $businessTypeRepository;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to update post data');
        }
    }

    /**
     * Delete businessTypeRepository by id.
     *
     * @param $id
     * @return String
     */
    public function deleteById(int $id)
    {
        DB::beginTransaction();
        try {
            $businessTypeRepository = $this->businessTypeRepository->delete($id);
            DB::commit();
            return $businessTypeRepository;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to delete post data');
        }
    }

}
