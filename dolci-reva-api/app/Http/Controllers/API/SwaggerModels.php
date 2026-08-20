<?php

namespace App\Http\Controllers\API;

use OpenApi\Annotations as OA;

/**
 * @OA\Schema(
 *     schema="User",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="first_name", type="string", example="John"),
 *     @OA\Property(property="last_name", type="string", example="Doe"),
 *     @OA\Property(property="email", type="string", format="email", example="john@example.com"),
 *     @OA\Property(property="phone", type="string", example="+33123456789"),
 *     @OA\Property(property="type", type="string", enum={"CUSTOMER", "OWNER", "ADMIN"}, example="CUSTOMER"),
 *     @OA\Property(property="email_verified_at", type="string", format="date-time", nullable=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="Restaurant",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="owner_id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Restaurant Le Gourmet"),
 *     @OA\Property(property="description", type="string", example="Restaurant gastronomique au cœur de la ville"),
 *     @OA\Property(property="address", type="string", example="123 Rue de la Paix"),
 *     @OA\Property(property="city", type="string", example="Paris"),
 *     @OA\Property(property="country", type="string", example="France"),
 *     @OA\Property(property="opening_hours", type="object",
 *         @OA\Property(property="monday", type="object",
 *             @OA\Property(property="open", type="string", example="12:00"),
 *             @OA\Property(property="close", type="string", example="22:00")
 *         )
 *     ),
 *     @OA\Property(property="latitude", type="number", format="float", example=48.8566),
 *     @OA\Property(property="longitude", type="number", format="float", example=2.3522),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="RestaurantTable",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="restaurant_id", type="integer", example=1),
 *     @OA\Property(property="table_number", type="string", example="T1"),
 *     @OA\Property(property="capacity", type="integer", example=4),
 *     @OA\Property(property="location", type="string", example="window"),
 *     @OA\Property(property="table_type", type="string", enum={"standard", "booth", "bar", "private"}, example="standard"),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="Lounge",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="owner_id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Lounge VIP"),
 *     @OA\Property(property="description", type="string", example="Lounge exclusif avec ambiance feutrée"),
 *     @OA\Property(property="address", type="string", example="456 Avenue des Champs"),
 *     @OA\Property(property="city", type="string", example="Paris"),
 *     @OA\Property(property="country", type="string", example="France"),
 *     @OA\Property(property="opening_hours", type="object"),
 *     @OA\Property(property="latitude", type="number", format="float", example=48.8566),
 *     @OA\Property(property="longitude", type="number", format="float", example=2.3522),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="age_restriction", type="integer", example=18),
 *     @OA\Property(property="smoking_area", type="boolean", example=true),
 *     @OA\Property(property="outdoor_seating", type="boolean", example=false),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="LoungeTable",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="lounge_id", type="integer", example=1),
 *     @OA\Property(property="table_number", type="string", example="L1"),
 *     @OA\Property(property="capacity", type="integer", example=6),
 *     @OA\Property(property="location", type="string", example="main_floor"),
 *     @OA\Property(property="table_type", type="string", enum={"sofa", "high_table", "low_table", "bar_counter", "private_booth", "outdoor"}, example="sofa"),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="minimum_spend", type="number", format="float", example=100.00),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="NightClub",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="owner_id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Club Night"),
 *     @OA\Property(property="description", type="string", example="Night club avec piste de danse et bar"),
 *     @OA\Property(property="address", type="string", example="789 Boulevard de la Nuit"),
 *     @OA\Property(property="city", type="string", example="Paris"),
 *     @OA\Property(property="country", type="string", example="France"),
 *     @OA\Property(property="opening_hours", type="object"),
 *     @OA\Property(property="latitude", type="number", format="float", example=48.8566),
 *     @OA\Property(property="longitude", type="number", format="float", example=2.3522),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="age_restriction", type="integer", example=21),
 *     @OA\Property(property="parking", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="NightClubArea",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="night_club_id", type="integer", example=1),
 *     @OA\Property(property="area_name", type="string", example="Piste principale"),
 *     @OA\Property(property="location", type="string", example="main_floor"),
 *     @OA\Property(property="area_type", type="string", enum={"dance_floor", "vip_booth", "bar_area", "terrace", "private_room", "bottle_service"}, example="dance_floor"),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="minimum_spend", type="number", format="float", example=200.00),
 *     @OA\Property(property="table_fee", type="number", format="float", example=50.00),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="Hotel",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="owner_id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Hôtel de Luxe"),
 *     @OA\Property(property="description", type="string", example="Hôtel 5 étoiles au cœur de Paris"),
 *     @OA\Property(property="address", type="string", example="321 Avenue des Champs-Élysées"),
 *     @OA\Property(property="city", type="string", example="Paris"),
 *     @OA\Property(property="country", type="string", example="France"),
 *     @OA\Property(property="opening_hours", type="object"),
 *     @OA\Property(property="latitude", type="number", format="float", example=48.8566),
 *     @OA\Property(property="longitude", type="number", format="float", example=2.3522),
 *     @OA\Property(property="star_rating", type="integer", example=5),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="HotelRoom",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="hotel_id", type="integer", example=1),
 *     @OA\Property(property="room_number", type="string", example="101"),
 *     @OA\Property(property="room_type", type="string", example="Deluxe"),
 *     @OA\Property(property="capacity", type="integer", example=2),
 *     @OA\Property(property="price_per_night", type="number", format="float", example=150.00),
 *     @OA\Property(property="is_available", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="Residence",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="owner_id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Résidence Moderne"),
 *     @OA\Property(property="description", type="string", example="Appartement moderne en centre-ville"),
 *     @OA\Property(property="address", type="string", example="654 Rue de la République"),
 *     @OA\Property(property="city", type="string", example="Paris"),
 *     @OA\Property(property="country", type="string", example="France"),
 *     @OA\Property(property="latitude", type="number", format="float", example=48.8566),
 *     @OA\Property(property="longitude", type="number", format="float", example=2.3522),
 *     @OA\Property(property="type", type="string", enum={"STUDIO", "T1", "T2", "T3", "T4", "T5+"}, example="T2"),
 *     @OA\Property(property="max_guests", type="integer", example=4),
 *     @OA\Property(property="bedrooms", type="integer", example=2),
 *     @OA\Property(property="bathrooms", type="integer", example=1),
 *     @OA\Property(property="price", type="number", format="float", example=80.00),
 *     @OA\Property(property="is_available", type="boolean", example=true),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="Booking",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="customer_id", type="integer", example=1),
 *     @OA\Property(property="owner_id", type="integer", example=2),
 *     @OA\Property(property="bookable_type", type="string", example="App\\Models\\Residence"),
 *     @OA\Property(property="bookable_id", type="integer", example=1),
 *     @OA\Property(property="start_date", type="string", format="date", example="2024-01-15"),
 *     @OA\Property(property="end_date", type="string", format="date", example="2024-01-20"),
 *     @OA\Property(property="guests", type="integer", example=2),
 *     @OA\Property(property="total_price", type="number", format="float", example=500.00),
 *     @OA\Property(property="status", type="string", enum={"PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"}, example="PENDING"),
 *     @OA\Property(property="booking_reference", type="string", example="BK20240115001"),
 *     @OA\Property(property="notes", type="string", example="Demande spéciale"),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="Error",
 *     type="object",
 *     @OA\Property(property="message", type="string", example="Une erreur s'est produite"),
 *     @OA\Property(property="error", type="string", example="Error details")
 * )
 * 
 * @OA\Schema(
 *     schema="ValidationError",
 *     type="object",
 *     @OA\Property(property="message", type="string", example="The given data was invalid."),
 *     @OA\Property(property="errors", type="object",
 *         @OA\Property(property="field_name", type="array",
 *             @OA\Items(type="string", example="The field name is required.")
 *         )
 *     )
 * )
 * 
 * @OA\Schema(
 *     schema="BusinessType",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Restaurant"),
 *     @OA\Property(property="description", type="string", example="Établissement de restauration"),
 *     @OA\Property(property="is_active", type="boolean", example=true),
 *     @OA\Property(property="created_at", type="string", format="date-time"),
 *     @OA\Property(property="updated_at", type="string", format="date-time")
 * )
 * 
 * @OA\Schema(
 *     schema="FeatureOption",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Vue sur la ville"),
 *     @OA\Property(property="has_surcharge", type="boolean", example=false)
 * )
 *
 * @OA\Schema(
 *     schema="FeatureCategory",
 *     type="object",
 *     @OA\Property(property="id", type="integer", example=1),
 *     @OA\Property(property="name", type="string", example="Vues"),
 *     @OA\Property(property="icon", type="string", example="eye"),
 *     @OA\Property(property="options", type="array", @OA\Items(ref="#/components/schemas/FeatureOption"))
 * )
 *
 * @OA\Schema(
 *     schema="SuccessResponse",
 *     type="object",
 *     @OA\Property(property="status", type="integer", example=200),
 *     @OA\Property(property="success", type="boolean", example=true),
 *     @OA\Property(property="message", type="string", example="Operation successful"),
 *     @OA\Property(property="data", type="object")
 * )
 */
class SwaggerModels
{
    //
}
