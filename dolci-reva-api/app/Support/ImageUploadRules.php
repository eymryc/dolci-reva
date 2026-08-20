<?php

namespace App\Support;

/**
 * Formats image acceptés partout (établissements, médias) — tous sauf GIF.
 */
final class ImageUploadRules
{
    /** Extensions Laravel `mimes:` (sans gif). */
    public const MIMES = 'jpeg,jpg,png,webp,bmp,svg,heic,heif,avif,tif,tiff';

    /** MIME types Spatie Media Library (sans image/gif). */
    public const MIME_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/bmp',
        'image/svg+xml',
        'image/heic',
        'image/heif',
        'image/avif',
        'image/tiff',
    ];

    /**
     * Règle formulaire : `file` (pas `image`) pour accepter HEIC/AVIF
     * que getimagesize / la règle image rejettent souvent.
     */
    public static function file(int $maxKilobytes = 5120): string
    {
        return 'file|mimes:'.self::MIMES.'|max:'.$maxKilobytes;
    }

    public static function messages(string $prefix = 'images.*', int $maxMb = 5): array
    {
        return [
            "{$prefix}.file" => 'Chaque fichier doit être une image.',
            "{$prefix}.mimes" => 'Les images doivent être au format : jpeg, png, jpg, webp, bmp, svg, heic, heif, avif ou tiff (pas de GIF).',
            "{$prefix}.max" => "Chaque image ne peut pas dépasser {$maxMb} Mo.",
        ];
    }
}
