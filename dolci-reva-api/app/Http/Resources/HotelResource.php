<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HotelResource extends JsonResource
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
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'star_rating' => $this->star_rating,
            'is_active' => $this->is_active,
            'rooms_count' => $this->relationLoaded('hotelRooms')
                ? $this->hotelRooms->count()
                : ($this->hotel_rooms_count ?? $this->hotelRooms()->count()),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relations
            'feature_categories' => $this->whenLoaded('featureOptions', function () {
                return $this->groupedFeatureOptions();
            }),

            // Media Library integration
            'main_image_url' => $this->main_image_url,
            'main_image_thumb_url' => $this->main_image_thumb_url,
            'gallery_images' => $this->gallery_images,
            'all_images' => $this->all_images,

            'owner' => $this->whenLoaded('owner', function () {
                return $this->owner;
            }),
            'hotel_rooms' => $this->whenLoaded('hotelRooms', function () {
                return HotelRoomResource::collection($this->hotelRooms);
            }),
            'rooms' => $this->whenLoaded('hotelRooms', function () {
                return HotelRoomResource::collection($this->hotelRooms);
            }),
        ];
    }
}
