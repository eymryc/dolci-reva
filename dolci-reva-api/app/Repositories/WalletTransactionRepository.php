<?php
namespace App\Repositories;

use App\Models\WalletTransaction;
use Illuminate\Support\Facades\Auth;

class WalletTransactionRepository
{
	 /**
     * @var WalletTransaction
     */
    protected WalletTransaction $walletTransaction;

    /**
     * WalletTransaction constructor.
     *
     * @param WalletTransaction $walletTransaction
     */
    public function __construct(WalletTransaction $walletTransaction)
    {
        $this->walletTransaction = $walletTransaction;
    }

    /**
     * Get all walletTransaction. Non-admin : uniquement les transactions du
     * wallet de l'utilisateur connecté (aucune portée n'existait avant ce
     * correctif — n'importe quel utilisateur authentifié pouvait lister les
     * transactions financières de tout le monde).
     *
     * @return WalletTransaction $walletTransaction
     */
    public function all()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->isAdmin()) {
            return $this->walletTransaction->latest()->get();
        }

        return $this->walletTransaction
            ->whereHas('wallet', fn ($q) => $q->where('user_id', $user->id))
            ->latest()
            ->get();
    }

    /**
     * Get all walletTransaction with pagination.
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15)
    {
        return $this->walletTransaction->latest()->paginate($perPage);
    }

     /**
     * Get walletTransaction by id
     *
     * @param $id
     * @return mixed
     */
    public function getById(int $id)
    {
        return $this->walletTransaction->find($id);
    }

    /**
     * Save WalletTransaction
     *
     * @param $data
     * @return WalletTransaction
     */
     public function save(array $data)
    {   

        return WalletTransaction::create($data);
    }

     /**
     * Update WalletTransaction
     *
     * @param $data
     * @return WalletTransaction
     */
    public function update(array $data, int $id)
    {
        $walletTransaction = $this->walletTransaction->find($id);
        $walletTransaction->update($data);
        return $walletTransaction;
    }

    /**
     * Delete WalletTransaction
     *
     * @param $data
     * @return WalletTransaction
     */
   	 public function delete(int $id)
    {
        $walletTransaction = $this->walletTransaction->find($id);
        $walletTransaction->delete();
        return $walletTransaction;
    }
}
