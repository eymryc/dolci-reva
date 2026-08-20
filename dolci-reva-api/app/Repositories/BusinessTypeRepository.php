<?php
namespace App\Repositories;

use App\Models\BusinessType;

class BusinessTypeRepository
{
	 /**
     * @var BusinessType
     */
    protected BusinessType $category;

    /**
     * BusinessType constructor.
     *
     * @param BusinessType $category
     */
    public function __construct(BusinessType $category)
    {
        $this->category = $category;
    }

    /**
     * Get all category.
     *
     * @return BusinessType $category
     */
    public function all()
    {
        return $this->category->latest()->get();
    }

    /**
     * Get all category with pagination.
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15)
    {
        return $this->category->latest()->paginate($perPage);
    }

     /**
     * Get category by id
     *
     * @param $id
     * @return mixed
     */
    public function getById(int $id)
    {
        return $this->category->find($id);
    }

    /**
     * Save BusinessType
     *
     * @param $data
     * @return BusinessType
     */
     public function save(array $data)
    {   
        return BusinessType::create($data);
    }

     /**
     * Update BusinessType
     *
     * @param $data
     * @return BusinessType
     */
    public function update(array $data, int $id)
    {
        $category = $this->category->find($id);
        $category->update($data);
        return $category;
    }

    /**
     * Delete BusinessType
     *
     * @param $data
     * @return BusinessType
     */
   	 public function delete(int $id)
    {
        $category = $this->category->find($id);
        $category->delete();
        return $category;
    }
}
