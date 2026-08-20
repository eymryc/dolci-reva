<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Commission extends Model
{
    use HasFactory, SoftDeletes;

    /**
     * Verticales (bookable_type de Booking) pour lesquelles un taux de
     * commission dédié peut être configuré. NULL reste le taux global
     * de repli, utilisé si aucun taux spécifique n'est actif.
     *
     * @var array<int, string>
     */
    public const BOOKABLE_TYPES = [
        Residence::class,
        Hotel::class,
        Restaurant::class,
        Lounge::class,
        NightClub::class,
        Dwelling::class,
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'commission',
        'bookable_type',
        'is_active',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'commission' => 'decimal:2',
        'is_active' => 'boolean',
    ];
}
