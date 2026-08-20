<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Wallet extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id',
        'is_platform',
    ];

    protected $casts = [
        'is_platform' => 'boolean',
        'balance' => 'decimal:2',
    ];

    protected $appends = [
        'frozen_balance',
        'pending_balance',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isPlatform(): bool
    {
        return (bool) $this->is_platform;
    }

    /**
     * Get the wallet's transactions.
     *
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * Fonds payés par les clients, encore en séquestre (avant check-in).
     */
    public function getFrozenBalanceAttribute(): float
    {
        if (!$this->user_id) {
            return 0.0;
        }

        return (float) Booking::query()
            ->where('owner_id', $this->user_id)
            ->where('payment_status', 'PAYE')
            ->whereNull('funds_released_at')
            ->where('status', '!=', 'ANNULE')
            ->sum('owner_amount');
    }

    /**
     * Part propriétaire des réservations encore non payées.
     */
    public function getPendingBalanceAttribute(): float
    {
        if (!$this->user_id) {
            return 0.0;
        }

        return (float) Booking::query()
            ->where('owner_id', $this->user_id)
            ->whereIn('payment_status', ['EN_ATTENTE', 'ECHEC'])
            ->where('status', '!=', 'ANNULE')
            ->sum('owner_amount');
    }
}
