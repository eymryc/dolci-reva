<?php

namespace App\Repositories;

use App\Models\FeatureOption;

class FeatureOptionRepository
{
    /**
     * @var FeatureOption
     */
    protected FeatureOption $option;

    public function __construct(FeatureOption $option)
    {
        $this->option = $option;
    }

    public function all()
    {
        return $this->option->with('category')->orderBy('display_order')->get();
    }

    public function getById(int $id)
    {
        return $this->option->with('category')->find($id);
    }

    public function save(array $data): FeatureOption
    {
        return FeatureOption::create($data);
    }

    public function update(array $data, int $id): ?FeatureOption
    {
        $option = $this->option->find($id);

        if (!$option) {
            return null;
        }

        $option->update($data);

        return $option;
    }

    public function delete(int $id): bool
    {
        $option = $this->option->find($id);

        if (!$option) {
            return false;
        }

        return (bool) $option->delete();
    }
}
