<?php

namespace App\Repositories;

use App\Models\Hotel;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;

class HotelRepository
{
    use \App\Traits\AppliesPublicListingFilters;

    /**
     * @var Hotel
     */
    protected $hotel;

    public function __construct(Hotel $hotel)
    {
        $this->hotel = $hotel;
    }

    /**
     * Get all hotels.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function all(int $perPage = 15)
    {
        return $this->hotel->with(['owner', 'hotelRooms', 'media', 'featureOptions'])->latest()->paginate($perPage);
    }

    /**
     * Get all hotels with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15, ?int $ownerId = null)
    {
        return $this->hotel->with(['owner', 'hotelRooms', 'media', 'featureOptions'])->when($ownerId, fn ($q) => $q->where('owner_id', $ownerId))->latest()->paginate($perPage);
    }

    /**
     * Get hotel by id.
     *
     * @param int $id
     * @return Hotel|null
     */
    public function getById(int $id)
    {
        return $this->hotel->with(['owner', 'hotelRooms', 'media', 'featureOptions'])->find($id);
    }

    /**
     * Save hotel.
     *
     * @param array $data
     * @return Hotel
     */
    public function save(array $data)
    {
        // Ajouter l'owner_id depuis l'utilisateur authentifié
        $data['owner_id'] = Auth::id();

        // Séparer les images et feature options des données principales
        $images = $data['images'] ?? [];
        $featureOptionIds = $data['feature_option_ids'] ?? [];

        // Retirer les images et feature options du tableau de données
        unset($data['images'], $data['feature_option_ids']);

        // Créer l'hôtel
        $hotel = Hotel::create($data);

        // Gérer les images avec Media Library
        if (is_array($images) && count($images) > 0 && collect($images)->filter()->isNotEmpty()) {
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    // First image goes to 'images' collection (main image)
                    // Others go to 'gallery' collection
                    $collection = $index === 0 ? 'images' : 'gallery';
                    $hotel->addMediaFromRequest("images.{$index}")
                        ->toMediaCollection($collection);
                }
            }
        }

        // Gérer les feature options
        if (is_array($featureOptionIds) && count($featureOptionIds) > 0) {
            $hotel->featureOptions()->sync(array_values($featureOptionIds));
        }

        return $hotel->load('owner', 'hotelRooms', 'media', 'featureOptions');
    }

    /**
     * Update hotel.
     *
     * @param array $data
     * @param int $id
     * @return Hotel|null
     */
    public function update(array $data, int $id)
    {
        $hotel = $this->hotel->find($id);

        if (!$hotel) {
            return null;
        }

        // Séparer les images et feature options des données principales
        $images = $data['images'] ?? null;
        $featureOptionIds = $data['feature_option_ids'] ?? null;

        // Retirer les images et feature options du tableau de données
        unset($data['images'], $data['feature_option_ids']);

        // Mettre à jour l'hôtel
        $hotel->update($data);

        // Gérer les images si fournies avec Media Library
        if (is_array($images) && count($images) > 0 && collect($images)->filter()->isNotEmpty()) {
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    // First image goes to 'images' collection (main image)
                    // Others go to 'gallery' collection
                    $collection = $index === 0 ? 'images' : 'gallery';
                    $hotel->addMediaFromRequest("images.{$index}")
                        ->toMediaCollection($collection);
                }
            }
        }

        // Gérer les feature options si fournies
        if ($featureOptionIds !== null) {
            $hotel->featureOptions()->sync(array_values($featureOptionIds));
        }

        return $hotel->load('owner', 'hotelRooms', 'media', 'featureOptions');
    }

    /**
     * Delete hotel by id.
     *
     * @param int $id
     * @return bool
     */
    public function deleteById(int $id)
    {
        $hotel = $this->hotel->find($id);
        if (!$hotel) {
            throw new \Exception('Hotel not found');
        }
        
        return $hotel->delete();
    }

    /**
     * Delete hotel (alias for deleteById)
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id)
    {
        return $this->deleteById($id);
    }

    /**
     * Get hotels by owner.
     *
     * @param int $ownerId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByOwner(int $ownerId)
    {
        return $this->hotel->with(['owner', 'hotelRooms', 'media', 'featureOptions'])
            ->where('owner_id', $ownerId)
            ->get();
    }

    /**
     * Get available hotels with optional public filters.
     *
     * @param  array{search?: string, city?: string, star_rating?: int|string}  $filters
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getAvailable(array $filters = [])
    {
        $query = $this->hotel->with(['owner', 'hotelRooms', 'media', 'featureOptions']);

        $this->applyPublicListingFilters($query, $filters);

        if (!empty($filters['star_rating'])) {
            $query->where('star_rating', (int) $filters['star_rating']);
        }

        return $query->latest()->get();
    }

    /**
     * Search hotels by criteria.
     *
     * @param array $criteria
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function search(array $criteria)
    {
        $query = $this->hotel->with(['owner', 'hotelRooms', 'media']);

        if (isset($criteria['city'])) {
            $query->where('city', 'like', '%' . $criteria['city'] . '%');
        }

        if (isset($criteria['country'])) {
            $query->where('country', 'like', '%' . $criteria['country'] . '%');
        }

        if (isset($criteria['star_rating'])) {
            $query->where('star_rating', $criteria['star_rating']);
        }

        return $query->get();
    }

    /**
     * Add media to hotel using Media Library
     *
     * @param int $hotelId
     * @param UploadedFile $file
     * @param string $collection
     * @return \Spatie\MediaLibrary\MediaCollections\Models\Media
     */
    public function addMedia(int $hotelId, UploadedFile $file, string $collection = 'gallery')
    {
        $hotel = $this->hotel->findOrFail($hotelId);
        return $hotel->addMediaFromRequest('file')
            ->toMediaCollection($collection);
    }

    /**
     * Clear media collection for hotel
     *
     * @param int $hotelId
     * @param string $collection
     * @return bool
     */
    public function clearMediaCollection(int $hotelId, string $collection)
    {
        $hotel = $this->hotel->findOrFail($hotelId);
        $hotel->clearMediaCollection($collection);
        return true;
    }

    /**
     * Get hotel with media data
     *
     * @param int $id
     * @return Hotel
     */
    public function getWithMedia(int $id)
    {
        return $this->hotel->with(['owner', 'hotelRooms', 'media', 'featureOptions'])
            ->findOrFail($id);
    }

}
