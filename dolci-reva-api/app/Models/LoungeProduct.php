<?php

namespace App\Models;

use App\Traits\HasMediaTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class LoungeProduct extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, HasMediaTrait;

    protected $fillable = [
        'lounge_id',
        'category_id',
        'name',
        'description',
        'price',
        'currency',
        'is_available',
        'is_active',
        'popularity_score',
        'total_orders',
        'variants',
        'options',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'is_active' => 'boolean',
        'variants' => 'array',
        'options' => 'array',
    ];

    public function lounge(): BelongsTo
    {
        return $this->belongsTo(Lounge::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(LoungeProductCategory::class, 'category_id');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('images')
            ->singleFile()
            ->acceptsMimeTypes(\App\Support\ImageUploadRules::MIME_TYPES);

        $this->addMediaCollection('gallery')
            ->acceptsMimeTypes(\App\Support\ImageUploadRules::MIME_TYPES);
    }
}
