<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LoungeProductCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'lounge_id' => $this->lounge_id,
            'venue_id' => $this->lounge_id,
            'name' => $this->name,
            'description' => $this->description,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'products_count' => $this->whenCounted('products'),
            'lounge' => $this->whenLoaded('lounge'),
        ];
    }
}
