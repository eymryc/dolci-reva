<?php

namespace App\Repositories;

use App\Models\Restaurant;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\UploadedFile;

class RestaurantRepository
{
    use \App\Traits\AppliesPublicListingFilters;

    /**
     * @var Restaurant
     */
    protected Restaurant $restaurant;

    public function __construct(Restaurant $restaurant)
    {
        $this->restaurant = $restaurant;
    }

    /**
     * Get all restaurants.
     */
    public function all()
    {
        return $this->restaurant->with(['owner', 'tables', 'media', 'featureOptions'])->latest()->get();
    }

    /**
     * Get all restaurants with pagination.
     */
    public function paginate(int $perPage = 15, ?int $ownerId = null)
    {
        return $this->restaurant->with(['owner', 'tables', 'media', 'featureOptions'])->when($ownerId, fn ($q) => $q->where('owner_id', $ownerId))->latest()->paginate($perPage);
    }

    /**
     * Get restaurant by id.
     */
    public function getById(int $id)
    {
        return $this->restaurant->with(['owner', 'tables', 'media', 'featureOptions'])->find($id);
    }

    /**
     * Save restaurant.
     */
    public function save(array $data)
    {
        // Add owner_id from authenticated user
        $data['owner_id'] = Auth::id();

        // Separate images and feature options from main data
        $images = $data['images'] ?? [];
        $featureOptionIds = $data['feature_option_ids'] ?? [];

        // Remove images and feature options from main data
        unset($data['images'], $data['feature_option_ids']);

        // Create the restaurant
        $restaurant = Restaurant::create($data);

        // Handle images with Media Library
        if (is_array($images) && count($images) > 0 && collect($images)->filter()->isNotEmpty()) {
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    // First image goes to 'images' collection (main image)
                    // Others go to 'gallery' collection
                    $collection = $index === 0 ? 'images' : 'gallery';
                    $restaurant->addMediaFromRequest("images.{$index}")
                        ->toMediaCollection($collection);
                }
            }
        }

        // Handle feature options
        if (is_array($featureOptionIds) && count($featureOptionIds) > 0) {
            $restaurant->featureOptions()->sync(array_values($featureOptionIds));
        }

        return $restaurant->load('owner', 'tables', 'media', 'featureOptions');
    }

    /**
     * Update restaurant.
     */
    public function update(array $data, int $id)
    {
        $restaurant = $this->restaurant->find($id);

        if (!$restaurant) {
            return null;
        }

        // Separate images and feature options from main data
        $images = $data['images'] ?? null;
        $featureOptionIds = $data['feature_option_ids'] ?? null;

        // Remove images and feature options from main data
        unset($data['images'], $data['feature_option_ids']);

        // Update the restaurant
        $restaurant->update($data);

        // Handle images if provided with Media Library
        if (is_array($images) && count($images) > 0 && collect($images)->filter()->isNotEmpty()) {
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    // First image goes to 'images' collection (main image)
                    // Others go to 'gallery' collection
                    $collection = $index === 0 ? 'images' : 'gallery';
                    $restaurant->addMediaFromRequest("images.{$index}")
                        ->toMediaCollection($collection);
                }
            }
        }

        // Handle feature options if provided
        if ($featureOptionIds !== null) {
            $restaurant->featureOptions()->sync(array_values($featureOptionIds));
        }

        return $restaurant->load('owner', 'tables', 'media', 'featureOptions');
    }

    /**
     * Delete restaurant by id.
     */
    public function delete(int $id)
    {
        $restaurant = $this->restaurant->find($id);
        if ($restaurant) {
            return $restaurant->delete();
        }
        return false;
    }


    /**
     * Get available restaurants with optional public filters.
     *
     * @param  array{search?: string, city?: string}  $filters
     */
    public function getAvailable(array $filters = [])
    {
        $query = $this->restaurant->with(['owner', 'tables', 'media', 'featureOptions'])
            ->where('is_active', true);

        $this->applyPublicListingFilters($query, $filters);

        return $query->latest()->get();
    }

    /**
     * Get available tables for a restaurant on a specific date and time.
     */
    public function getAvailableTables(int $restaurantId, string $date, string $time, int $guests)
    {
        $restaurant = $this->getById($restaurantId);
        
        if (!$restaurant) {
            return collect();
        }

        return $restaurant->getAvailableTables($date, $time, $guests);
    }

    /**
     * Add media to restaurant using Media Library
     */
    public function addMedia(int $restaurantId, UploadedFile $file, string $collection = 'gallery')
    {
        $restaurant = $this->restaurant->findOrFail($restaurantId);
        return $restaurant->addMediaFromRequest('file')
            ->toMediaCollection($collection);
    }

    /**
     * Clear media collection for restaurant
     */
    public function clearMediaCollection(int $restaurantId, string $collection)
    {
        $restaurant = $this->restaurant->findOrFail($restaurantId);
        $restaurant->clearMediaCollection($collection);
        return true;
    }

    /**
     * Get restaurant with media data
     */
    public function getWithMedia(int $id)
    {
        return $this->restaurant->with(['owner', 'tables', 'media', 'featureOptions'])
            ->findOrFail($id);
    }
}
