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

class Hotel extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, Bookable, InteractsWithMedia, HasMediaTrait, HasFeatureOptions;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'owner_id',
        'name',
        'description',
        'address',
        'city',
        'country',
        'latitude',
        'longitude',
        'star_rating',
        'is_active',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'star_rating' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * Get the owner that owns the hotel.
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the hotel rooms for the hotel.
     */
    public function hotelRooms()
    {
        return $this->hasMany(HotelRoom::class);
    }

    /**
     * Register media collections for the hotel.
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
     * Register media conversions for the hotel.
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
