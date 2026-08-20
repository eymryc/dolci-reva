<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DwellingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'owner_id' => $this->owner_id,
            'description' => $this->description,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'phone' => $this->phone,
            'whatsapp' => $this->whatsapp,
            'type' => $this->type,
            'structure_type' => $this->structure_type,
            'structure_type_label' => $this->structureTypeLabel(),
            'construction_type' => $this->construction_type,
            'construction_type_label' => $this->constructionTypeLabel(),
            'rental_status' => $this->rental_status,
            'rent' => $this->toIntAmount($this->rent),
            'rent_advance_amount_number' => (int) ($this->rent_advance_amount_number ?? 0),
            'rent_advance_amount' => $this->toIntAmount($this->rent_advance_amount),
            'visite_price' => $this->toIntAmount($this->visite_price),
            'security_deposit_month_number' => (int) ($this->security_deposit_month_number ?? 0),
            'security_deposit_amount' => $this->toIntAmount($this->security_deposit_amount),
            'agency_fees_month_number' => (int) ($this->agency_fees_month_number ?? 0),
            'agency_fees' => $this->toIntAmount($this->agency_fees),
            'piece_number' => $this->piece_number,
            'rooms' => $this->rooms,
            'bathrooms' => $this->bathrooms,
            'living_room' => $this->living_room,
            'is_available' => $this->is_available,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,

            // Images
            'main_image_url' => $this->main_image_url,
            'main_image_thumb_url' => $this->main_image_thumb_url,
            'gallery_images' => $this->gallery_images,
            'all_images' => $this->all_images,

            'owner' => $this->whenLoaded('owner', fn () => $this->owner),
        ];
    }

    private function structureTypeLabel(): string
    {
        return match($this->structure_type) {
            'MAISON_BASSE' => 'Maison basse',
            'IMMEUBLE' => 'Immeuble',
            default => $this->structure_type,
        };
    }

    private function constructionTypeLabel(): string
    {
        return match($this->construction_type) {
            'NOUVELLE_CONSTRUCTION' => 'Nouvelle construction',
            'ANCIENNE' => 'Ancienne construction',
            default => $this->construction_type,
        };
    }

    private function toIntAmount(mixed $value): int
    {
        if ($value === null || $value === '') {
            return 0;
        }

        return (int) round((float) $value);
    }
}
