<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class BusinessType extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'icon'
    ];


    /**
     * The users that belong to the category.
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'business_type_user');
    }
}
