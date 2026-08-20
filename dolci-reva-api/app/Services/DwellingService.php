<?php

namespace App\Services;

use App\Models\Dwelling;
use App\Repositories\DwellingRepository;
use Illuminate\Http\UploadedFile;

class DwellingService
{
    protected DwellingRepository $dwellingRepository;

    public function __construct(DwellingRepository $dwellingRepository)
    {
        $this->dwellingRepository = $dwellingRepository;
    }

    public function getAllWithPagination(int $perPage = 15)
    {
        return $this->dwellingRepository->paginate($perPage);
    }

    public function getByOwner(int $ownerId, int $perPage = 15)
    {
        return $this->dwellingRepository->getByOwner($ownerId, $perPage);
    }

    public function getPublic(array $filters = [], int $perPage = 15)
    {
        return $this->dwellingRepository->getPublic($filters, $perPage);
    }

    public function getById(int $id): ?Dwelling
    {
        return $this->dwellingRepository->getById($id);
    }

    public function create(array $data, ?UploadedFile $mainImage = null, array $galleryImages = []): Dwelling
    {
        // Calculer les montants automatiquement
        $rent = (float) ($data['rent'] ?? 0);
        $data['rent_advance_amount'] = $rent * ($data['rent_advance_amount_number'] ?? 1);
        $data['security_deposit_amount'] = $rent * ($data['security_deposit_month_number'] ?? 1);
        $data['agency_fees'] = $rent * ($data['agency_fees_month_number'] ?? 1);

        $dwelling = $this->dwellingRepository->save($data);

        if ($mainImage) {
            $dwelling->addMedia($mainImage)->toMediaCollection('images');
        }

        foreach ($galleryImages as $image) {
            $dwelling->addMedia($image)->toMediaCollection('gallery');
        }

        return $dwelling->fresh(['owner', 'media']);
    }

    public function update(int $id, array $data, ?UploadedFile $mainImage = null, array $galleryImages = []): Dwelling
    {
        if (isset($data['rent'])) {
            $rent = (float) $data['rent'];
            if (isset($data['rent_advance_amount_number'])) {
                $data['rent_advance_amount'] = $rent * $data['rent_advance_amount_number'];
            }
            if (isset($data['security_deposit_month_number'])) {
                $data['security_deposit_amount'] = $rent * $data['security_deposit_month_number'];
            }
            if (isset($data['agency_fees_month_number'])) {
                $data['agency_fees'] = $rent * $data['agency_fees_month_number'];
            }
        }

        $dwelling = $this->dwellingRepository->update($id, $data);

        if ($mainImage) {
            $dwelling->clearMediaCollection('images');
            $dwelling->addMedia($mainImage)->toMediaCollection('images');
        }

        foreach ($galleryImages as $image) {
            $dwelling->addMedia($image)->toMediaCollection('gallery');
        }

        return $dwelling->fresh(['owner', 'media']);
    }

    public function delete(int $id): bool
    {
        return $this->dwellingRepository->delete($id);
    }

    public function toggleAvailability(int $id): Dwelling
    {
        $dwelling = $this->dwellingRepository->getById($id);
        $dwelling->is_available = !$dwelling->is_available;
        $dwelling->save();
        return $dwelling->fresh(['owner', 'media']);
    }
}
