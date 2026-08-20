<?php
namespace App\Services;

use App\Models\WalletTransaction;
use App\Repositories\WalletTransactionRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class WalletTransactionService
{
	/**
     * @var WalletTransactionRepository $walletTransactionRepository
     */
    protected $walletTransactionRepository;

    /**
     * DummyClass constructor.
     *
     * @param WalletTransactionRepository $walletTransactionRepository
     */
    public function __construct(WalletTransactionRepository $walletTransactionRepository)
    {
        $this->walletTransactionRepository = $walletTransactionRepository;
    }

    /**
     * Get all walletTransactionRepository.
     *
     * @return String
     */
    public function getAll()
    {
        return $this->walletTransactionRepository->all();
    }

    /**
     * Get walletTransactionRepository with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\Paginator
     */
    public function getAllWithPagination(int $perPage = 15)
    {
        return $this->walletTransactionRepository->paginate($perPage);
    }

    /**
     * Get walletTransactionRepository by id.
     *
     * @param $id
     * @return String
     */
    public function getById(int $id)
    {
        return $this->walletTransactionRepository->getById($id);
    }

    /**
     * Validate walletTransactionRepository data.
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function save(array $data)
    {
        return $this->walletTransactionRepository->save($data);
    }

    /**
     * Update walletTransactionRepository data
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function update(array $data, int $id)
    {
        DB::beginTransaction();
        try {
            $walletTransactionRepository = $this->walletTransactionRepository->update($data, $id);
            DB::commit();
            return $walletTransactionRepository;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to update post data');
        }
    }

    /**
     * Delete walletTransactionRepository by id.
     *
     * @param $id
     * @return String
     */
    public function deleteById(int $id)
    {
        DB::beginTransaction();
        try {
            $walletTransactionRepository = $this->walletTransactionRepository->delete($id);
            DB::commit();
            return $walletTransactionRepository;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to delete post data');
        }
    }

}
