<?php

namespace App\Repositories;

use App\Enums\EstablishmentType;
use App\Models\FeatureCategory;
use Illuminate\Support\Str;

class FeatureCategoryRepository
{
    /**
     * @var FeatureCategory
     */
    protected FeatureCategory $category;

    public function __construct(FeatureCategory $category)
    {
        $this->category = $category;
    }

    /**
     * Get all feature categories with their options, ordered for display.
     * Optionally filtered by establishment type.
     */
    public function all(?string $establishmentType = null)
    {
        $query = $this->category->with('options')->orderBy('display_order');

        if ($establishmentType !== null) {
            $type = EstablishmentType::fromName($establishmentType);
            if ($type !== null) {
                $query->whereJsonContains('establishment_types', $type->value);
            }
        }

        return $query->get();
    }

    public function getById(int $id)
    {
        return $this->category->with('options')->find($id);
    }

    public function save(array $data): FeatureCategory
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name']);

        FeatureCategory::releaseTrashedConflicts($data);

        return FeatureCategory::create($data);
    }

    public function update(array $data, int $id): ?FeatureCategory
    {
        $category = $this->category->find($id);

        if (!$category) {
            return null;
        }

        if (isset($data['name']) && !isset($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $category->update($data);

        return $category;
    }

    public function delete(int $id): bool
    {
        $category = $this->category->find($id);

        if (!$category) {
            return false;
        }

        return (bool) $category->delete();
    }
}
