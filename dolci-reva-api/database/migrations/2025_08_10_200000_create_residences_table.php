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
        Schema::create('residences', function (Blueprint $table) {
            $table->id();

            // Clés étrangères
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');

            // Informations de base (de Property)
            $table->string('name', 255);
            $table->text('description')->nullable();

            // Adresse (de Property)
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('country', 100)->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            // Type de résidence
            $table->enum('type', ['STUDIO','APPARTEMENT',  'VILLA', 'PENTHOUSE','DUPLEX','TRIPLEX']);

            // Informations de la résidence (unité entière)
            $table->unsignedInteger('max_guests')->default(1);
            $table->unsignedInteger('bedrooms')->nullable();
            $table->unsignedInteger('bathrooms')->nullable();
            $table->unsignedInteger('piece_number')->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->enum('standing', ['STANDARD', 'SUPERIEUR', 'DELUXE', 'EXECUTIVE', 'SUITE', 'SUITE_JUNIOR', 'SUITE_EXECUTIVE', 'SUITE_PRESIDENTIELLE']);
            
            // Système de notation
            $table->decimal('average_rating', 3, 2)->default(0.00); // Note moyenne (0.00 à 5.00)
            $table->integer('total_ratings')->default(0); // Nombre total de notes
            $table->integer('rating_count')->default(0); // Nombre de personnes qui ont noté
            
            $table->boolean('is_available')->default(true); // Disponiblité
            $table->boolean('is_active')->default(true); // Visible

            // Timestamps
            $table->timestamps();

            // Soft delete
            $table->softDeletes();

            // Index
            $table->index('owner_id');
            $table->index('type');
            $table->index('is_available');
            $table->index('is_active');
            $table->index('average_rating');
            $table->index(['average_rating', 'rating_count']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('residences');
    }
};
