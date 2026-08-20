<?php

namespace App\Traits;

use Illuminate\Database\Eloquent\Builder;

trait AppliesPublicListingFilters
{
    /**
     * Apply shared public listing filters (search + city).
     *
     * @param  Builder  $query
     * @param  array{search?: string, city?: string}  $filters
     * @param  array<int, string>  $searchColumns
     */
    protected function applyPublicListingFilters(Builder $query, array $filters, array $searchColumns = ['name', 'description', 'address']): Builder
    {
        $search = trim((string) ($filters['search'] ?? ''));
        $city = trim((string) ($filters['city'] ?? ''));

        if ($search !== '') {
            $query->where(function (Builder $q) use ($search, $searchColumns) {
                foreach ($searchColumns as $index => $column) {
                    if ($index === 0) {
                        $q->where($column, 'LIKE', "%{$search}%");
                    } else {
                        $q->orWhere($column, 'LIKE', "%{$search}%");
                    }
                }
            });
        }

        if ($city !== '') {
            $query->where('city', 'LIKE', "%{$city}%");
        }

        return $query;
    }
}
