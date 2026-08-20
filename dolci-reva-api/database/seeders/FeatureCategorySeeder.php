<?php

namespace Database\Seeders;

use App\Enums\EstablishmentType;
use App\Models\FeatureCategory;
use App\Models\FeatureOption;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * Catalogue de commodités / équipements en français, assignées par type
 * d'établissement. Icônes = noms lucide-react (kebab-case).
 * Rejouable (updateOrCreate).
 */
class FeatureCategorySeeder extends Seeder
{
    public function run(): void
    {
        $lodging = [
            EstablishmentType::RESIDENCE->value,
            EstablishmentType::HOTEL_ROOM->value,
        ];
        $residenceOnly = [EstablishmentType::RESIDENCE->value];
        $hotel = [EstablishmentType::HOTEL->value];
        $restaurant = [EstablishmentType::RESTAURANT->value];
        $lounge = [EstablishmentType::LOUNGE->value];
        $nightClub = [EstablishmentType::NIGHT_CLUB->value];
        $nightClubArea = [EstablishmentType::NIGHT_CLUB_AREA->value];
        $venues = [
            EstablishmentType::RESTAURANT->value,
            EstablishmentType::LOUNGE->value,
            EstablishmentType::NIGHT_CLUB->value,
            EstablishmentType::NIGHT_CLUB_AREA->value,
        ];
        $all = EstablishmentType::values();

        $catalog = [
            // ---------------------------------------------------------------
            // HÉBERGEMENT — résidences & chambres d'hôtel
            // ---------------------------------------------------------------
            'Vues' => [
                'types' => $lodging,
                'icon' => 'eye',
                'options' => [
                    'Vue sur la ville', 'Vue sur mer', 'Vue sur piscine', 'Vue sur jardin',
                    'Vue sur montagne', 'Vue sur lagune', 'Vue sur la rue', 'Balcon',
                    'Terrasse privée', 'Jardin privatif',
                ],
            ],
            'Literie' => [
                'types' => $lodging,
                'icon' => 'bed',
                'options' => [
                    'Lit king size', 'Lit queen size', 'Lits jumeaux', 'Canapé-lit',
                    'Couette en duvet', 'Oreillers hypoallergéniques', 'Linge de lit en coton',
                    'Literie de qualité hôtelière', 'Protections de matelas',
                    ['name' => 'Lit supplémentaire sur demande', 'has_surcharge' => true],
                    ['name' => 'Lit bébé / berceau sur demande', 'has_surcharge' => true],
                ],
            ],
            'Équipement de restauration' => [
                'types' => $lodging,
                'icon' => 'coffee',
                'options' => [
                    'Bouilloire électrique', 'Cafetière', 'Plateau thé / café offert',
                    'Mini-réfrigérateur', 'Four micro-ondes', 'Verres et tasses',
                    'Eau minérale offerte', 'Machine à café Nespresso / capsules',
                    ['name' => 'Minibar', 'has_surcharge' => true],
                    ['name' => 'Service en chambre', 'has_surcharge' => true],
                ],
            ],
            'Cuisine équipée' => [
                'types' => $residenceOnly,
                'icon' => 'utensils',
                'options' => [
                    'Cuisine complète', 'Plaques de cuisson', 'Four', 'Lave-vaisselle',
                    'Réfrigérateur-congélateur', 'Ustensiles de cuisine', 'Vaisselle complète',
                    'Lave-linge', 'Sèche-linge', 'Grille-pain', 'Mixeur / blender',
                ],
            ],
            'Équipement de salle de bain' => [
                'types' => $lodging,
                'icon' => 'bath',
                'options' => [
                    'Douche à l\'italienne', 'Baignoire', 'Douche et baignoire séparées',
                    'Peignoir', 'Chaussons', 'Sèche-cheveux', 'Produits d\'accueil offerts',
                    'Miroir grossissant', 'Double vasque', 'Toilettes séparées',
                    'Serviettes de bain fournies', 'Kit dentaire / rasage',
                    'Salle de bain accessible PMR',
                ],
            ],
            'Médias et technologie' => [
                'types' => $lodging,
                'icon' => 'smartphone',
                'options' => [
                    'Chaîne Hi-Fi / Bluetooth', 'Station de charge USB',
                    'Radio-réveil', 'Presse et magazines',
                    ['name' => 'Console de jeux', 'has_surcharge' => true],
                ],
            ],
            'Internet' => [
                'types' => $lodging,
                'icon' => 'wifi',
                'options' => [
                    'Wifi gratuit', 'Wifi haut débit / fibre', 'Accès Ethernet filaire',
                    'Wifi dans les parties communes',
                ],
            ],
            'Téléphone' => [
                'types' => $lodging,
                'icon' => 'phone',
                'options' => [
                    'Téléphone dans la chambre', 'Ligne directe', 'Appels locaux gratuits',
                    ['name' => 'Appels internationaux', 'has_surcharge' => true],
                ],
            ],
            'Télévision' => [
                'types' => $lodging,
                'icon' => 'tv',
                'options' => [
                    'Télévision écran plat', 'Chaînes internationales',
                    'Netflix / streaming', 'Chromecast / AirPlay',
                    ['name' => 'Vidéo à la demande', 'has_surcharge' => true],
                ],
            ],
            'Confort' => [
                'types' => $lodging,
                'icon' => 'sparkles',
                'options' => [
                    'Climatisation', 'Chauffage', 'Rideaux occultants', 'Double vitrage',
                    'Fer et planche à repasser', 'Fenêtres ouvrantes', 'Insonorisation',
                    'Moustiquaires', 'Ventilateur de plafond',
                    ['name' => 'Service de couverture (turndown)', 'has_surcharge' => true],
                ],
            ],
            'Équipement électrique' => [
                'types' => $lodging,
                'icon' => 'plug',
                'options' => [
                    'Prises multiples', 'Prises USB', 'Adaptateurs universels sur demande',
                    'Éclairage de chevet modulable', 'Alimentation de secours / onduleur',
                ],
            ],
            'Services en chambre' => [
                'types' => $lodging,
                'icon' => 'concierge-bell',
                'options' => [
                    'Ménage quotidien', 'Ménage à la demande', 'Réveil sur demande',
                    ['name' => 'Blanchisserie', 'has_surcharge' => true],
                    ['name' => 'Room service 24h/24', 'has_surcharge' => true],
                    ['name' => 'Repassage', 'has_surcharge' => true],
                ],
            ],
            'Contrôle de la température' => [
                'types' => $lodging,
                'icon' => 'thermometer',
                'options' => [
                    'Climatisation individuelle', 'Chauffage individuel',
                    'Ventilateur', 'Thermostat programmable',
                ],
            ],
            'Coin bureau' => [
                'types' => $lodging,
                'icon' => 'briefcase',
                'options' => [
                    'Bureau', 'Chaise ergonomique', 'Prises au bureau',
                    'Lampe de bureau', 'Coffre-fort pour ordinateur',
                ],
            ],
            'Famille et enfants' => [
                'types' => $lodging,
                'icon' => 'baby',
                'options' => [
                    'Lit bébé disponible', 'Chaise haute', 'Jeux / jouets',
                    'Livres pour enfants', 'Kits enfants (shampoing, peignoir)',
                    'Espaces adaptés aux familles',
                ],
            ],

            // ---------------------------------------------------------------
            // HÔTEL (établissement)
            // ---------------------------------------------------------------
            'Bien-être et détente' => [
                'types' => $hotel,
                'icon' => 'waves',
                'options' => [
                    'Piscine extérieure', 'Piscine intérieure chauffée', 'Sauna', 'Hammam',
                    'Salle de sport / fitness', 'Jacuzzi / bain à remous', 'Solarium',
                    ['name' => 'Spa', 'has_surcharge' => true],
                    ['name' => 'Massages sur réservation', 'has_surcharge' => true],
                ],
            ],
            'Restauration de l\'hôtel' => [
                'types' => $hotel,
                'icon' => 'utensils',
                'options' => [
                    'Restaurant sur place', 'Bar / lounge', 'Petit-déjeuner buffet',
                    'Petit-déjeuner continental', 'Terrasse restaurant', 'Room service',
                    'All-inclusive disponible',
                ],
            ],
            'Services de l\'hôtel' => [
                'types' => $hotel,
                'icon' => 'concierge-bell',
                'options' => [
                    'Réception 24h/24', 'Conciergerie', 'Centre d\'affaires',
                    'Salles de réunion / événementiel', 'Coffre-fort à la réception',
                    'Change de devises', 'Bagagerie', 'Bagages à main', 'Consigne bagages',
                    ['name' => 'Voiturier', 'has_surcharge' => true],
                    ['name' => 'Blanchisserie express', 'has_surcharge' => true],
                ],
            ],
            'Parking et transport' => [
                'types' => $hotel,
                'icon' => 'car',
                'options' => [
                    'Parking gratuit', 'Garage couvert', 'Station de recharge électrique',
                    ['name' => 'Parking payant', 'has_surcharge' => true],
                    ['name' => 'Navette aéroport', 'has_surcharge' => true],
                    ['name' => 'Location de voiture', 'has_surcharge' => true],
                    ['name' => 'Taxi / VTC sur demande', 'has_surcharge' => true],
                ],
            ],
            'Loisirs hôtel' => [
                'types' => $hotel,
                'icon' => 'gamepad-2',
                'options' => [
                    'Aire de jeux enfants', 'Terrain de tennis', 'Billard',
                    'Bibliothèque / salon de lecture', 'Animations / soirées',
                ],
            ],

            // ---------------------------------------------------------------
            // RESTAURANT
            // ---------------------------------------------------------------
            'Cuisine et cartes' => [
                'types' => $restaurant,
                'icon' => 'chef-hat',
                'options' => [
                    'Cuisine locale / africaine', 'Cuisine internationale', 'Cuisine fusion',
                    'Fruits de mer', 'Grillades / BBQ', 'Pâtisserie maison',
                    'Carte des vins', 'Cocktails', 'Brunch du week-end',
                ],
            ],
            'Régimes alimentaires' => [
                'types' => $restaurant,
                'icon' => 'salad',
                'options' => [
                    'Options végétariennes', 'Options véganes', 'Sans gluten',
                    'Halal', 'Menu enfant', 'Portions adaptées',
                ],
            ],
            'Services du restaurant' => [
                'types' => $restaurant,
                'icon' => 'utensils',
                'options' => [
                    'Réservation en ligne', 'Terrasse extérieure', 'Salon climatisé',
                    'Wifi gratuit', 'Livraison', 'Click & collect', 'Emporter',
                    'Service traiteur', 'Parking clients',
                    ['name' => 'Privatisation / événements', 'has_surcharge' => true],
                ],
            ],
            'Confort restaurant' => [
                'types' => $restaurant,
                'icon' => 'armchair',
                'options' => [
                    'Climatisation', 'Musique d\'ambiance', 'Espace familles',
                    'Accès PMR', 'Toilettes adaptées', 'Espace fumeurs extérieur',
                ],
            ],

            // ---------------------------------------------------------------
            // LOUNGE / BAR
            // ---------------------------------------------------------------
            'Services du bar / lounge' => [
                'types' => $lounge,
                'icon' => 'wine',
                'options' => [
                    'Cave à vin', 'Bar à cocktails signature', 'Happy hour',
                    'Bières pression', 'Spiritueux premium', 'Mocktails / sans alcool',
                    'Champagne / bulles', 'Diffusions sportives', 'Terrasse extérieure',
                    'Écrans géants', 'Wifi gratuit', 'Snacks et planches', 'Climatisation',
                    ['name' => 'Chicha / narguilé', 'has_surcharge' => true],
                    ['name' => 'Espace VIP', 'has_surcharge' => true],
                    ['name' => 'Réservation de table VIP', 'has_surcharge' => true],
                ],
            ],
            'Ambiance lounge' => [
                'types' => $lounge,
                'icon' => 'music',
                'options' => [
                    'Musique live', 'DJ set', 'Karaoké', 'Open mic',
                    'Éclairage d\'ambiance', 'Vue panoramique',
                ],
            ],

            // ---------------------------------------------------------------
            // NIGHT-CLUB
            // ---------------------------------------------------------------
            'Services du night-club' => [
                'types' => $nightClub,
                'icon' => 'disc-3',
                'options' => [
                    'Vestiaire', 'Physionomiste / face control', 'Line-up DJ',
                    'Zone fumeurs extérieure', 'Entrée VIP', 'Photobooth',
                    ['name' => 'Photographe sur place', 'has_surcharge' => true],
                    ['name' => 'Service de bouteille', 'has_surcharge' => true],
                    ['name' => 'Table réservée', 'has_surcharge' => true],
                ],
            ],
            'Technique et spectacle' => [
                'types' => $nightClub,
                'icon' => 'speaker',
                'options' => [
                    'Sono professionnelle', 'Éclairage laser / LED', 'Écran géant',
                    'Scène pour artistes', 'Machine à fumée',
                ],
            ],
            'Équipement de la zone' => [
                'types' => $nightClubArea,
                'icon' => 'lightbulb',
                'options' => [
                    'Éclairage LED personnalisable', 'Banquette VIP', 'Vue sur la piste',
                    'Écran privé', 'Canapés / lounge', 'Accès piste privilégié',
                    ['name' => 'Service de bouteille dédié', 'has_surcharge' => true],
                    ['name' => 'Serveur dédié', 'has_surcharge' => true],
                ],
            ],

            // ---------------------------------------------------------------
            // COMMUN AUX LIEUX DE SORTIE
            // ---------------------------------------------------------------
            'Ambiance' => [
                'types' => $venues,
                'icon' => 'music-2',
                'options' => [
                    'Musique live', 'DJ résident', 'Terrasse extérieure', 'Vue panoramique',
                    'Espace fumeurs', 'Éclairage d\'ambiance', 'Décoration thème',
                ],
            ],
            'Paiement et réservation' => [
                'types' => $venues,
                'icon' => 'credit-card',
                'options' => [
                    'Paiement par carte', 'Paiement mobile (Wave / Orange Money)',
                    'Réservation en ligne', 'Facture entreprise',
                ],
            ],

            // ---------------------------------------------------------------
            // COMMUN À TOUS
            // ---------------------------------------------------------------
            'Accessibilité et sécurité' => [
                'types' => $all,
                'icon' => 'shield-check',
                'options' => [
                    'Accès personnes à mobilité réduite', 'Ascenseur', 'Coffre-fort',
                    'Alarme incendie', 'Extincteurs', 'Détecteurs de fumée',
                    'Issues de secours signalées', 'Vidéosurveillance',
                    'Agent / agent de sécurité', 'Éclairage de sécurité',
                ],
            ],
            'Équipements généraux' => [
                'types' => $all,
                'icon' => 'check-circle',
                'options' => [
                    'Wifi gratuit', 'Climatisation', 'Parking',
                    'Accessible PMR', 'Sécurité 24h/24', 'Animaux acceptés',
                    'Générateur de secours', 'Eau potable filtrée',
                ],
            ],
            'Développement durable' => [
                'types' => $all,
                'icon' => 'leaf',
                'options' => [
                    'Tri des déchets', 'Produits d\'accueil écoresponsables',
                    'Éclairage LED basse consommation', 'Serviettes réutilisables sur demande',
                    'Approvisionnement local privilégié',
                ],
            ],
        ];

        $categoryOrder = 0;

        foreach ($catalog as $categoryName => $definition) {
            $category = FeatureCategory::updateOrCreate(
                ['slug' => Str::slug($categoryName)],
                [
                    'name' => $categoryName,
                    'icon' => $definition['icon'] ?? null,
                    'establishment_types' => $definition['types'],
                    'display_order' => $categoryOrder,
                ]
            );

            foreach ($definition['options'] as $index => $option) {
                $optionName = is_array($option) ? $option['name'] : $option;
                $hasSurcharge = is_array($option) ? ($option['has_surcharge'] ?? false) : false;

                FeatureOption::updateOrCreate(
                    ['feature_category_id' => $category->id, 'name' => $optionName],
                    ['has_surcharge' => $hasSurcharge, 'display_order' => $index]
                );
            }

            $categoryOrder++;
        }
    }
}
