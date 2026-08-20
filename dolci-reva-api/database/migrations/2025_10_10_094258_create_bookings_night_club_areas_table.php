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
        Schema::create('bookings_night_club_areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('area_id')->constrained('night_club_areas')->onDelete('cascade');
            $table->timestamps();
            
            // Contrainte unique pour éviter les doublons
            $table->unique(['booking_id', 'area_id']);
            
            // Index pour les performances
            $table->index(['booking_id']);
            $table->index(['area_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings_night_club_areas');
    }
};