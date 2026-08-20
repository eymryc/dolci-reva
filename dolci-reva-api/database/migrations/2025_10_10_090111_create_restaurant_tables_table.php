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
        Schema::create('restaurant_tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained()->onDelete('cascade');
            $table->string('table_number');
            $table->integer('capacity');
            $table->string('location')->nullable(); // "window", "terrace", "main_room"
            $table->enum('table_type', ['standard', 'booth', 'bar', 'private']);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Index pour les performances
            $table->index(['restaurant_id', 'is_active']);
            $table->index(['capacity', 'is_active']);
            $table->unique(['restaurant_id', 'table_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('restaurant_tables');
    }
};