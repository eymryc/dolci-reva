<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LoungeProductCategory extends Model
{
    use HasFactory;

    protected $fillable = [
        'lounge_id',
        'name',
        'description',
    ];

    public function lounge(): BelongsTo
    {
        return $this->belongsTo(Lounge::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(LoungeProduct::class, 'category_id');
    }
}
