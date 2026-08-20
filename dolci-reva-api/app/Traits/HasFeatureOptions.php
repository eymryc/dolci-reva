<?php

namespace App\Traits;

use App\Models\FeatureOption;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

/**
 * À utiliser sur tout modèle d'établissement (Residence, Hotel, HotelRoom,
 * Restaurant, Lounge, NightClub, NightClubArea) pour lui donner accès au
 * système de caractéristiques paramétrable depuis l'admin, en remplacement
 * de l'ancien système Amenity (plat, sans catégorie).
 */
trait HasFeatureOptions
{
    public function featureOptions(): MorphToMany
    {
        return $this->morphToMany(FeatureOption::class, 'feature_optionable')->with('category');
    }

    /**
     * Regroupe les options sélectionnées par catégorie, pour un affichage
     * fidèle à l'exemple de fiche détaillée (Vues, Literie, Salle de bain...).
     * À appeler uniquement quand featureOptions est déjà chargée (whenLoaded).
     */
    public function groupedFeatureOptions(): array
    {
        return $this->featureOptions
            ->groupBy(fn ($option) => $option->category?->id)
            ->map(function ($options, $categoryId) {
                $category = $options->first()->category;
                return [
                    'id' => $category?->id,
                    'name' => $category?->name,
                    'icon' => $category?->icon,
                    'options' => $options->map(fn ($option) => [
                        'id' => $option->id,
                        'name' => $option->name,
                        'has_surcharge' => $option->has_surcharge,
                    ])->values(),
                ];
            })
            ->sortBy('name')
            ->values()
            ->all();
    }
}
