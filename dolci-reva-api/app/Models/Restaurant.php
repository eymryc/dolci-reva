<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use App\Traits\HasMediaTrait;
use App\Traits\HasFeatureOptions;

class Restaurant extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, HasMediaTrait, HasFeatureOptions;

    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'address',
        'city',
        'country',
        'opening_hours',
        'latitude',
        'longitude',
        'is_active'
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'is_active' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8'
    ];

    /**
     * Get the owner of the restaurant.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the tables for the restaurant.
     */
    public function tables(): HasMany
    {
        return $this->hasMany(RestaurantTable::class);
    }

    public function menuCategories(): HasMany
    {
        return $this->hasMany(RestaurantMenuCategory::class);
    }

    public function menuItems(): HasMany
    {
        return $this->hasMany(RestaurantMenuItem::class);
    }

    /**
     * Get the bookings for the restaurant.
     */
    public function bookings(): MorphMany
    {
        return $this->morphMany(Booking::class, 'bookable');
    }


    /**
     * Register media collections for the restaurant.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->singleFile()
            ->acceptsMimeTypes(\App\Support\ImageUploadRules::MIME_TYPES);

        $this->addMediaCollection('gallery')
            ->acceptsMimeTypes(\App\Support\ImageUploadRules::MIME_TYPES);
    }

    /**
     * Register media conversions for the restaurant.
     */
    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(200)
            ->sharpen(10);

        $this->addMediaConversion('medium')
            ->width(800)
            ->height(600)
            ->sharpen(10);

        $this->addMediaConversion('large')
            ->width(1200)
            ->height(800)
            ->sharpen(10);
    }

    /**
     * Get available tables for a specific date and time.
     */
    public function getAvailableTables(string $date, string $time, int $guests): \Illuminate\Database\Eloquent\Collection
    {
        $slotStart = \App\Support\HospitalitySlot::slotStart($date, $time);
        $slotEnd = \App\Support\HospitalitySlot::slotEnd($date, $time, 'restaurant');

        return $this->tables()
            ->where('is_active', true)
            ->where('capacity', '>=', $guests)
            ->whereDoesntHave('bookings', function ($query) use ($slotStart, $slotEnd) {
                // Qualifier bookings.* : la pivot BelongsToMany a aussi created_at.
                $holdCutoff = now()->subMinutes(max(1, (int) config('booking.unpaid_hold_minutes', 30)));
                $query->where('bookings.status', '!=', 'ANNULE')
                    ->where(function ($q) use ($holdCutoff) {
                        $q->where('bookings.payment_status', 'PAYE')
                            ->orWhere('bookings.created_at', '>', $holdCutoff);
                    })
                    ->where('bookings.start_date', '<', $slotEnd)
                    ->where('bookings.end_date', '>', $slotStart);
            })
            ->get();
    }

    /**
     * Check if restaurant is open at given time.
     */
    public function isOpenAt(string $date, string $time): bool
    {
        $dayOfWeek = strtolower(\Carbon\Carbon::parse($date)->format('l'));
        $openingHours = $this->opening_hours;

        if (!isset($openingHours[$dayOfWeek])) {
            return false;
        }

        $openTime = $openingHours[$dayOfWeek]['open'] ?? null;
        $closeTime = $openingHours[$dayOfWeek]['close'] ?? null;

        if (!$openTime || !$closeTime) {
            return false;
        }

        $currentTime = \Carbon\Carbon::parse($time);
        $open = \Carbon\Carbon::parse($openTime);
        $close = \Carbon\Carbon::parse($closeTime);

        return $currentTime->between($open, $close);
    }
}