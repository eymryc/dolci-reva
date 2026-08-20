<?php

namespace App\Enums;

/**
 * Types d'établissements pouvant recevoir des FeatureCategory/FeatureOption.
 * Les valeurs sont volontairement les noms de classe complets, pour rester
 * cohérent avec ce qui est déjà stocké dans les colonnes polymorphiques
 * existantes (bookable_type, amenityable_type historique...).
 */
enum EstablishmentType: string
{
    case RESIDENCE = 'App\Models\Residence';
    case HOTEL = 'App\Models\Hotel';
    case HOTEL_ROOM = 'App\Models\HotelRoom';
    case RESTAURANT = 'App\Models\Restaurant';
    case LOUNGE = 'App\Models\Lounge';
    case NIGHT_CLUB = 'App\Models\NightClub';
    case NIGHT_CLUB_AREA = 'App\Models\NightClubArea';

    public static function values(): array
    {
        return array_map(fn (self $case) => $case->value, self::cases());
    }

    /**
     * Résout un case à partir de son nom (ex: "HOTEL_ROOM") ou de son FQCN.
     */
    public static function fromName(string $name): ?self
    {
        $normalized = strtoupper($name);

        foreach (self::cases() as $case) {
            if ($case->name === $normalized || $case->value === $name) {
                return $case;
            }
        }

        return null;
    }

    /**
     * Libellé lisible en français, utilisé pour peupler les sélecteurs admin.
     */
    public function label(): string
    {
        return match ($this) {
            self::RESIDENCE => 'Résidence',
            self::HOTEL => 'Hôtel',
            self::HOTEL_ROOM => "Chambre d'hôtel",
            self::RESTAURANT => 'Restaurant',
            self::LOUNGE => 'Lounge / Bar',
            self::NIGHT_CLUB => 'Night-Club',
            self::NIGHT_CLUB_AREA => 'Espace de Night-Club',
        };
    }

    /**
     * Liste {name, value, label} pour les sélecteurs admin.
     */
    public static function options(): array
    {
        return array_map(fn (self $case) => [
            'name' => $case->name,
            'value' => $case->value,
            'label' => $case->label(),
        ], self::cases());
    }
}
