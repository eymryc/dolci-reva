<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Booking extends Model
{       
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    use HasFactory, SoftDeletes;

    //
    protected $fillable = [
        'customer_id',
        'owner_id',
        'bookable_type',
        'bookable_id',
        'hotel_room_id',
        'start_date',
        'end_date',
        'guests',
        'booking_reference',
        'total_price',
        'commission_amount',
        'owner_amount',
        'credit_applied',
        'status',
        'payment_status',
        'payment_reference',
        'funds_released_at',
        'platform_retained_at',
        'notes',
        'cancellation_reason',
        'cancelled_at',
        'confirmed_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'datetime',
        'end_date' => 'datetime',
        'cancelled_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'funds_released_at' => 'datetime',
        'platform_retained_at' => 'datetime',
        'total_price' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'owner_amount' => 'decimal:2',
        'credit_applied' => 'decimal:2',
    ];


    /**
     * Get the bookable entity (Residence, Hotel, HotelRoom).
     */
    public function bookable()
    {
        return $this->morphTo();
    }

    /**
     * Get the customer who made the booking.
     */
    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    /**
     * Get the owner of the bookable entity.
     */
    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /**
     * Get the specific hotel room booked (only set for hotel bookings).
     */
    public function hotelRoom()
    {
        return $this->belongsTo(HotelRoom::class);
    }

    /**
     * Statut du séquestre : les fonds du client sont sécurisés par la
     * plateforme jusqu'à ce que le propriétaire soit réellement crédité
     * (au check-in, cf. BookingService::completeBooking()).
     */
    public function escrowStatus(): string
    {
        if ($this->payment_status === 'REMBOURSE') {
            return 'REMBOURSE';
        }

        if ($this->payment_status !== 'PAYE') {
            return 'EN_ATTENTE_PAIEMENT';
        }

        return $this->funds_released_at ? 'LIBERE' : 'SECURISE';
    }

    /**
     * Get the restaurant tables for the booking.
     */
    public function restaurantTables(): BelongsToMany
    {
        return $this->belongsToMany(RestaurantTable::class, 'bookings_restaurant_tables', 'booking_id', 'table_id');
    }

    /**
     * Get the lounge tables for the booking.
     */
    public function loungeTables(): BelongsToMany
    {
        return $this->belongsToMany(LoungeTable::class, 'bookings_lounge_tables', 'booking_id', 'table_id');
    }

    /**
     * Get the night club areas for the booking.
     */
    public function nightClubAreas(): BelongsToMany
    {
        return $this->belongsToMany(NightClubArea::class, 'bookings_night_club_areas', 'booking_id', 'area_id');
    }

    /**
     * Check if this is a restaurant booking.
     */
    public function isRestaurantBooking(): bool
    {
        return $this->bookable_type === 'App\\Models\\Restaurant';
    }

    /**
     * Check if this is a lounge booking.
     */
    public function isLoungeBooking(): bool
    {
        return $this->bookable_type === 'App\\Models\\Lounge';
    }

    /**
     * Check if this is a night club booking.
     */
    public function isNightClubBooking(): bool
    {
        return $this->bookable_type === 'App\\Models\\NightClub';
    }

    /**
     * Get the restaurant for this booking (if applicable).
     */
    public function restaurant()
    {
        if ($this->isRestaurantBooking()) {
            return $this->bookable;
        }
        return null;
    }

    /**
     * Get the lounge for this booking (if applicable).
     */
    public function lounge()
    {
        if ($this->isLoungeBooking()) {
            return $this->bookable;
        }
        return null;
    }

    /**
     * Get the night club for this booking (if applicable).
     */
    public function nightClub()
    {
        if ($this->isNightClubBooking()) {
            return $this->bookable;
        }
        return null;
    }

}
