<?php
namespace App\Repositories;

use App\Models\Wallet;
use Illuminate\Support\Facades\Auth;

class WalletRepository
{
	 /**
     * @var Wallet
     */
    protected Wallet $wallet;

    /**
     * Wallet constructor.
     *
     * @param Wallet $wallet
     */
    public function __construct(Wallet $wallet)
    {
        $this->wallet = $wallet;
    }

    /**
     * Get all wallet. Non-admin : uniquement le wallet de l'utilisateur
     * connecté (aucune portée n'existait avant ce correctif — n'importe quel
     * utilisateur authentifié pouvait lister le solde de tout le monde).
     *
     * @return Wallet $wallet
     */
    public function all()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->isAdmin()) {
            return $this->wallet->latest()->get();
        }

        return $this->wallet
            ->where('user_id', $user->id)
            ->where('is_platform', false)
            ->latest()
            ->get();
    }

    /**
     * Get all wallet with pagination.
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15)
    {
        return $this->wallet->latest()->paginate($perPage);
    }

     /**
     * Get wallet by id
     *
     * @param $id
     * @return mixed
     */
    public function getById(int $id)
    {
        return $this->wallet->find($id);
    }

    /**
     * Save Wallet
     *
     * @param $data
     * @return Wallet
     */
     public function save(array $data)
    {
        return Wallet::create($data);
    }

     /**
     * Update Wallet
     *
     * @param $data
     * @return Wallet
     */
    public function update(array $data, int $id)
    {
        $wallet = $this->wallet->find($id);
        $wallet->update($data);
        return $wallet;
    }

    /**
     * Delete Wallet
     *
     * @param $data
     * @return Wallet
     */
   	 public function delete(int $id)
    {
        $wallet = $this->wallet->find($id);
        $wallet->delete();
        return $wallet;
    }
}
