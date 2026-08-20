<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PayoutAccount extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'channel',
        'account_name',
        'account_number',
        'bank_code',
        'bank_name',
        'currency',
        'paystack_recipient_code',
        'paystack_recipient_type',
        'is_verified',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Snapshot sérialisable pour withdrawals.payout_snapshot.
     */
    public function toSnapshot(): array
    {
        return [
            'id' => $this->id,
            'channel' => $this->channel,
            'account_name' => $this->account_name,
            'account_number' => $this->account_number,
            'bank_code' => $this->bank_code,
            'bank_name' => $this->bank_name,
            'currency' => $this->currency,
            'paystack_recipient_code' => $this->paystack_recipient_code,
            'paystack_recipient_type' => $this->paystack_recipient_type,
            'is_verified' => $this->is_verified,
        ];
    }
}
