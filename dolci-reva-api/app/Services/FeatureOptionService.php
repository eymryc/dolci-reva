<?php

namespace App\Services;

use App\Repositories\FeatureOptionRepository;
use Exception;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class FeatureOptionService
{
    /**
     * @var FeatureOptionRepository
     */
    protected $featureOptionRepository;

    public function __construct(FeatureOptionRepository $featureOptionRepository)
    {
        $this->featureOptionRepository = $featureOptionRepository;
    }

    public function getAll()
    {
        return $this->featureOptionRepository->all();
    }

    public function getById(int $id)
    {
        return $this->featureOptionRepository->getById($id);
    }

    public function save(array $data)
    {
        return $this->featureOptionRepository->save($data);
    }

    public function update(array $data, int $id)
    {
        DB::beginTransaction();
        try {
            $option = $this->featureOptionRepository->update($data, $id);
            DB::commit();
            return $option;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to update feature option');
        }
    }

    public function deleteById(int $id)
    {
        DB::beginTransaction();
        try {
            $result = $this->featureOptionRepository->delete($id);
            DB::commit();
            return $result;
        } catch (Exception $e) {
            DB::rollBack();
            report($e);
            throw new InvalidArgumentException('Unable to delete feature option');
        }
    }
}
