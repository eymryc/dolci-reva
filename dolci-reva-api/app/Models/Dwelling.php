<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use App\Traits\HasMediaTrait;

class Dwelling extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia, HasMediaTrait;

    protected $fillable = [
        'owner_id',
        'description',
        'address',
        'city',
        'country',
        'latitude',
        'longitude',
        'phone',
        'whatsapp',
        'type',
        'structure_type',
        'construction_type',
        'rental_status',
        'rent',
        'rent_advance_amount_number',
        'rent_advance_amount',
        'visite_price',
        'security_deposit_month_number',
        'security_deposit_amount',
        'agency_fees_month_number',
        'agency_fees',
        'piece_number',
        'rooms',
        'bathrooms',
        'living_room',
        'is_available',
        'is_active',
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'is_active' => 'boolean',
        'rent' => 'decimal:2',
        'rent_advance_amount' => 'decimal:2',
        'visite_price' => 'decimal:2',
        'security_deposit_amount' => 'decimal:2',
        'agency_fees' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->acceptsMimeTypes(\App\Support\ImageUploadRules::MIME_TYPES)
            ->singleFile();

        $this->addMediaCollection('gallery')
            ->acceptsMimeTypes(\App\Support\ImageUploadRules::MIME_TYPES);
    }

    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)->height(200)->sharpen(10)
            ->performOnCollections('images', 'gallery');

        $this->addMediaConversion('medium')
            ->width(800)->height(600)->sharpen(10)
            ->performOnCollections('images', 'gallery');

        $this->addMediaConversion('large')
            ->width(1200)->height(800)->sharpen(10)
            ->performOnCollections('images', 'gallery');
    }
}
