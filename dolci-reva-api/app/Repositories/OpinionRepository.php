<?php
namespace App\Repositories;

use App\Models\Opinion;
use Illuminate\Support\Facades\Auth;

class OpinionRepository
{
	 /**
     * @var Opinion
     */
    protected Opinion $opinion;

    /**
     * OpinionRepository constructor.
     *
     * @param Opinion $opinion
     */
    public function __construct(Opinion $opinion)
    {
        $this->opinion = $opinion;
    }

    /**
     * Get all opinions.
     *
     * @return Opinion $opinion
     */
    public function all()
    {
        return $this->opinion->with(['user', 'residence'])->latest()->get();
    }

    /**
     * Get all opinions with pagination.
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15)
    {
        return $this->opinion->with(['user', 'residence'])->latest()->paginate($perPage);
    }

     /**
     * Get opinion by id
     *
     * @param $id
     * @return mixed
     */
    public function getById(int $id)
    {
        return $this->opinion->with(['user', 'residence'])->find($id);
    }


    public function getAllOpinionsById(int $id)
    {   
        // Get the opinions
        $opinions = $this->opinion->orderBy('created_at', 'desc')->where('residence_id', $id)->with(['user', 'residence'])->get();

        // Return the opinions
        return $opinions;
    }

    /**
     * Save Opinion
     *
     * @param $data
     * @return Opinion
     */
     public function save(array $data)
    {   
        // Find the authenticated user
        $data['user_id'] = Auth::id();

        // Create the opinion
        $opinion = $this->opinion->create($data);

        // Load the relations and return the opinion
        return $opinion->load(['user', 'residence']);
    }

     /**
     * Update Opinion
     *
     * @param $data
     * @return Opinion
     */
    public function update(array $data, int $id)
    {   
        // Find the authenticated user
        $data['user_id'] = Auth::id();

        // Update the opinion   
        $opinion = $this->opinion->find($id);

        if (!$opinion) {
            throw new \Exception('Opinion not found');
        }

        // Update the opinion
        $opinion->update($data);

        // Load the relations and return the opinion
        return $opinion->load(['user', 'residence']);
    }

    /**
     * Delete Opinion
     *
     * @param $data
     * @return Opinion
     */
   	 public function delete(int $id)
    {
        $opinion = $this->opinion->find($id);
        $opinion->delete();
        return $opinion;
    }
}

