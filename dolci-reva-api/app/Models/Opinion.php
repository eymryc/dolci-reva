<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Opinion extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'residence_id',
        'comment',
        'display',
        'note'
    ];

    /**
     * Get the user that owns the opinion.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the residence that the opinion belongs to.
     */
    public function residence()
    {
        return $this->belongsTo(Residence::class);
    }
}

