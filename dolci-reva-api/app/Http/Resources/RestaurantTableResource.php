<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantTableResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'table_number' => $this->table_number,
            'capacity' => $this->capacity,
            'location' => $this->location,
            'table_type' => $this->table_type,
            'is_active' => $this->is_active,
            'display_name' => $this->display_name,
            'location_description' => $this->location_description,
            'type_description' => $this->type_description,
            'unavailable_dates' => $this->getUnavailableDates(),
            'availability' => $this->getAvailabilityStatus(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
