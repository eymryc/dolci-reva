<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class RestaurantTable extends Model
{
    use HasFactory;
    use \App\Traits\HasUnitAvailability;

    protected $fillable = [
        'restaurant_id',
        'table_number',
        'capacity',
        'location',
        'table_type',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    /**
     * Get the restaurant that owns the table.
     */
    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    /**
     * Get the bookings for the table.
     */
    public function bookings(): BelongsToMany
    {
        return $this->belongsToMany(
            Booking::class,
            'bookings_restaurant_tables',
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
            'private' => 'Espace privé'
        ];

        return $locationMap[$this->location] ?? ucfirst($this->location);
    }

    /**
     * Get the table type description.
     */
    public function getTypeDescriptionAttribute(): string
    {
        $typeMap = [
            'standard' => 'Standard',
            'booth' => 'Banquette',
            'bar' => 'Comptoir',
            'private' => 'Privé'
        ];

        return $typeMap[$this->table_type] ?? ucfirst($this->table_type);
    }
}