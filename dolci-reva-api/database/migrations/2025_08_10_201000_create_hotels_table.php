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
        Schema::create('hotels', function (Blueprint $table) {
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

            // Informations spécifiques à l'hôtel
            $table->integer('star_rating')->nullable(); // Nombre d'étoiles (1-5)
            $table->boolean('is_active')->default(true);

            // Timestamps
            $table->timestamps();

            // Soft delete
            $table->softDeletes();

            // Index
            $table->index('owner_id');
            $table->index('star_rating');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hotels');
    }
};
