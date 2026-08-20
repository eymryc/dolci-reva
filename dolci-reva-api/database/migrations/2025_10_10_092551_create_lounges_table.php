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
        Schema::create('lounges', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->string('address');
            $table->string('city');
            $table->string('country');
            $table->json('opening_hours'); // {"monday": {"open": "18:00", "close": "02:00"}}
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->boolean('is_active')->default(true);
            
            // Champs spécifiques aux lounges
            $table->integer('age_restriction')->nullable(); // 18, 21, null
            $table->boolean('smoking_area')->default(false);
            $table->boolean('outdoor_seating')->default(false);
            
            $table->timestamps();
            
            // Index pour les performances
            $table->index(['city', 'is_active']);
            $table->index(['smoking_area', 'is_active']);
            $table->index(['outdoor_seating', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lounges');
    }
};