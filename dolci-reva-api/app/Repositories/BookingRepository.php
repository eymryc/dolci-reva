<?php

namespace App\Repositories;

use Carbon\Carbon;
use App\Models\HotelRoom;
use App\Models\Wallet;
use App\Models\Booking;
use App\Models\Residence;
use App\Enums\BookingEnumStatus;
use App\Services\BookingService;
use App\Services\CommissionService;
use Illuminate\Support\Facades\Auth;
use App\Enums\BookingEnumPaymentStatus;

class BookingRepository
{

    /**
     * @var Booking
     */
    protected Booking $booking;

    /**
     * @var CommissionService
     */
    protected CommissionService $commissionService;

    /**
     * Booking constructor.
     *
     * @param Booking $booking
     */
    public function __construct(Booking $booking, CommissionService $commissionService)
    {
        $this->booking = $booking;
        $this->commissionService = $commissionService;
    }

    /**
     * Get all booking.
     *
     * @return Booking $booking
     */
    public function all()
    {
        return $this->booking->with(['customer', 'owner', 'bookable.media', 'hotelRoom.media'])->latest()->get();
    }

    /**
     * Get all booking with pagination, scopé selon le rôle de l'utilisateur
     * connecté : un admin voit tout, un owner voit les réservations reçues
     * sur ses établissements, un client voit ses propres réservations.
     *
     * @param int $perPage
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    public function paginate(int $perPage = 15)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $query = $this->booking->orderBy('created_at', 'desc')->with([
            'customer',
            'owner',
            'bookable.media',
            'hotelRoom.media',
            'restaurantTables',
            'loungeTables',
            'nightClubAreas',
        ]);

        if (!$user->isAdmin()) {
            $query->where(function ($q) use ($user) {
                $q->where('owner_id', $user->id)
                  ->orWhere('customer_id', $user->id);
            });
        }

        return $query->paginate($perPage);
    }

    /**
     * Get booking by id
     *
     * @param $id
     * @return mixed
     */
    public function getById(int $id)
    {
        return $this->booking->with([
            'customer',
            'owner',
            'bookable.media',
            'hotelRoom.media',
            'restaurantTables',
            'loungeTables',
            'nightClubAreas',
        ])->find($id);
    }

    /**
     * Save Booking
     *
     * @param $data
     * @return Booking
     */
    public function save(array $data)
    {
        // Create the booking
        return $this->booking->create($data);
    }

    /**
     * Update Booking
     *
     * @param $data
     * @return Booking
     */
    public function update(array $data, int $id)
    {
        $booking = $this->booking->find($id);
        $booking->update($data);
        return $booking;
    }

    /**
     * Delete Booking
     *
     * @param $data
     * @return Booking
     */
    public function delete(int $id)
    {
        $booking = $this->booking->find($id);
        $booking->delete();
        return $booking;
    }
}
