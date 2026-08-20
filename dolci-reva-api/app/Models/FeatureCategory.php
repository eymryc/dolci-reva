<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\ReleasesUniqueOnSoftDelete;

/**
 * Catégorie de caractéristiques (ex: "Vues", "Literie", "Salle de bain"...),
 * entièrement paramétrable depuis l'admin. Le champ establishment_types
 * détermine sur quels types d'établissements (Residence, Hotel, HotelRoom,
 * Restaurant, Lounge, NightClub, NightClubArea) cette catégorie est proposée.
 */
class FeatureCategory extends Model
{
    use HasFactory, SoftDeletes, ReleasesUniqueOnSoftDelete;

    /**
     * @var list<string>
     */
    protected array $uniqueOnSoftDelete = ['slug'];

    protected $fillable = [
        'name',
        'slug',
        'icon',
        'display_order',
        'establishment_types',
    ];

    protected $casts = [
        'establishment_types' => 'array',
        'display_order' => 'integer',
    ];

    public function options()
    {
        return $this->hasMany(FeatureOption::class)->orderBy('display_order');
    }

    /**
     * Cette catégorie est-elle proposée pour ce type d'établissement
     * (classe de modèle complète, ex: App\Models\Residence) ?
     */
    public function appliesTo(string $modelClass): bool
    {
        return in_array($modelClass, $this->establishment_types ?? [], true);
    }
}
