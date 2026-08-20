<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VisitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'dwelling_id' => (string) $this->dwelling_id,
            'visitor_id' => (string) $this->visitor_id,
            'owner_id' => (string) $this->owner_id,
            'visit_reference' => $this->visit_reference,
            'scheduled_at' => optional($this->scheduled_at)->toIso8601String(),
            'visited_at' => optional($this->visited_at)?->toIso8601String(),
            'status' => $this->status,
            'status_label' => $this->status_label,
            'notes' => $this->notes,
            'cancellation_reason' => $this->cancellation_reason,
            'cancelled_by' => $this->cancelled_by ? (string) $this->cancelled_by : null,
            'cancelled_at' => optional($this->cancelled_at)?->toIso8601String(),
            'owner_confirmed' => $this->owner_confirmed,
            'dwelling' => $this->whenLoaded('dwelling', function () {
                return [
                    'id' => $this->dwelling->id,
                    'address' => $this->dwelling->address,
                    'city' => $this->dwelling->city,
                    'country' => $this->dwelling->country,
                    'main_image_url' => $this->dwelling->main_image_url,
                    'main_image_thumb_url' => $this->dwelling->main_image_thumb_url,
                    'gallery_images' => $this->dwelling->gallery_images,
                    'all_images' => $this->dwelling->all_images,
                ];
            }),
            'visitor' => $this->whenLoaded('visitor', function () {
                if (!$this->visitor) {
                    return null;
                }
                return [
                    'id' => $this->visitor->id,
                    'first_name' => $this->visitor->first_name,
                    'last_name' => $this->visitor->last_name,
                    'email' => $this->visitor->email,
                    'phone' => $this->visitor->phone,
                ];
            }),
            'owner' => $this->whenLoaded('owner', function () {
                return [
                    'id' => $this->owner->id,
                    'first_name' => $this->owner->first_name,
                    'last_name' => $this->owner->last_name,
                    'email' => $this->owner->email,
                    'phone' => $this->owner->phone,
                ];
            }),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
