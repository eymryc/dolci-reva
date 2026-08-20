<?php

namespace App\Models;

use App\Traits\HasMediaTrait;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class RestaurantMenuItem extends Model implements HasMedia
{
    use HasFactory, InteractsWithMedia, HasMediaTrait;

    protected $fillable = [
        'restaurant_id',
        'category_id',
        'name',
        'description',
        'price',
        'currency',
        'is_available',
        'is_active',
        'popularity_score',
        'total_orders',
        'preparation_time',
        'spice_level',
        'is_vegetarian',
        'is_vegan',
        'is_gluten_free',
        'is_halal',
        'allergens',
        'nutritional_info',
        'ingredients',
        'variants',
        'options',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_available' => 'boolean',
        'is_active' => 'boolean',
        'is_vegetarian' => 'boolean',
        'is_vegan' => 'boolean',
        'is_gluten_free' => 'boolean',
        'is_halal' => 'boolean',
        'allergens' => 'array',
        'nutritional_info' => 'array',
        'ingredients' => 'array',
        'variants' => 'array',
        'options' => 'array',
    ];

    public function restaurant(): BelongsTo
    {
        return $this->belongsTo(Restaurant::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(RestaurantMenuCategory::class, 'category_id');
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
