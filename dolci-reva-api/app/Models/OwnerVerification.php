<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class OwnerVerification extends Model implements HasMedia
{
    use HasFactory, SoftDeletes, InteractsWithMedia;

    protected $fillable = [
        'user_id',
        'document_type',
        'identity_document_type',
        'document_number',
        'document_issue_date',
        'document_expiry_date',
        'issuing_authority',
        'status',
        'rejection_reason',
        'reviewed_by',
        'reviewed_at',
        'notes',
    ];

    protected $casts = [
        'document_issue_date' => 'date',
        'document_expiry_date' => 'date',
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('document')
            ->acceptsMimeTypes(array_merge(\App\Support\ImageUploadRules::MIME_TYPES, ['application/pdf']))
            ->singleFile();
    }

    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
            ->width(300)->height(200)->sharpen(10)
            ->performOnCollections('document');
    }
}
