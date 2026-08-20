<?php

use App\Models\FeatureCategory;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;

/**
 * Libère email/phone/slug encore bloqués par des soft-deletes antérieurs
 * (sinon les indexes UNIQUE empêchent toute recreation).
 */
return new class extends Migration
{
    public function up(): void
    {
        User::onlyTrashed()->each(function (User $user) {
            $dirty = false;
            foreach (['email', 'phone'] as $column) {
                $value = (string) $user->getAttribute($column);
                if ($value === '' || str_starts_with($value, "deleted_{$user->id}_")) {
                    continue;
                }
                $user->setAttribute(
                    $column,
                    User::releaseUniqueValue($column, $value, $user->id)
                );
                $dirty = true;
            }
            if ($dirty) {
                $user->saveQuietly();
            }
        });

        FeatureCategory::onlyTrashed()->each(function (FeatureCategory $category) {
            $value = (string) $category->slug;
            if ($value === '' || str_starts_with($value, "deleted_{$category->id}_")) {
                return;
            }
            $category->slug = FeatureCategory::releaseUniqueValue('slug', $value, $category->id);
            $category->saveQuietly();
        });
    }

    public function down(): void
    {
        // Irreversible data fix
    }
};
