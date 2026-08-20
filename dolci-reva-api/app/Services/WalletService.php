<?php
namespace App\Services;

use App\Models\Wallet;
use App\Repositories\WalletRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class WalletService
{
	/**
     * @var WalletRepository $walletRepository
     */
    protected $walletRepository;

    /**
     * DummyClass constructor.
     *
     * @param WalletRepository $walletRepository
     */
    public function __construct(WalletRepository $walletRepository)
    {
        $this->walletRepository = $walletRepository;
    }

    /**
     * Get all walletRepository.
     *
     * @return String
     */
    public function getAll()
    {
        return $this->walletRepository->all();
    }

    /**
     * Get walletRepository with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\Paginator
     */
    public function getAllWithPagination(int $perPage = 15)
    {
        return $this->walletRepository->paginate($perPage);
    }

    /**
     * Get walletRepository by id.
     *
     * @param $id
     * @return String
     */
    public function getById(int $id)
    {
        return $this->walletRepository->getById($id);
    }

    /**
     * Validate walletRepository data.
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function save(array $data)
    {
        return $this->walletRepository->save($data);
    }

    /**
     * Update walletRepository data
     * Store to DB if there are no errors.
     *
     * @param array $data
     * @return String
     */
    public function update(array $data, int $id)
    {
        DB::beginTransaction();
        try {
            $walletRepository = $this->walletRepository->update($data, $id);
            DB::commit();
            return $walletRepository;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to update post data');
        }
    }

    /**
     * Delete walletRepository by id.
     *
     * @param $id
     * @return String
     */
    public function deleteById(int $id)
    {
        DB::beginTransaction();
        try {
            $walletRepository = $this->walletRepository->delete($id);
            DB::commit();
            return $walletRepository;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to delete post data');
        }
    }

}
