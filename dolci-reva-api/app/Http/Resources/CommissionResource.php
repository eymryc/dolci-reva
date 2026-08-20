<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CommissionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'commission'    => $this->commission,
            'bookable_type' => $this->bookable_type,
            'is_active'     => $this->is_active,
            'deleted_at'    => $this->deleted_at,
        ];
    }
}
