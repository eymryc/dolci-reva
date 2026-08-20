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

class NightClub extends Model implements HasMedia
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
        'is_active',
        'age_restriction',
        'parking'
    ];

    protected $casts = [
        'opening_hours' => 'array',
        'is_active' => 'boolean',
        'parking' => 'boolean',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8'
    ];

    /**
     * Get the owner of the night club.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the areas for the night club.
     */
    public function areas(): HasMany
    {
        return $this->hasMany(NightClubArea::class);
    }

    /**
     * Get the bookings for the night club.
     */
    public function bookings(): MorphMany
    {
        return $this->morphMany(Booking::class, 'bookable');
    }


    /**
     * Register media collections for the night club.
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
     * Register media conversions for the night club.
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
     * Get available areas for a specific date and time.
     */
    public function getAvailableAreas(string $date, string $time, int $guests): \Illuminate\Database\Eloquent\Collection
    {
        $slotStart = \App\Support\HospitalitySlot::slotStart($date, $time);
        $slotEnd = \App\Support\HospitalitySlot::slotEnd($date, $time, 'night_club');

        return $this->areas()
            ->where('is_active', true)
            ->where(function ($query) use ($guests) {
                $query->whereNull('capacity')->orWhere('capacity', '>=', $guests);
            })
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
     * Check if night club is open at given time.
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

        // Gestion des horaires qui passent minuit (ex: 22:00 - 06:00)
        if ($close->lessThan($open)) {
            // Le club ferme le lendemain
            $nextDay = \Carbon\Carbon::parse($date)->addDay();
            $isNextDay = \Carbon\Carbon::parse($date . ' ' . $time)->isAfter(\Carbon\Carbon::parse($date . ' ' . $openTime));
            
            if ($isNextDay) {
                return $currentTime->isAfter($open) || $currentTime->isBefore($close);
            } else {
                return $currentTime->isAfter($open);
            }
        }

        return $currentTime->between($open, $close);
    }

    /**
     * Get recommended areas based on preferences.
     */
    public function getRecommendedAreas(string $date, string $time, int $guests, string $preference = null): \Illuminate\Database\Eloquent\Collection
    {
        $query = $this->areas()
            ->where('is_active', true)
            ->where('capacity', '>=', $guests);

        // Filtres basés sur les préférences
        switch ($preference) {
            case 'vip':
                $query->where('area_type', 'vip_booth');
                break;
            case 'dance':
                $query->where('area_type', 'dance_floor');
                break;
            case 'private':
                $query->where('area_type', 'private_room');
                break;
            case 'bottle':
                $query->where('area_type', 'bottle_service');
                break;
            case 'terrace':
                $query->where('area_type', 'terrace');
                break;
        }

        return $query->get();
    }

}