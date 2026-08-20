<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use App\Traits\Bookable;
use App\Traits\HasMediaTrait;
use App\Traits\HasFeatureOptions;

class HotelRoom extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, Bookable, InteractsWithMedia, HasMediaTrait, HasFeatureOptions;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'hotel_id',
        'room_number',
        'name',
        'description',
        'type',
        'max_guests',
        'surface_m2',
        'price',
        'standing',
        'is_available',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_available' => 'boolean',
        'is_active' => 'boolean',
        'price' => 'decimal:2',
        'surface_m2' => 'decimal:2',
    ];

    /**
     * Get the hotel that owns the room.
     */
    public function hotel(): BelongsTo
    {
        return $this->belongsTo(Hotel::class);
    }

    /**
     * Generate a default name for the room based on type, standing and room number.
     */
    public function generateDefaultName(): string
    {
        $parts = [];
        
        // Add standing if not STANDARD
        if ($this->standing && $this->standing !== 'STANDARD') {
            $parts[] = ucfirst(strtolower($this->standing));
        }
        
        // Add type
        if ($this->type) {
            $parts[] = ucfirst(strtolower($this->type));
        }
        
        // Add room number if available
        if ($this->room_number) {
            $parts[] = "Chambre {$this->room_number}";
        } else {
            $parts[] = "Chambre";
        }
        
        return implode(' ', $parts);
    }

    /**
     * Get the display name (generated if name is null).
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->name ?? $this->generateDefaultName();
    }

    /**
     * Dates indisponibles pour cette chambre (bookings actifs hors ANNULE / hors TTL unpaid).
     */
    public function getUnavailableDates(): array
    {
        $holdCutoff = now()->subMinutes(max(1, (int) config('booking.unpaid_hold_minutes', 30)));

        return \App\Models\Booking::query()
            ->where('hotel_room_id', $this->id)
            ->where('status', '!=', 'ANNULE')
            ->where(function ($q) use ($holdCutoff) {
                $q->where('payment_status', 'PAYE')
                    ->orWhere('created_at', '>', $holdCutoff);
            })
            ->where('end_date', '>=', now()->toDateString())
            ->orderBy('start_date')
            ->get()
            ->map(function ($booking) {
                return [
                    'start' => \Carbon\Carbon::parse($booking->start_date)->toDateString(),
                    'end' => \Carbon\Carbon::parse($booking->end_date)->toDateString(),
                    'status' => $booking->status,
                ];
            })
            ->toArray();
    }

    /**
     * État FO : disponible / réservée / bloquée + prochaine date de libération.
     */
    public function getAvailabilityStatus(): array
    {
        if (!$this->is_active) {
            return [
                'status' => 'inactive',
                'label' => 'Inactive',
                'occupied_until' => null,
                'free_from' => null,
                'next_booking_start' => null,
                'message' => 'Cette chambre n\'est pas active',
            ];
        }

        if ($this->is_available === false) {
            return [
                'status' => 'blocked',
                'label' => 'Indisponible',
                'occupied_until' => null,
                'free_from' => null,
                'next_booking_start' => null,
                'message' => 'Chambre temporairement indisponible',
            ];
        }

        $today = now()->toDateString();
        $ranges = $this->getUnavailableDates();

        $current = null;
        foreach ($ranges as $range) {
            if ($range['start'] <= $today && $range['end'] >= $today) {
                $current = $range;
                break;
            }
        }

        if ($current) {
            $freeFrom = \Carbon\Carbon::parse($current['end'])->addDay()->toDateString();

            return [
                'status' => 'reserved',
                'label' => 'Réservée',
                'occupied_until' => $current['end'],
                'free_from' => $freeFrom,
                'next_booking_start' => null,
                'booking_status' => $current['status'],
                'message' => 'Libre à partir du ' . \Carbon\Carbon::parse($freeFrom)->format('d/m/Y'),
            ];
        }

        $next = collect($ranges)
            ->filter(fn (array $r) => $r['start'] > $today)
            ->sortBy('start')
            ->first();

        return [
            'status' => 'available',
            'label' => 'Disponible',
            'occupied_until' => null,
            'free_from' => $today,
            'next_booking_start' => $next['start'] ?? null,
            'message' => $next
                ? 'Disponible · prochaine réservation le ' . \Carbon\Carbon::parse($next['start'])->format('d/m/Y')
                : 'Disponible maintenant',
        ];
    }

    /**
     * Register media collections for the hotel room.
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->acceptsMimeTypes(\App\Support\ImageUploadRules::MIME_TYPES)
            ->singleFile();

        $this->addMediaCollection('gallery')
            ->acceptsMimeTypes(\App\Support\ImageUploadRules::MIME_TYPES);
    }

    /**
     * Register media conversions for the hotel room.
     */
    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)
            ->height(200)
            ->sharpen(10)
            ->performOnCollections('images', 'gallery');

        $this->addMediaConversion('medium')
            ->width(800)
            ->height(600)
            ->sharpen(10)
            ->performOnCollections('images', 'gallery');

        $this->addMediaConversion('large')
            ->width(1200)
            ->height(800)
            ->sharpen(10)
            ->performOnCollections('images', 'gallery');
    }
}
