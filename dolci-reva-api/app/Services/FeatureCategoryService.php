<?php

namespace App\Services;

use App\Repositories\FeatureCategoryRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class FeatureCategoryService
{
    /**
     * @var FeatureCategoryRepository
     */
    protected $featureCategoryRepository;

    public function __construct(FeatureCategoryRepository $featureCategoryRepository)
    {
        $this->featureCategoryRepository = $featureCategoryRepository;
    }

    public function getAll(?string $establishmentType = null)
    {
        return $this->featureCategoryRepository->all($establishmentType);
    }

    public function getById(int $id)
    {
        return $this->featureCategoryRepository->getById($id);
    }

    public function save(array $data)
    {
        return $this->featureCategoryRepository->save($data);
    }

    public function update(array $data, int $id)
    {
        DB::beginTransaction();
        try {
            $category = $this->featureCategoryRepository->update($data, $id);
            DB::commit();
            return $category;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to update feature category');
        }
    }

    public function deleteById(int $id)
    {
        DB::beginTransaction();
        try {
            $result = $this->featureCategoryRepository->delete($id);
            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to delete feature category');
        }
    }
}
