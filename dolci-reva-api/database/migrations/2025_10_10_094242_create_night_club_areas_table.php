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
        Schema::create('night_club_areas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('night_club_id')->constrained()->onDelete('cascade');
            $table->string('area_name');
            $table->string('location')->nullable(); // "main_floor", "vip", "terrace", "basement"
            $table->enum('area_type', ['dance_floor', 'vip_booth', 'bar_area', 'terrace', 'private_room', 'bottle_service']);
            $table->boolean('is_active')->default(true);
            $table->decimal('minimum_spend', 8, 2)->nullable(); // Dépense minimum requise
            $table->decimal('table_fee', 8, 2)->nullable(); // Frais de table
            $table->timestamps();
            
            // Index pour les performances
            $table->index(['night_club_id', 'is_active']);
            $table->index(['area_type', 'is_active']);
            $table->unique(['night_club_id', 'area_name']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('night_club_areas');
    }
};