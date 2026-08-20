<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BusinessTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'    => $this->id,
            'name' => $this->name,
            // 'icon' => $this->icon,
            // 'deleted_at' => $this->deleted_at,
        ];
    }
}
