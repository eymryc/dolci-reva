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
        Schema::create('feature_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feature_category_id')->constrained('feature_categories')->onDelete('cascade');
            $table->string('name');
            // Badge informatif uniquement (cf. décision produit) : n'entre jamais
            // dans le calcul du prix de réservation.
            $table->boolean('has_surcharge')->default(false);
            $table->unsignedInteger('display_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feature_options');
    }
};
