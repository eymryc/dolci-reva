<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerCreditRedemption extends Model
{
    protected $fillable = [
        'customer_credit_id',
        'booking_id',
        'amount',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
    ];

    public function credit(): BelongsTo
    {
        return $this->belongsTo(CustomerCredit::class, 'customer_credit_id');
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}
