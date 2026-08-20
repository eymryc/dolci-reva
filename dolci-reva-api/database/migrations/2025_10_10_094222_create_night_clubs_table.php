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
        Schema::create('night_clubs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->string('name');
            $table->text('description');
            $table->string('address');
            $table->string('city');
            $table->string('country');
            $table->json('opening_hours'); // {"friday": {"open": "22:00", "close": "06:00"}}
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->boolean('is_active')->default(true);
            
            // Champs spécifiques aux night clubs
            $table->integer('age_restriction')->default(18); // 18, 21
            $table->boolean('parking')->default(false); // Parking
            
            $table->timestamps();
            
            // Index pour les performances
            $table->index(['city', 'is_active']);
            $table->index(['age_restriction', 'is_active']);
            $table->index(['parking', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('night_clubs');
    }
};