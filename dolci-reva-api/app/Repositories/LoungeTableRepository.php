<?php

namespace App\Repositories;

use App\Models\LoungeTable;
use Illuminate\Database\Eloquent\Collection;

class LoungeTableRepository
{
    public function __construct(protected LoungeTable $loungeTable)
    {
    }

    public function all()
    {
        return $this->loungeTable->with(['lounge'])->latest()->get();
    }

    public function getById(int $id)
    {
        return $this->loungeTable->with(['lounge'])->find($id);
    }

    public function getByLoungeId(int $loungeId)
    {
        return $this->loungeTable->where('lounge_id', $loungeId)->with(['lounge'])->get();
    }

    public function save(array $data)
    {
        return LoungeTable::create($data);
    }

    public function update(array $data, int $id)
    {
        $table = $this->loungeTable->find($id);
        if (!$table) {
            return null;
        }
        $table->update($data);
        return $table->load('lounge');
    }

    public function delete(int $id): bool
    {
        $table = $this->loungeTable->find($id);
        return $table ? (bool) $table->delete() : false;
    }
}
