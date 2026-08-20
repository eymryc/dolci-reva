<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeatureCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'icon' => $this->icon,
            'display_order' => $this->display_order,
            'establishment_types' => $this->establishment_types,
            'options' => FeatureOptionResource::collection($this->whenLoaded('options')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
