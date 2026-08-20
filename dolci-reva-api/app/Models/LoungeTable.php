<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class LoungeTable extends Model
{
    use HasFactory;
    use \App\Traits\HasUnitAvailability;

    protected $fillable = [
        'lounge_id',
        'table_number',
        'capacity',
        'location',
        'table_type',
        'is_active',
        'minimum_spend'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'minimum_spend' => 'decimal:2'
    ];

    /**
     * Get the lounge that owns the table.
     */
    public function lounge(): BelongsTo
    {
        return $this->belongsTo(Lounge::class);
    }

    /**
     * Get the bookings for the table.
     */
    public function bookings(): BelongsToMany
    {
        return $this->belongsToMany(
            Booking::class,
            'bookings_lounge_tables',
            'table_id',
            'booking_id'
        );
    }

    /**
     * Check if table is available for a specific date and time.
     */
    public function isAvailableFor(string $date, string $time, int $guests): bool
    {
        // Check if table is active and has enough capacity
        if (!$this->is_active || $this->capacity < $guests) {
            return false;
        }

        // Check if there are conflicting bookings
        $conflictingBooking = $this->bookings()
            ->where('start_date', $date)
            ->where('status', '!=', 'ANNULE')
            ->where(function ($query) use ($time) {
                $query->where('start_date', $date)
                    ->where('status', '!=', 'ANNULE');
            })
            ->exists();

        return !$conflictingBooking;
    }

    /**
     * Get the display name for the table.
     */
    public function getDisplayNameAttribute(): string
    {
        return "Table {$this->table_number} ({$this->capacity} personnes)";
    }

    /**
     * Get the full location description.
     */
    public function getLocationDescriptionAttribute(): string
    {
        $locationMap = [
            'window' => 'Près de la fenêtre',
            'terrace' => 'Terrasse',
            'main_room' => 'Salle principale',
            'smoking_area' => 'Espace fumeurs',
            'outdoor' => 'Extérieur'
        ];

        return $locationMap[$this->location] ?? ucfirst($this->location);
    }

    /**
     * Get the table type description.
     */
    public function getTypeDescriptionAttribute(): string
    {
        $typeMap = [
            'sofa' => 'Canapé',
            'high_table' => 'Table haute',
            'low_table' => 'Table basse',
            'bar_counter' => 'Comptoir',
            'private_booth' => 'Espace privé',
            'outdoor' => 'Extérieur'
        ];

        return $typeMap[$this->table_type] ?? ucfirst($this->table_type);
    }


    /**
     * Get minimum spend formatted as currency.
     */
    public function getMinimumSpendFormattedAttribute(): string
    {
        if (!$this->minimum_spend) {
            return 'Aucun minimum';
        }

        return number_format($this->minimum_spend, 0, ',', ' ') . ' FCFA';
    }
}