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
        Schema::create('hotel_rooms', function (Blueprint $table) {
            $table->id();

            // Clé étrangère vers l'hôtel
            $table->foreignId('hotel_id')->constrained('hotels')->onDelete('cascade');

            // Informations de la chambre
            $table->string('name')->nullable()->default(null);
            $table->text('description')->nullable();
            $table->string('room_number')->nullable(); // Numéro de chambre (ex: 101, 205A)
            $table->unsignedInteger('max_guests')->default(1);
            $table->decimal('price', 10, 2)->default(0.00);
            $table->enum('type', ['SINGLE', 'DOUBLE', 'TWIN', 'TRIPLE', 'QUAD', 'FAMILY']);
            $table->enum('standing', ['STANDARD', 'SUPERIEUR', 'DELUXE', 'EXECUTIVE', 'SUITE', 'SUITE_JUNIOR', 'SUITE_EXECUTIVE', 'SUITE_PRESIDENTIELLE']);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_available')->default(true);

            // Timestamps
            $table->timestamps();

            // Soft delete
            $table->softDeletes();

            // Index
            $table->index('hotel_id');
            $table->index('room_number');
            $table->index('type');
            $table->index('standing');
            $table->index('is_active');
            $table->index('is_available');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotel_rooms');
    }
};
