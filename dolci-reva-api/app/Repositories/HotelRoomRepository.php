<?php

namespace App\Repositories;

use App\Models\HotelRoom;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;
use Illuminate\Http\UploadedFile;

class HotelRoomRepository
{
    /**
     * @var HotelRoom
     */
    protected HotelRoom $hotelRoom;

    /**
     * HotelRoomRepository constructor.
     *
     * @param HotelRoom $hotelRoom
     */
    public function __construct(HotelRoom $hotelRoom)
    {
        $this->hotelRoom = $hotelRoom;
    }

    /**
     * Get all hotel rooms.
     *
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function all()
    {
        return $this->hotelRoom->with(['hotel', 'featureOptions', 'media'])->latest()->get();
    }

    /**
     * Get all hotel rooms with pagination.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15)
    {
        return $this->hotelRoom->with(['hotel', 'featureOptions', 'media'])->latest()->paginate($perPage);
    }

    /**
     * Get hotel rooms by hotel ID.
     *
     * @param int $hotelId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getByHotelId(int $hotelId)
    {
        return $this->hotelRoom->where('hotel_id', $hotelId)->with(['hotel', 'featureOptions', 'media'])->get();
    }

    /**
     * Get hotel room by id
     *
     * @param int $id
     * @return HotelRoom|null
     */
    public function getById(int $id)
    {
        return $this->hotelRoom->with(['hotel', 'featureOptions', 'media'])->find($id);
    }

    /**
     * Save HotelRoom
     *
     * @param array $data
     * @return HotelRoom
     */
    public function save(array $data)
    {
        // Extract images and feature options from the data array
        $images = $data['images'] ?? [];
        $featureOptionIds = $data['feature_option_ids'] ?? [];

        // Remove images and feature options from the data array
        unset($data['images'], $data['feature_option_ids']);

        // Create the hotel room
        $hotelRoom = HotelRoom::create($data);

        // Handle images if provided using Media Library
        if (is_array($images) && count($images) > 0 && collect($images)->filter()->isNotEmpty()) {
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    // First image goes to 'images' collection (main image)
                    // Others go to 'gallery' collection
                    $collection = $index === 0 ? 'images' : 'gallery';
                    $hotelRoom->addMediaFromRequest("images.{$index}")
                        ->toMediaCollection($collection);
                }
            }
        }

        // Attach feature options if provided
        if (is_array($featureOptionIds) && count($featureOptionIds) > 0) {
            $hotelRoom->featureOptions()->sync(array_values($featureOptionIds));
        }

        // Return the created hotel room with its relations
        return $hotelRoom->load(['hotel', 'featureOptions', 'media']);
    }

    /**
     * Update HotelRoom
     *
     * @param array $data
     * @param int $id
     * @return HotelRoom
     */
    public function update(array $data, int $id)
    {
        // Find the hotel room by ID
        $hotelRoom = $this->hotelRoom->find($id);
        if (!$hotelRoom) {
            throw new \Exception('Hotel room not found');
        }

        // Extract images and feature options from the data array
        $images = $data['images'] ?? [];
        $featureOptionIds = $data['feature_option_ids'] ?? [];

        // Remove images and feature options from the data array
        unset($data['images'], $data['feature_option_ids']);

        // Update the hotel room
        $hotelRoom->update($data);

        // Handle images if provided using Media Library
        if (is_array($images) && count($images) > 0 && collect($images)->filter()->isNotEmpty()) {
            foreach ($images as $index => $image) {
                if ($image instanceof UploadedFile) {
                    // First image goes to 'images' collection (main image)
                    // Others go to 'gallery' collection
                    $collection = $index === 0 ? 'images' : 'gallery';
                    $hotelRoom->addMediaFromRequest("images.{$index}")
                        ->toMediaCollection($collection);
                }
            }
        }

        // Sync feature options if provided
        if (is_array($featureOptionIds)) {
            $hotelRoom->featureOptions()->sync(array_values($featureOptionIds));
        }

        // Return the updated hotel room with its relations
        return $hotelRoom->load(['hotel', 'featureOptions', 'media']);
    }

    /**
     * Delete HotelRoom
     *
     * @param int $id
     * @return bool
     */
    public function delete(int $id)
    {
        $hotelRoom = $this->hotelRoom->find($id);
        if (!$hotelRoom) {
            throw new \Exception('Hotel room not found');
        }
        
        return $hotelRoom->delete();
    }

    /**
     * Delete HotelRoom by ID (alias for delete)
     *
     * @param int $id
     * @return bool
     */
    public function deleteById(int $id)
    {
        return $this->delete($id);
    }

    /**
     * Add media to hotel room using Media Library
     *
     * @param int $hotelRoomId
     * @param UploadedFile $file
     * @param string $collection
     * @return \Spatie\MediaLibrary\MediaCollections\Models\Media
     */
    public function addMedia(int $hotelRoomId, UploadedFile $file, string $collection = 'gallery')
    {
        $hotelRoom = $this->hotelRoom->findOrFail($hotelRoomId);
        return $hotelRoom->addMediaFromRequest('file')
            ->toMediaCollection($collection);
    }

    /**
     * Clear media collection for hotel room
     *
     * @param int $hotelRoomId
     * @param string $collection
     * @return bool
     */
    public function clearMediaCollection(int $hotelRoomId, string $collection)
    {
        $hotelRoom = $this->hotelRoom->findOrFail($hotelRoomId);
        $hotelRoom->clearMediaCollection($collection);
        return true;
    }

    /**
     * Get hotel room with media data
     *
     * @param int $id
     * @return HotelRoom
     */
    public function getWithMedia(int $id)
    {
        return $this->hotelRoom->with(['hotel', 'featureOptions', 'media'])
            ->findOrFail($id);
    }
}
