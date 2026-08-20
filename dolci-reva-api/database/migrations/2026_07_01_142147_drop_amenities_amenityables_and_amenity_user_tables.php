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
        // Remplacé intégralement par feature_categories/feature_options/feature_optionables
        // (aucune donnée existante à cette date, confirmé avant suppression).
        Schema::dropIfExists('amenityables');
        Schema::dropIfExists('amenity_user');
        Schema::dropIfExists('amenities');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
