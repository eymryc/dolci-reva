<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MoneyMovement extends Model
{
    protected $fillable = [
        'type',
        'direction',
        'amount',
        'currency',
        'status',
        'booking_id',
        'user_id',
        'counterparty_user_id',
        'withdrawal_id',
        'wallet_id',
        'external_reference',
        'idempotency_key',
        'meta',
        'occurred_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'meta' => 'array',
        'occurred_at' => 'datetime',
    ];

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function counterparty(): BelongsTo
    {
        return $this->belongsTo(User::class, 'counterparty_user_id');
    }

    public function withdrawal(): BelongsTo
    {
        return $this->belongsTo(Withdrawal::class);
    }

    public function wallet(): BelongsTo
    {
        return $this->belongsTo(Wallet::class);
    }
}
