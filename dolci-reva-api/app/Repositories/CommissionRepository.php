<?php

namespace App\Repositories;

use App\Models\Commission;

class CommissionRepository
{
    /**
     * @var Commission
     */
    protected Commission $commission;

    /**
     * Commission constructor.
     *
     * @param Commission $commission
     */
    public function __construct(Commission $commission)
    {
        $this->commission = $commission;
    }

    /**
     * Get all commission.
     *
     * @return Commission $commission
     */
    public function all()
    {
        return $this->commission->latest()->get();
    }
    
    /**
     * Get all commission with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15)
    {
        return $this->commission->latest()->paginate($perPage);
    }

    /**
     * Get commission by id
     *
     * @param $id
     * @return mixed
     */
    public function getById(int $id)
    {
        return $this->commission->find($id);
    }

    /**
     * Save Commission
     *
     * @param $data
     * @return Commission
     */
    public function save(array $data)
    {
        // Si la nouvelle commission est active, désactiver les autres taux
        // actifs de la même verticale seulement (une activation sur "Hôtels"
        // ne doit pas désactiver le taux "Résidences" ni le taux global).
        if (isset($data['is_active']) && $data['is_active'] === true) {
            $this->deactivateOthersForType($data['bookable_type'] ?? null);
        }

        return Commission::create($data);
    }

    /**
     * Update Commission
     *
     * @param $data
     * @return Commission
     */
    public function update(array $data, int $id)
    {
        $commission = $this->commission->find($id);

        // Si cette commission est activée, désactiver les autres taux actifs
        // de la même verticale (celle envoyée dans $data, sinon celle déjà
        // enregistrée si le type n'est pas modifié dans cette mise à jour).
        if (isset($data['is_active']) && $data['is_active'] === true) {
            $type = array_key_exists('bookable_type', $data) ? $data['bookable_type'] : $commission->bookable_type;
            $this->deactivateOthersForType($type, $id);
        }

        $commission->update($data);
        return $commission;
    }

    /**
     * Désactive les autres taux actifs et non supprimés pour une verticale
     * donnée ($bookableType = null pour le taux global de repli).
     */
    private function deactivateOthersForType(?string $bookableType, ?int $excludeId = null): void
    {
        $query = Commission::where('is_active', true)->whereNull('deleted_at');

        $bookableType === null ? $query->whereNull('bookable_type') : $query->where('bookable_type', $bookableType);

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        $query->update(['is_active' => false]);
    }

    /**
     * Delete Commission
     *
     * @param $data
     * @return Commission
     */
    public function delete(int $id)
    {
        $commission = $this->commission->find($id);
        $commission->delete();
        return $commission;
    }

    /**
     * Get the currently active commission rate for a given verticale
     * (bookable_type), avec repli sur le taux global (bookable_type NULL)
     * si aucun taux spécifique n'est actif.
     *
     * @param string|null $bookableType
     * @return Commission|null
     */
    public function getLastCommission(?string $bookableType = null)
    {
        if ($bookableType !== null) {
            $specific = $this->commission
                ->whereNull('deleted_at')
                ->where('is_active', true)
                ->where('bookable_type', $bookableType)
                ->latest()
                ->first();

            if ($specific) {
                return $specific;
            }
        }

        return $this->commission
            ->whereNull('deleted_at')
            ->where('is_active', true)
            ->whereNull('bookable_type')
            ->latest()
            ->first();
    }
}
