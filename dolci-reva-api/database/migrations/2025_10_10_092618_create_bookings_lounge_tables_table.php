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
        Schema::create('bookings_lounge_tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->onDelete('cascade');
            $table->foreignId('table_id')->constrained('lounge_tables')->onDelete('cascade');
            $table->timestamps();
            
            // Contrainte unique pour éviter les doublons
            $table->unique(['booking_id', 'table_id']);
            
            // Index pour les performances
            $table->index(['booking_id']);
            $table->index(['table_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings_lounge_tables');
    }
};