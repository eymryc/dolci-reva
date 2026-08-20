<?php
namespace App\Services;

use App\Models\Withdrawal;
use App\Repositories\WithdrawalRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class WithdrawalService
{
	/**
     * @var WithdrawalRepository $withdrawalRepository
     */
    protected $withdrawalRepository;

    /**
     * DummyClass constructor.
     *
     * @param WithdrawalRepository $withdrawalRepository
     */
    public function __construct(WithdrawalRepository $withdrawalRepository)
    {
        $this->withdrawalRepository = $withdrawalRepository;
    }

    /**
     * Get all withdrawalRepository.
     *
     * @return String
     */
    public function getAll()
    {
        return $this->withdrawalRepository->all();
    }

    /**
     * Get withdrawalRepository with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\Paginator
     */
    public function getAllWithPagination(int $perPage = 15)
    {
        return $this->withdrawalRepository->paginate($perPage);
    }

    /**
     * Get withdrawalRepository by id.
     *
     * @param $id
     * @return String
     */
    public function getById(int $id)
    {
        return $this->withdrawalRepository->getById($id);
    }

    /**
     * Validate withdrawalRepository data.
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function save(array $data)
    {
        return $this->withdrawalRepository->save($data);
    }

    /**
     * Update withdrawalRepository data
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function update(array $data, int $id)
    {
        DB::beginTransaction();
        try {
            $withdrawalRepository = $this->withdrawalRepository->update($data, $id);
            DB::commit();
            return $withdrawalRepository;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to update post data');
        }
    }

    /**
     * Delete withdrawalRepository by id.
     *
     * @param $id
     * @return String
     */
    public function deleteById(int $id)
    {
        DB::beginTransaction();
        try {
            $withdrawalRepository = $this->withdrawalRepository->delete($id);
            DB::commit();
            return $withdrawalRepository;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to delete post data');
        }
    }

    /**
     * Approuver une demande de retrait.
     */
    public function approve(int $id, int $reviewerId)
    {
        DB::beginTransaction();
        try {
            $withdrawal = $this->withdrawalRepository->approve($id, $reviewerId);
            DB::commit();
            return $withdrawal;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException($e->getMessage());
        }
    }

    /**
     * Approbation manuelle forcée (sans transfert Paystack).
     */
    public function approveManual(int $id, int $reviewerId)
    {
        DB::beginTransaction();
        try {
            $withdrawal = $this->withdrawalRepository->approveManual($id, $reviewerId);
            DB::commit();
            return $withdrawal;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException($e->getMessage());
        }
    }

    /**
     * Rejeter une demande de retrait (recrédite le wallet).
     */
    public function reject(int $id, int $reviewerId)
    {
        DB::beginTransaction();
        try {
            $withdrawal = $this->withdrawalRepository->reject($id, $reviewerId);
            DB::commit();
            return $withdrawal;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException($e->getMessage());
        }
    }

}
