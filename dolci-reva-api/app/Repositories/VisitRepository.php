<?php

namespace App\Repositories;

use App\Models\Visit;
use Illuminate\Support\Str;

class VisitRepository
{
    public function __construct(protected Visit $visit)
    {
    }

    public function paginate(array $filters = [], int $perPage = 15)
    {
        $query = $this->visit->with(['dwelling', 'visitor', 'owner'])->latest();

        if (!empty($filters['owner_id'])) {
            $query->where('owner_id', $filters['owner_id']);
        }
        if (!empty($filters['visitor_id'])) {
            $query->where('visitor_id', $filters['visitor_id']);
        }
        if (!empty($filters['dwelling_id'])) {
            $query->where('dwelling_id', $filters['dwelling_id']);
        }
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->paginate($perPage);
    }

    public function getById(int $id)
    {
        return $this->visit->with(['dwelling', 'visitor', 'owner'])->find($id);
    }

    public function save(array $data)
    {
        if (empty($data['visit_reference'])) {
            $data['visit_reference'] = 'VIS-' . strtoupper(Str::random(8));
        }
        $data['status'] = $data['status'] ?? Visit::STATUS_PENDING;
        $data['owner_confirmed'] = $data['owner_confirmed'] ?? false;

        $visit = Visit::create($data);
        return $visit->load(['dwelling', 'visitor', 'owner']);
    }

    public function confirm(int $id)
    {
        $visit = $this->visit->find($id);
        if (!$visit) {
            return null;
        }

        $visit->update([
            'status' => Visit::STATUS_CONFIRMED,
            'owner_confirmed' => true,
        ]);

        return $visit->load(['dwelling', 'visitor', 'owner']);
    }

    public function cancel(int $id, ?int $cancelledBy = null, ?string $reason = null)
    {
        $visit = $this->visit->find($id);
        if (!$visit) {
            return null;
        }

        $visit->update([
            'status' => Visit::STATUS_CANCELLED,
            'cancelled_by' => $cancelledBy,
            'cancellation_reason' => $reason,
            'cancelled_at' => now(),
        ]);

        return $visit->load(['dwelling', 'visitor', 'owner']);
    }
}
