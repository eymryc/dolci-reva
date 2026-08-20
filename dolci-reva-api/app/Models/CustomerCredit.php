<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerCredit extends Model
{
    protected $fillable = [
        'user_id',
        'amount',
        'remaining_amount',
        'bonus_amount',
        'source_booking_id',
        'expires_at',
        'status',
        'meta',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'remaining_amount' => 'decimal:2',
        'bonus_amount' => 'decimal:2',
        'expires_at' => 'datetime',
        'meta' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sourceBooking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'source_booking_id');
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(CustomerCreditRedemption::class);
    }

    public function isUsable(): bool
    {
        if ($this->status !== 'ACTIVE') {
            return false;
        }

        if ((float) $this->remaining_amount <= 0) {
            return false;
        }

        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }

        return true;
    }
}
