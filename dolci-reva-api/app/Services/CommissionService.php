<?php
namespace App\Services;

use App\Models\Commission;
use App\Repositories\CommissionRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class CommissionService
{
	/**
     * @var CommissionRepository $commissionRepository
     */
    protected $commissionRepository;

    /**
     * DummyClass constructor.
     *
     * @param CommissionRepository $commissionRepository
     */
    public function __construct(CommissionRepository $commissionRepository)
    {
        $this->commissionRepository = $commissionRepository;
    }

    /**
     * Get all commissionRepository.
     *
     * @return String
     */
    public function getAll()
    {
        return $this->commissionRepository->all();
    }

    /**
     * Get commissionRepository with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\Paginator
     */
    public function getAllWithPagination(int $perPage = 15)
    {
        return $this->commissionRepository->paginate($perPage);
    }

    /**
     * Get commissionRepository by id.
     *
     * @param $id
     * @return String
     */
    public function getById(int $id)
    {
        return $this->commissionRepository->getById($id);
    }

    /**
     * Validate commissionRepository data.
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function save(array $data)
    {
        return $this->commissionRepository->save($data);
    }

    /**
     * Update commissionRepository data
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function update(array $data, int $id)
    {
        DB::beginTransaction();
        try {
            $commissionRepository = $this->commissionRepository->update($data, $id);
            DB::commit();
            return $commissionRepository;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to update post data');
        }
    }

    /**
     * Delete commissionRepository by id.
     *
     * @param $id
     * @return String
     */
    public function deleteById(int $id)
    {
        DB::beginTransaction();
        try {
            $commissionRepository = $this->commissionRepository->delete($id);
            DB::commit();
            return $commissionRepository;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to delete post data');
        }
    }


    /**
     * Get the currently active commission rate for a given verticale,
     * avec repli sur le taux global si aucun taux spécifique n'est actif.
     *
     * @param string|null $bookableType
     * @return Commission|null
     */
    public function getLastCommission(?string $bookableType = null)
    {
        return $this->commissionRepository->getLastCommission($bookableType);
    }

}
