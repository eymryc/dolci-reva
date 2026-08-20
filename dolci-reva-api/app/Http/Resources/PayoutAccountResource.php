<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PayoutAccountResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'channel' => $this->channel,
            'account_name' => $this->account_name,
            'account_number' => $this->account_number,
            'bank_code' => $this->bank_code,
            'bank_name' => $this->bank_name,
            'currency' => $this->currency,
            'paystack_recipient_code' => $this->paystack_recipient_code,
            'paystack_recipient_type' => $this->paystack_recipient_type,
            'is_verified' => (bool) $this->is_verified,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
