<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OpinionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'user_id'     => $this->user_id,
            'residence_id' => $this->residence_id,
            'comment'     => $this->comment,
            'display'     => $this->display,
            'note'        => $this->note,
            'user'        => $this->whenLoaded('user', function () {
                return [
                    'id'         => $this->user->id,
                    'first_name' => $this->user->first_name,
                    'last_name'  => $this->user->last_name,
                    'email'      => $this->user->email,
                ];
            }),
            'residence'   => $this->whenLoaded('residence', function () {
                return [
                    'id'          => $this->residence->id,
                    'name'        => $this->residence->name,
                    'description' => $this->residence->description,
                    'city'        => $this->residence->city,
                ];
            }),
            'created_at'  => $this->created_at,
            'updated_at'  => $this->updated_at,
        ];
    }
}
