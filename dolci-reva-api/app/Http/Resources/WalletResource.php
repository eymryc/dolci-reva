<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WalletResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            /** Disponible (crédité au check-in / recharges). */
            'balance' => (float) $this->balance,
            /** Payé par le client, encore en séquestre jusqu'au check-in. */
            'frozen_balance' => (float) $this->frozen_balance,
            /**
             * Part propriétaire des résas non payées.
             * (Le front historique utilisait recharge_balance — alias conservé.)
             */
            'pending_balance' => (float) $this->pending_balance,
            'recharge_balance' => (float) $this->pending_balance,
            'deleted_at' => $this->deleted_at,
        ];
    }
}
