<?php

namespace App\Repositories;

use App\Models\User;
use App\Models\BusinessType;

class UserRepository
{
    /**
     * @var User
     */
    protected User $user;

    /**
     * User constructor.
     *
     * @param User $user
     */
    public function __construct(User $user)
    {
        $this->user = $user;
    }

    /**
     * Get all user.
     *
     * @return User $user
     */
    public function all()
    {
        return $this->user->latest()->get();
    }

    /**
     * Get all user with pagination.
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAllWithPagination(int $perPage = 15)
    {
        return $this->user
            ->with(['businessTypes', 'ownerVerifications'])
            ->latest()
            ->paginate($perPage);
    }

    /**
     * Get user by id
     *
     * @param $id
     * @return mixed
     */
    public function getById(int $id)
    {
        return $this->user
            ->with([
                'businessTypes',
                'wallet',
                'ownerVerifications.media',
            ])
            ->find($id);
    }

    /**
     * Save User
     *
     * @param $data
     * @return User
     */
    public function save(array $data)
    {
        // On sépare les services si présents
        $services = $data['services'] ?? [];

        // On retire les services du tableau de données utilisateur
        unset($data['services']);

        // Libère email/phone encore occupés par un user soft-deleted
        User::releaseTrashedConflicts($data);

        // Création du user
        $user = User::create($data);

        // Attacher les business types si définis et s'ils existent
        if (!empty($services)) {
            // Vérifier que les business types existent avant de les attacher
            $existingBusinessTypes = \App\Models\BusinessType::whereIn('id', $services)->pluck('id')->toArray();
            if (!empty($existingBusinessTypes)) {
                $user->businessTypes()->attach($existingBusinessTypes);
            }
        }

        // return $user;
        return $user;
    }

    /**
     * Update User
     *
     * @param $data
     * @return User
     */
    public function update(array $data, int $id)
    {
        // On sépare les services si présents
        $services = $data['services'] ?? [];

        // On retire les services du tableau de données utilisateur
        unset($data['services']);

        $user = $this->user->find($id);

        if ($user) {
            $user->update($data);

            // Attacher les business types si définis et s'ils existent
            if (!empty($services)) {
                // Vérifier que les business types existent avant de les attacher
                $existingBusinessTypes = BusinessType::whereIn('id', $services)->pluck('id')->toArray();
                if (!empty($existingBusinessTypes)) {
                    $user->businessTypes()->sync($existingBusinessTypes);
                }
            }
        }

        return $user;
    }

    /**
     * Delete User
     *
     * @param $data
     * @return User
     */
    public function delete(int $id)
    {
        $user = $this->user->find($id);
        if ($user) {
            $user->delete();
        }
        return $user;
    }
}
