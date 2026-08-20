<?php
namespace App\Services;

use App\Models\Opinion;
use App\Repositories\OpinionRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class OpinionService
{
	/**
     * @var OpinionRepository $opinionRepository
     */
    protected $opinionRepository;

    /**
     * OpinionService constructor.
     *
     * @param OpinionRepository $opinionRepository
     */
    public function __construct(OpinionRepository $opinionRepository)
    {
        $this->opinionRepository = $opinionRepository;
    }

    /**
     * Get all opinions.
     *
     * @return String
     */
    public function getAll()
    {
        return $this->opinionRepository->all();
    }

    /**
     * Get opinions with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\Paginator
     */
    public function getAllWithPagination(int $perPage = 15)
    {
        return $this->opinionRepository->paginate($perPage);
    }

    /**
     * Get opinion by id.
     *
     * @param $id
     * @return String
     */
    public function getById(int $id)
    {
        return $this->opinionRepository->getById($id);
    }


    public function getOpinionById(int $id)
    {
        return $this->opinionRepository->getAllOpinionsById($id);
    }

    /**
     * Validate opinion data.
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function save(array $data)
    {
        return $this->opinionRepository->save($data);
    }

    /**
     * Update opinion data
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function update(array $data, int $id)
    {
        DB::beginTransaction();
        try {
            $opinion = $this->opinionRepository->update($data, $id);
            DB::commit();
            return $opinion;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to update opinion data');
        }
    }

    /**
     * Delete opinion by id.
     *
     * @param $id
     * @return String
     */
    public function deleteById(int $id)
    {
        DB::beginTransaction();
        try {
            $opinion = $this->opinionRepository->delete($id);
            DB::commit();
            return $opinion;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to delete opinion data');
        }
    }

}

