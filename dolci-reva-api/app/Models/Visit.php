<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Visit extends Model
{
    use HasFactory, SoftDeletes;

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_CONFIRMED = 'CONFIRMED';
    public const STATUS_COMPLETED = 'COMPLETED';
    public const STATUS_CANCELLED = 'CANCELLED';

    protected $fillable = [
        'dwelling_id',
        'visitor_id',
        'owner_id',
        'visit_reference',
        'scheduled_at',
        'visited_at',
        'status',
        'notes',
        'cancellation_reason',
        'cancelled_by',
        'cancelled_at',
        'owner_confirmed',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'visited_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'owner_confirmed' => 'boolean',
    ];

    public function dwelling(): BelongsTo
    {
        return $this->belongsTo(Dwelling::class);
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'visitor_id');
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function cancelledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cancelled_by');
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_PENDING => 'En attente',
            self::STATUS_CONFIRMED => 'Confirmée',
            self::STATUS_COMPLETED => 'Terminée',
            self::STATUS_CANCELLED => 'Annulée',
            default => $this->status,
        };
    }
}
