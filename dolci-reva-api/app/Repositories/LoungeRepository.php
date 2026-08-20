<?php

namespace App\Repositories;

use App\Models\Lounge;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\UploadedFile;

class LoungeRepository
{
    use \App\Traits\AppliesPublicListingFilters;

    /**
     * @var Lounge
     */
    protected Lounge $lounge;

    public function __construct(Lounge $lounge)
    {
        $this->lounge = $lounge;
    }

    /**
     * Get all lounges.
     */
    public function all()
    {
        return $this->lounge->with(['owner', 'tables', 'media', 'featureOptions'])->latest()->get();
    }

    /**
     * Get all lounges with pagination.
     */
    public function paginate(int $perPage = 15, ?int $ownerId = null)
    {
        return $this->lounge->with(['owner', 'tables', 'media', 'featureOptions'])->when($ownerId, fn ($q) => $q->where('owner_id', $ownerId))->latest()->paginate($perPage);
    }

    /**
     * Get lounge by id.
     */
    public function getById(int $id)
    {
        return $this->lounge->with(['owner', 'tables', 'media', 'featureOptions'])->find($id);
    }

    /**
     * Save lounge.
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

        // Create the lounge
        $lounge = Lounge::create($data);

        // Handle images with Media Library
        if (is_array($images) && count($images) > 0 && collect($images)->filter()->isNotEmpty()) {
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    // First image goes to 'images' collection (main image)
                    // Others go to 'gallery' collection
                    $collection = $index === 0 ? 'images' : 'gallery';
                    $lounge->addMediaFromRequest("images.{$index}")
                        ->toMediaCollection($collection);
                }
            }
        }

        // Handle feature options
        if (is_array($featureOptionIds) && count($featureOptionIds) > 0) {
            $lounge->featureOptions()->sync(array_values($featureOptionIds));
        }

        return $lounge->load('owner', 'tables', 'media', 'featureOptions');
    }

    /**
     * Update lounge.
     */
    public function update(array $data, int $id)
    {
        $lounge = $this->lounge->find($id);

        if (!$lounge) {
            return null;
        }

        // Separate images and feature options from main data
        $images = $data['images'] ?? null;
        $featureOptionIds = $data['feature_option_ids'] ?? null;

        // Remove images and feature options from main data
        unset($data['images'], $data['feature_option_ids']);

        // Update the lounge
        $lounge->update($data);

        // Handle images if provided with Media Library
        if (is_array($images) && count($images) > 0 && collect($images)->filter()->isNotEmpty()) {
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    // First image goes to 'images' collection (main image)
                    // Others go to 'gallery' collection
                    $collection = $index === 0 ? 'images' : 'gallery';
                    $lounge->addMediaFromRequest("images.{$index}")
                        ->toMediaCollection($collection);
                }
            }
        }

        // Handle feature options if provided
        if ($featureOptionIds !== null) {
            $lounge->featureOptions()->sync(array_values($featureOptionIds));
        }

        return $lounge->load('owner', 'tables', 'media', 'featureOptions');
    }

    /**
     * Delete lounge by id.
     */
    public function delete(int $id)
    {
        $lounge = $this->lounge->find($id);
        if ($lounge) {
            return $lounge->delete();
        }
        return false;
    }


    /**
     * Get available lounges.
     */
    public function getAvailable()
    {
        return $this->lounge->with(['owner', 'tables', 'media', 'featureOptions'])
            ->where('is_active', true)
            ->where('venue_type', 'LOUNGE')
            ->get();
    }

    /**
     * Get public lounges with optional filters.
     */
    public function getPublicAll(array $filters = [])
    {
        $query = $this->lounge->with(['owner', 'tables', 'media', 'featureOptions'])
            ->where('is_active', true)
            ->where('venue_type', 'LOUNGE');

        $this->applyPublicListingFilters($query, $filters);

        return $query->latest()->get();
    }

    /**
     * Get available bars (lounges with venue_type=BAR).
     */
    public function getAvailableBars()
    {
        return $this->lounge->with(['owner', 'tables', 'media', 'featureOptions'])
            ->where('is_active', true)
            ->where('venue_type', 'BAR')
            ->get();
    }

    /**
     * Get public bars with optional filters.
     */
    public function getPublicBars(array $filters = [])
    {
        $query = $this->lounge->with(['owner', 'tables', 'media', 'featureOptions'])
            ->where('is_active', true)
            ->where('venue_type', 'BAR');

        $this->applyPublicListingFilters($query, $filters);

        return $query->latest()->get();
    }

    /**
     * Get all bars with pagination.
     */
    public function paginateBars(int $perPage = 15, ?int $ownerId = null)
    {
        return $this->lounge->with(['owner', 'tables', 'media', 'featureOptions'])
            ->where('venue_type', 'BAR')->when($ownerId, fn ($q) => $q->where('owner_id', $ownerId))->latest()->paginate($perPage);
    }

    /**
     * Get available tables for a lounge on a specific date and time.
     */
    public function getAvailableTables(int $loungeId, string $date, string $time, int $guests)
    {
        $lounge = $this->getById($loungeId);
        
        if (!$lounge) {
            return collect();
        }

        return $lounge->getAvailableTables($date, $time, $guests);
    }

    /**
     * Get recommended tables for a lounge.
     */
    public function getRecommendedTables(int $loungeId, string $date, string $time, int $guests, string $preference = null)
    {
        $lounge = $this->getById($loungeId);
        
        if (!$lounge) {
            return collect();
        }

        return $lounge->getRecommendedTables($date, $time, $guests, $preference);
    }

    /**
     * Add media to lounge using Media Library
     */
    public function addMedia(int $loungeId, UploadedFile $file, string $collection = 'gallery')
    {
        $lounge = $this->lounge->findOrFail($loungeId);
        return $lounge->addMediaFromRequest('file')
            ->toMediaCollection($collection);
    }

    /**
     * Clear media collection for lounge
     */
    public function clearMediaCollection(int $loungeId, string $collection)
    {
        $lounge = $this->lounge->findOrFail($loungeId);
        $lounge->clearMediaCollection($collection);
        return true;
    }

    /**
     * Get lounge with media data
     */
    public function getWithMedia(int $id)
    {
        return $this->lounge->with(['owner', 'tables', 'media', 'featureOptions'])
            ->findOrFail($id);
    }
}
