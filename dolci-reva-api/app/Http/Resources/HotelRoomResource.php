<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HotelRoomResource extends JsonResource
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
            'hotel_id' => $this->hotel_id,
            'name' => $this->name,
            'display_name' => $this->display_name,
            'description' => $this->description,
            'room_number' => $this->room_number,
            'type' => $this->type,
            'max_guests' => $this->max_guests,
            'price' => $this->price,
            'standing' => $this->standing,
            'is_active' => $this->is_active,
            'is_available' => $this->is_available,
            'unavailable_dates' => $this->getUnavailableDates(),
            'availability' => $this->getAvailabilityStatus(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relations
            'hotel' => $this->whenLoaded('hotel', function () {
                return $this->hotel;
            }),
            'feature_categories' => $this->whenLoaded('featureOptions', function () {
                return $this->groupedFeatureOptions();
            }),
            // Media Library - Images
            'main_image_url' => $this->main_image_url,
            'main_image_thumb_url' => $this->main_image_thumb_url,
            'gallery_images' => $this->gallery_images,
            'all_images' => $this->all_images,
        ];
    }
}
