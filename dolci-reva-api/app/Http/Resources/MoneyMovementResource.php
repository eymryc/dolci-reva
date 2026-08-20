<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MoneyMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'direction' => $this->direction,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'status' => $this->status,
            'booking_id' => $this->booking_id,
            'user_id' => $this->user_id,
            'counterparty_user_id' => $this->counterparty_user_id,
            'withdrawal_id' => $this->withdrawal_id,
            'wallet_id' => $this->wallet_id,
            'external_reference' => $this->external_reference,
            'idempotency_key' => $this->idempotency_key,
            'meta' => $this->meta,
            'occurred_at' => $this->occurred_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => $this->whenLoaded('user', function () {
                if (!$this->user) {
                    return null;
                }

                return [
                    'id' => $this->user->id,
                    'first_name' => $this->user->first_name,
                    'last_name' => $this->user->last_name,
                    'email' => $this->user->email,
                ];
            }),
            'counterparty' => $this->whenLoaded('counterparty', function () {
                if (!$this->counterparty) {
                    return null;
                }

                return [
                    'id' => $this->counterparty->id,
                    'first_name' => $this->counterparty->first_name,
                    'last_name' => $this->counterparty->last_name,
                    'email' => $this->counterparty->email,
                ];
            }),
            'booking' => $this->whenLoaded('booking', function () {
                if (!$this->booking) {
                    return null;
                }

                return [
                    'id' => $this->booking->id,
                    'booking_reference' => $this->booking->booking_reference,
                    'status' => $this->booking->status,
                    'payment_status' => $this->booking->payment_status,
                    'total_price' => (float) $this->booking->total_price,
                ];
            }),
        ];
    }
}
