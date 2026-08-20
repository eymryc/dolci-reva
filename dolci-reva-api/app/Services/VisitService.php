<?php

namespace App\Services;

use App\Models\Dwelling;
use App\Models\Visit;
use App\Repositories\VisitRepository;
use Illuminate\Support\Facades\Auth;

class VisitService
{
    public function __construct(protected VisitRepository $repository)
    {
    }

    public function paginate(array $filters = [], int $perPage = 15)
    {
        return $this->repository->paginate($filters, $perPage);
    }

    public function getById(int $id)
    {
        return $this->repository->getById($id);
    }

    public function save(array $data)
    {
        $dwelling = Dwelling::findOrFail($data['dwelling_id']);
        $visitorId = Auth::id();

        return $this->repository->save([
            'dwelling_id' => $dwelling->id,
            'visitor_id' => $visitorId,
            'owner_id' => $dwelling->owner_id,
            'scheduled_at' => $data['scheduled_at'],
            'notes' => $data['notes'] ?? null,
            'status' => Visit::STATUS_PENDING,
        ]);
    }

    public function confirm(int $id)
    {
        return $this->repository->confirm($id);
    }

    public function cancel(int $id, ?string $reason = null)
    {
        return $this->repository->cancel($id, Auth::id(), $reason);
    }
}
