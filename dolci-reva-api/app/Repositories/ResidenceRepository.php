<?php

namespace App\Repositories;

use App\Models\Residence;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;

class ResidenceRepository
{
    /**
     * @var Residence
     */
    protected Residence $residence;

    /**
     * Residence constructor.
     *
     * @param Residence $residence
     */
    public function __construct(Residence $residence)
    {
        $this->residence = $residence;
    }

    /**
     * Get all residences.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function all(int $perPage = 15)
    {
        return $this->residence->with(['owner', 'featureOptions', 'media'])->latest()->paginate($perPage);
    }

    /**
     * Get all residences with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15, ?int $ownerId = null)
    {
        return $this->residence->with(['owner', 'featureOptions', 'media'])->when($ownerId, fn ($q) => $q->where('owner_id', $ownerId))->latest()->paginate($perPage);
    }

    /**
     * Get residence by id
     *
     * @param int $id
     * @return Residence|null
     */
    public function getById(int $id)
    {
        return $this->residence->with(['owner', 'featureOptions', 'media'])->find($id);
    }

    /**
     * Get available residences with advanced filtering and pagination
     *
     * @param Request $request
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function getAvailable(Request $request)
    {
        // Get and validate parameters
        $perPage = max(1, min(100, (int) $request->get('per_page', 15))); // Limit between 1-100
        $search = trim($request->get('search', ''));
        $city = trim($request->get('city', ''));
        $type = trim($request->get('type', ''));
        $standing = trim($request->get('standing', ''));
        $minPrice = $request->get('min_price');
        $maxPrice = $request->get('max_price');
        $minGuests = $request->get('min_guests');
        $maxGuests = $request->get('max_guests');
        $isAvailable = $request->get('is_available', null);
        $orderPrice = strtolower((string) $request->get('order_price', ''));
        $orderBy = $request->get('order_by', 'created_at'); // Default order
        $orderDirection = in_array(strtolower($request->get('order_direction', 'desc')), ['asc', 'desc']) 
            ? strtolower($request->get('order_direction', 'desc')) 
            : 'desc';
        $withOpinions = $request->boolean('with_opinions', false);

        // Build query with eager loading (optimized)
        $query = $this->residence->with(['owner:id,first_name,last_name,email', 'featureOptions', 'media']);

        // Add opinions relation if requested
        if ($withOpinions) {
            $query->with(['opinions' => function ($q) {
                $q->where('display', true)
                  ->orderBy('created_at', 'desc')
                  ->limit(5) // Limit to latest 5 opinions
                  ->with('user:id,first_name,last_name');
            }]);
        }

        // Base filter: only active residences
        $query->where('is_active', true);

        // Search filter (name, description, address)
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('description', 'LIKE', "%{$search}%")
                  ->orWhere('address', 'LIKE', "%{$search}%");
            });
        }

        // City filter
        if (!empty($city)) {
            $query->where('city', 'LIKE', "%{$city}%");
        }

        // Type filter
        if (!empty($type)) {
            $query->where('type', $type);
        }

        // Standing filter
        if (!empty($standing)) {
            $query->where('standing', $standing);
        }

        // Price range filters
        if ($minPrice !== null && $minPrice !== '') {
            $query->where('price', '>=', (float) $minPrice);
        }
        if ($maxPrice !== null && $maxPrice !== '') {
            $query->where('price', '<=', (float) $maxPrice);
        }

        // Guests range filters
        if ($minGuests !== null && $minGuests !== '') {
            $query->where('max_guests', '>=', (int) $minGuests);
        }
        if ($maxGuests !== null && $maxGuests !== '') {
            $query->where('max_guests', '<=', (int) $maxGuests);
        }

        // Bedrooms
        if ($request->filled('min_bedrooms')) {
            $query->where('bedrooms', '>=', (int) $request->get('min_bedrooms'));
        }

        // Availability filter
        if ($isAvailable !== null && $isAvailable !== '') {
            $query->where('is_available', filter_var($isAvailable, FILTER_VALIDATE_BOOLEAN));
        }

        // Ordering — honor order_price even when order_by is omitted
        if ($request->filled('order_price') || $orderBy === 'price') {
            $query->orderBy('price', $orderPrice === 'desc' ? 'desc' : 'asc');
        } elseif ($orderBy === 'rating') {
            $query->orderBy('average_rating', $orderDirection);
        } elseif ($orderBy === 'name') {
            $query->orderBy('name', $orderDirection);
        } else {
            // Default: order by created_at
            $query->orderBy('created_at', $orderDirection);
        }

        // Secondary ordering for consistency
        $query->orderBy('id', 'asc');

        // Execute paginated query
        return $query->paginate($perPage);
    }

    /**
     * Save Residence
     *
     * @param array $data
     * @return Residence
     */
    public function save(array $data)
    {
        // Assure that the owner_id is set to the currently authenticated user's ID
        $data['owner_id'] = Auth::id();

        // Extract images and feature options from the data array
        $images = $data['images'] ?? [];
        $featureOptionIds = $data['feature_option_ids'] ?? [];

        // Remove images and feature options from the data array
        unset($data['images'], $data['feature_option_ids']);

        // Create the residence
        $residence = Residence::create($data);

        // Handle images if provided using Media Library
        if (is_array($images) && count($images) > 0 && collect($images)->filter()->isNotEmpty()) {
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    // First image goes to 'images' collection (main image)
                    // Others go to 'gallery' collection
                    $collection = $index === 0 ? 'images' : 'gallery';
                    $residence->addMediaFromRequest("images.{$index}")
                        ->toMediaCollection($collection);
                }
            }
        }

        // Attach feature options if provided
        if (is_array($featureOptionIds) && count($featureOptionIds) > 0) {
            $residence->featureOptions()->sync(array_values($featureOptionIds));
        }

        // Return the created residence with its relations
        return $residence->load(['owner', 'featureOptions', 'media']);
    }

    /**
     * Update Residence
     *
     * @param array $data
     * @param int $id
     * @return Residence
     */
    public function update(array $data, int $id)
    {
        // Find the residence by ID
        $residence = $this->residence->find($id);
        if (!$residence) {
            throw new \Exception('Residence not found');
        }

        // Extract images and feature options from the data array
        $images = $data['images'] ?? [];
        $featureOptionIds = $data['feature_option_ids'] ?? [];

        // Remove images and feature options from the data array
        unset($data['images'], $data['feature_option_ids']);

        // Update the residence
        $residence->update($data);

        // Handle images if provided using Media Library
        if (is_array($images) && count($images) > 0 && collect($images)->filter()->isNotEmpty()) {
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    // First image goes to 'images' collection (main image)
                    // Others go to 'gallery' collection
                    $collection = $index === 0 ? 'images' : 'gallery';
                    $residence->addMediaFromRequest("images.{$index}")
                        ->toMediaCollection($collection);
                }
            }
        }

        // Sync feature options if provided
        if (is_array($featureOptionIds)) {
            $residence->featureOptions()->sync(array_values($featureOptionIds));
        }

        // Return the updated residence with its relations
        return $residence->load(['owner', 'featureOptions', 'media']);
    }

    /**
     * Delete Residence
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id)
    {
        $residence = $this->residence->find($id);
        if (!$residence) {
            throw new \Exception('Residence not found');
        }
        
        return $residence->delete();
    }

    /**
     * Delete Residence by ID (alias for delete)
     *
     * @param int $id
     * @return bool
     */
    public function deleteById(int $id)
    {
        return $this->delete($id);
    }

    /**
     * Add media to residence using Media Library
     *
     * @param int $residenceId
     * @param UploadedFile $file
     * @param string $collection
     * @return \Spatie\MediaLibrary\MediaCollections\Models\Media
     */
    public function addMedia(int $residenceId, UploadedFile $file, string $collection = 'gallery')
    {
        $residence = $this->residence->findOrFail($residenceId);
        return $residence->addMediaFromRequest('file')
            ->toMediaCollection($collection);
    }

    /**
     * Clear media collection for residence
     *
     * @param int $residenceId
     * @param string $collection
     * @return bool
     */
    public function clearMediaCollection(int $residenceId, string $collection)
    {
        $residence = $this->residence->findOrFail($residenceId);
        $residence->clearMediaCollection($collection);
        return true;
    }

    /**
     * Get residence with media data
     *
     * @param int $id
     * @return Residence
     */
    public function getWithMedia(int $id)
    {
        return $this->residence->with(['owner', 'featureOptions', 'media'])
            ->findOrFail($id);
    }
}
