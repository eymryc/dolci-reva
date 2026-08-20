<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('restaurant_menu_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained('restaurants')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index('restaurant_id');
        });

        Schema::create('restaurant_menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('restaurant_id')->constrained('restaurants')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('restaurant_menu_categories')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->string('currency', 8)->default('XOF');
            $table->boolean('is_available')->default(true);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('popularity_score')->default(0);
            $table->unsignedInteger('total_orders')->default(0);
            $table->unsignedInteger('preparation_time')->nullable();
            $table->unsignedTinyInteger('spice_level')->nullable();
            $table->boolean('is_vegetarian')->default(false);
            $table->boolean('is_vegan')->default(false);
            $table->boolean('is_gluten_free')->default(false);
            $table->boolean('is_halal')->default(false);
            $table->json('allergens')->nullable();
            $table->json('nutritional_info')->nullable();
            $table->json('ingredients')->nullable();
            $table->json('variants')->nullable();
            $table->json('options')->nullable();
            $table->timestamps();

            $table->index(['restaurant_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('restaurant_menu_items');
        Schema::dropIfExists('restaurant_menu_categories');
    }
};
