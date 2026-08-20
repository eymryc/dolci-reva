<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('residences', function (Blueprint $table) {
            // Index simples pour les filtres fréquents
            $table->index('city', 'idx_residences_city');
            $table->index('price', 'idx_residences_price');
            $table->index('standing', 'idx_residences_standing');
            $table->index('max_guests', 'idx_residences_max_guests');
            
            // Index composites pour optimiser les requêtes combinées
            // Requête fréquente : is_active + is_available + city
            $table->index(['is_active', 'is_available', 'city'], 'idx_residences_active_available_city');
            
            // Requête fréquente : is_active + type + price
            $table->index(['is_active', 'type', 'price'], 'idx_residences_active_type_price');
            
            // Requête fréquente : is_active + price (pour tri)
            $table->index(['is_active', 'price'], 'idx_residences_active_price');
            
            // Requête fréquente : is_active + average_rating (pour tri par note)
            $table->index(['is_active', 'average_rating'], 'idx_residences_active_rating');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residences', function (Blueprint $table) {
            $table->dropIndex('idx_residences_city');
            $table->dropIndex('idx_residences_price');
            $table->dropIndex('idx_residences_standing');
            $table->dropIndex('idx_residences_max_guests');
            $table->dropIndex('idx_residences_active_available_city');
            $table->dropIndex('idx_residences_active_type_price');
            $table->dropIndex('idx_residences_active_price');
            $table->dropIndex('idx_residences_active_rating');
        });
    }
};
