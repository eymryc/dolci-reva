<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ResidenceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $availability = $this->getAvailabilityStatus();

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
            'type' => $this->type,
            'max_guests' => $this->max_guests,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'piece_number' => $this->piece_number,
            'price' => $this->price,
            'standing' => $this->standing,
            'average_rating' => $this->average_rating,
            'total_ratings' => $this->total_ratings,
            'rating_count' => $this->rating_count,
            'rating_percentage' => $this->rating_percentage,
            'stars' => $this->stars,
            'has_ratings' => $this->hasRatings(),
            'is_available' => $this->is_available,
            'is_active' => $this->is_active,
            'availability_status' => $availability,
            'availability' => $availability,
            'next_available_date' => $availability['free_from']
                ?? $availability['next_available_date']
                ?? $this->getNextAvailableDate(),
            'unavailable_dates' => $this->getUnavailableDates(),
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

            'owner' => $this->whenLoaded('owner', function () {
                return $this->owner;
            }),
        ];
    }
}
