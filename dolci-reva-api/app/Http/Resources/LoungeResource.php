<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoungeResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'owner_id' => $this->owner_id,
            'name' => $this->name,
            'description' => $this->description,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,
            'opening_hours' => $this->opening_hours,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'is_active' => $this->is_active,
            
            // Champs spécifiques aux lounges
            'age_restriction' => $this->age_restriction,
            'smoking_area' => $this->smoking_area,
            'outdoor_seating' => $this->outdoor_seating,
            
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relations
            'feature_categories' => $this->whenLoaded('featureOptions', function () {
                return $this->groupedFeatureOptions();
            }),

            // Media Library - Images
            'main_image_url' => $this->main_image_url,
            'main_image_thumb_url' => $this->main_image_thumb_url,
            'gallery_images' => $this->gallery_images,
            'all_images' => $this->all_images,

            'tables' => $this->whenLoaded('tables', function () {
                return LoungeTableResource::collection($this->tables);
            }),

            'owner' => $this->whenLoaded('owner', function () {
                return [
                    'id' => $this->owner->id,
                    'first_name' => $this->owner->first_name,
                    'last_name' => $this->owner->last_name,
                    'email' => $this->owner->email
                ];
            }),
        ];
    }
}