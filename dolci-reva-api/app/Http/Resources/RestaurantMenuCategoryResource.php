<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RestaurantMenuCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'restaurant_id' => $this->restaurant_id,
            'name' => $this->name,
            'description' => $this->description,
            'icon' => $this->icon,
            'order' => $this->order ?? 0,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'menu_items_count' => $this->whenCounted('menuItems'),
            'restaurant' => $this->whenLoaded('restaurant'),
        ];
    }
}
