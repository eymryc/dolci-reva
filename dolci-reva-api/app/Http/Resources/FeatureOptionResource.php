<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FeatureOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'feature_category_id' => $this->feature_category_id,
            'name' => $this->name,
            'has_surcharge' => $this->has_surcharge,
            'display_order' => $this->display_order,
            'category' => new FeatureCategoryResource($this->whenLoaded('category')),
        ];
    }
}
