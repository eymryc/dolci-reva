<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NightClubAreaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'night_club_id' => $this->night_club_id,
            'area_name' => $this->area_name,
            'location' => $this->location,
            'area_type' => $this->area_type,
            'capacity' => $this->capacity,
            'is_active' => $this->is_active,
            'reservation_required' => $this->reservation_required,
            'minimum_spend' => $this->minimum_spend,
            'table_fee' => $this->table_fee,
            'display_name' => $this->display_name,
            'unavailable_dates' => $this->getUnavailableDates(),
            'availability' => $this->getAvailabilityStatus(),
            'feature_categories' => $this->whenLoaded('featureOptions', function () {
                return $this->groupedFeatureOptions();
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
