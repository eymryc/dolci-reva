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
        Schema::create('lounge_tables', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lounge_id')->constrained()->onDelete('cascade');
            $table->string('table_number');
            $table->integer('capacity');
            $table->string('location')->nullable(); // "window", "terrace", "main_room", "smoking_area"
            $table->enum('table_type', ['sofa', 'high_table', 'low_table', 'bar_counter', 'private_booth', 'outdoor']);
            $table->boolean('is_active')->default(true);
            $table->decimal('minimum_spend', 8, 2)->nullable(); // Dépense minimum requise
            $table->timestamps();
            
            // Index pour les performances
            $table->index(['lounge_id', 'is_active']);
            $table->index(['capacity', 'is_active']);
            $table->index(['table_type', 'is_active']);
            $table->unique(['lounge_id', 'table_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lounge_tables');
    }
};