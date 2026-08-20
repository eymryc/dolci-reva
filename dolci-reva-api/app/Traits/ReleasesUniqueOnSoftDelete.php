<?php

namespace App\Traits;

/**
 * Libère les colonnes uniques avant un soft delete pour permettre
 * de recréer une ressource avec les mêmes identifiants.
 *
 * Définir sur le modèle : protected array $uniqueOnSoftDelete = ['email', 'phone'];
 */
trait ReleasesUniqueOnSoftDelete
{
    public static function bootReleasesUniqueOnSoftDelete(): void
    {
        static::deleting(function ($model) {
            if (method_exists($model, 'isForceDeleting') && $model->isForceDeleting()) {
                return;
            }

            $columns = property_exists($model, 'uniqueOnSoftDelete')
                ? $model->uniqueOnSoftDelete
                : [];

            if ($columns === []) {
                return;
            }

            $dirty = false;
            foreach ($columns as $column) {
                $value = $model->getAttribute($column);
                if ($value === null || $value === '') {
                    continue;
                }

                $released = static::releaseUniqueValue($column, (string) $value, $model->getKey());
                if ($released !== $value) {
                    $model->setAttribute($column, $released);
                    $dirty = true;
                }
            }

            if ($dirty) {
                $model->saveQuietly();
            }
        });
    }

    /**
     * Préfixe un identifiant unique déjà soft-supprimé pour libérer la contrainte.
     */
    public static function releaseUniqueValue(string $column, string $value, int|string $id): string
    {
        $prefix = "deleted_{$id}_";
        if (str_starts_with($value, $prefix)) {
            return $value;
        }

        $max = 255;
        $suffix = $value;
        $maxSuffix = max(1, $max - strlen($prefix));
        if (strlen($suffix) > $maxSuffix) {
            $suffix = substr($suffix, -$maxSuffix);
        }

        return $prefix.$suffix;
    }

    /**
     * Libère email/phone/slug… encore bloqués par d'anciennes lignes soft-deleted.
     */
    public static function releaseTrashedConflicts(array $attributes): void
    {
        $instance = new static;
        $columns = property_exists($instance, 'uniqueOnSoftDelete')
            ? $instance->uniqueOnSoftDelete
            : [];

        if ($columns === [] || $attributes === []) {
            return;
        }

        $query = static::onlyTrashed();
        $query->where(function ($q) use ($columns, $attributes) {
            foreach ($columns as $column) {
                if (! empty($attributes[$column])) {
                    $q->orWhere($column, $attributes[$column]);
                }
            }
        });

        foreach ($query->get() as $trashed) {
            $dirty = false;
            foreach ($columns as $column) {
                $value = $trashed->getAttribute($column);
                if ($value === null || $value === '') {
                    continue;
                }
                if (! empty($attributes[$column]) && $value === $attributes[$column]) {
                    $trashed->setAttribute(
                        $column,
                        static::releaseUniqueValue($column, (string) $value, $trashed->getKey())
                    );
                    $dirty = true;
                }
            }
            if ($dirty) {
                $trashed->saveQuietly();
            }
        }
    }
}
