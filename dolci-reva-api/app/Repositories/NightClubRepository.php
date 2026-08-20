<?php

namespace App\Repositories;

use App\Models\NightClub;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\UploadedFile;

class NightClubRepository
{
    use \App\Traits\AppliesPublicListingFilters;

    /**
     * @var NightClub
     */
    protected NightClub $nightClub;

    public function __construct(NightClub $nightClub)
    {
        $this->nightClub = $nightClub;
    }

    /**
     * Get all night clubs.
     */
    public function all()
    {
        return $this->nightClub->with(['owner', 'areas.featureOptions', 'media', 'featureOptions'])->latest()->get();
    }

    /**
     * Get all night clubs with pagination.
     */
    public function paginate(int $perPage = 15, ?int $ownerId = null)
    {
        return $this->nightClub->with(['owner', 'areas.featureOptions', 'media', 'featureOptions'])->when($ownerId, fn ($q) => $q->where('owner_id', $ownerId))->latest()->paginate($perPage);
    }

    /**
     * Get night club by id.
     */
    public function getById(int $id)
    {
        return $this->nightClub->with(['owner', 'areas.featureOptions', 'media', 'featureOptions'])->find($id);
    }

    /**
     * Save night club.
     */
    public function save(array $data)
    {
        // Add owner_id from authenticated user
        $data['owner_id'] = Auth::id();

        // Separate images, feature options and area_feature options from main data
        $images = $data['images'] ?? [];
        $featureOptionIds = $data['feature_option_ids'] ?? [];
        $areaFeatureOptions = $data['area_feature_options'] ?? [];

        // Remove images, feature options and area_feature options from main data
        unset($data['images'], $data['feature_option_ids'], $data['area_feature_options']);

        // Create the night club
        $nightClub = NightClub::create($data);

        // Handle images with Media Library
        if (is_array($images) && count($images) > 0 && collect($images)->filter()->isNotEmpty()) {
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    // First image goes to 'images' collection (main image)
                    // Others go to 'gallery' collection
                    $collection = $index === 0 ? 'images' : 'gallery';
                    $nightClub->addMediaFromRequest("images.{$index}")
                        ->toMediaCollection($collection);
                }
            }
        }

        // Handle feature options
        if (is_array($featureOptionIds) && count($featureOptionIds) > 0) {
            $nightClub->featureOptions()->sync(array_values($featureOptionIds));
        }

        // Handle area feature options
        if (is_array($areaFeatureOptions) && count($areaFeatureOptions) > 0) {
            foreach ($areaFeatureOptions as $areaFeatureOption) {
                if (isset($areaFeatureOption['area_id']) && isset($areaFeatureOption['feature_option_ids'])) {
                    $area = $nightClub->areas()->find($areaFeatureOption['area_id']);
                    if ($area) {
                        $area->featureOptions()->sync(array_values($areaFeatureOption['feature_option_ids']));
                    }
                }
            }
        }

        return $nightClub->load('owner', 'areas.featureOptions', 'media', 'featureOptions');
    }

    /**
     * Update night club.
     */
    public function update(array $data, int $id)
    {
        $nightClub = $this->nightClub->find($id);

        if (!$nightClub) {
            return null;
        }

        // Separate images, feature options and area_feature options from main data
        $images = $data['images'] ?? null;
        $featureOptionIds = $data['feature_option_ids'] ?? null;
        $areaFeatureOptions = $data['area_feature_options'] ?? null;

        // Remove images, feature options and area_feature options from main data
        unset($data['images'], $data['feature_option_ids'], $data['area_feature_options']);

        // Update the night club
        $nightClub->update($data);

        // Handle images if provided with Media Library
        if (is_array($images) && count($images) > 0 && collect($images)->filter()->isNotEmpty()) {
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    // First image goes to 'images' collection (main image)
                    // Others go to 'gallery' collection
                    $collection = $index === 0 ? 'images' : 'gallery';
                    $nightClub->addMediaFromRequest("images.{$index}")
                        ->toMediaCollection($collection);
                }
            }
        }

        // Handle feature options if provided
        if ($featureOptionIds !== null) {
            $nightClub->featureOptions()->sync(array_values($featureOptionIds));
        }

        // Handle area feature options if provided
        if ($areaFeatureOptions !== null && is_array($areaFeatureOptions) && count($areaFeatureOptions) > 0) {
            foreach ($areaFeatureOptions as $areaFeatureOption) {
                if (isset($areaFeatureOption['area_id']) && isset($areaFeatureOption['feature_option_ids'])) {
                    $area = $nightClub->areas()->find($areaFeatureOption['area_id']);
                    if ($area) {
                        $area->featureOptions()->sync(array_values($areaFeatureOption['feature_option_ids']));
                    }
                }
            }
        }

        return $nightClub->load('owner', 'areas.featureOptions', 'media', 'featureOptions');
    }

    /**
     * Delete night club by id.
     */
    public function delete(int $id)
    {
        $nightClub = $this->nightClub->find($id);
        if ($nightClub) {
            return $nightClub->delete();
        }
        return false;
    }


    /**
     * Get available night clubs with optional public filters.
     *
     * @param  array{search?: string, city?: string}  $filters
     */
    public function getAvailable(array $filters = [])
    {
        $query = $this->nightClub->with(['owner', 'areas.featureOptions', 'media', 'featureOptions'])
            ->where('is_active', true);

        $this->applyPublicListingFilters($query, $filters);

        return $query->latest()->get();
    }

    /**
     * Get available areas for a night club on a specific date and time.
     */
    public function getAvailableAreas(int $nightClubId, string $date, string $time, int $guests)
    {
        $nightClub = $this->getById($nightClubId);
        
        if (!$nightClub) {
            return collect();
        }

        return $nightClub->getAvailableAreas($date, $time, $guests);
    }

    /**
     * Get recommended areas for a night club.
     */
    public function getRecommendedAreas(int $nightClubId, string $date, string $time, int $guests, string $preference = null)
    {
        $nightClub = $this->getById($nightClubId);
        
        if (!$nightClub) {
            return collect();
        }

        return $nightClub->getRecommendedAreas($date, $time, $guests, $preference);
    }

    /**
     * Add media to night club using Media Library
     */
    public function addMedia(int $nightClubId, UploadedFile $file, string $collection = 'gallery')
    {
        $nightClub = $this->nightClub->findOrFail($nightClubId);
        return $nightClub->addMediaFromRequest('file')
            ->toMediaCollection($collection);
    }

    /**
     * Clear media collection for night club
     */
    public function clearMediaCollection(int $nightClubId, string $collection)
    {
        $nightClub = $this->nightClub->findOrFail($nightClubId);
        $nightClub->clearMediaCollection($collection);
        return true;
    }

    /**
     * Get night club with media data
     */
    public function getWithMedia(int $id)
    {
        return $this->nightClub->with(['owner', 'areas.featureOptions', 'media', 'featureOptions'])
            ->findOrFail($id);
    }
}
