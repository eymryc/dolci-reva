<?php

namespace App\Repositories;

use App\Models\NightClubArea;

class NightClubAreaRepository
{
    public function __construct(protected NightClubArea $nightClubArea)
    {
    }

    public function all()
    {
        return $this->nightClubArea->with(['nightClub', 'featureOptions'])->latest()->get();
    }

    public function getById(int $id)
    {
        return $this->nightClubArea->with(['nightClub', 'featureOptions'])->find($id);
    }

    public function getByNightClubId(int $nightClubId)
    {
        return $this->nightClubArea
            ->where('night_club_id', $nightClubId)
            ->with(['nightClub', 'featureOptions'])
            ->get();
    }

    public function save(array $data)
    {
        $featureOptionIds = $data['feature_option_ids'] ?? [];
        unset($data['feature_option_ids']);

        $area = NightClubArea::create($data);
        if (!empty($featureOptionIds)) {
            $area->featureOptions()->sync($featureOptionIds);
        }

        return $area->load(['nightClub', 'featureOptions']);
    }

    public function update(array $data, int $id)
    {
        $area = $this->nightClubArea->find($id);
        if (!$area) {
            return null;
        }

        $featureOptionIds = $data['feature_option_ids'] ?? null;
        unset($data['feature_option_ids']);

        $area->update($data);
        if ($featureOptionIds !== null) {
            $area->featureOptions()->sync($featureOptionIds);
        }

        return $area->load(['nightClub', 'featureOptions']);
    }

    public function delete(int $id): bool
    {
        $area = $this->nightClubArea->find($id);
        return $area ? (bool) $area->delete() : false;
    }
}
