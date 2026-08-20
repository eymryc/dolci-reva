<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoungeProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lounge_id' => $this->lounge_id,
            'category_id' => $this->category_id,
            'name' => $this->name,
            'description' => $this->description,
            'price' => (float) $this->price,
            'currency' => $this->currency,
            'is_available' => $this->is_available ? 1 : 0,
            'is_active' => $this->is_active,
            'popularity_score' => $this->popularity_score,
            'total_orders' => $this->total_orders,
            'variants' => $this->variants ?? [],
            'options' => $this->options ?? [],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'category' => new LoungeProductCategoryResource($this->whenLoaded('category')),
            'lounge' => $this->whenLoaded('lounge'),
            'main_image_url' => $this->getFirstMediaUrl('images') ?: null,
            'main_image_thumb_url' => $this->getFirstMediaUrl('images', 'thumb') ?: null,
            'main_image_medium_url' => $this->getFirstMediaUrl('images', 'medium') ?: null,
            'gallery_images' => $this->getMedia('gallery')->map(fn ($media) => [
                'id' => $media->id,
                'url' => $media->getUrl(),
            ])->values(),
        ];
    }
}
