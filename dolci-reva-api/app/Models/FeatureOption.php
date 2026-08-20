<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

/**
 * Option sélectionnable au sein d'une FeatureCategory (ex: "Vue sur la ville"
 * dans la catégorie "Vues"). L'utilisateur ne fait que cocher parmi les
 * options existantes ; la création/modification des options est réservée
 * à l'admin (cf. FeatureOptionController).
 */
class FeatureOption extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'feature_category_id',
        'name',
        'has_surcharge',
        'display_order',
    ];

    protected $casts = [
        'has_surcharge' => 'boolean',
        'display_order' => 'integer',
    ];

    public function category()
    {
        return $this->belongsTo(FeatureCategory::class, 'feature_category_id');
    }
}
