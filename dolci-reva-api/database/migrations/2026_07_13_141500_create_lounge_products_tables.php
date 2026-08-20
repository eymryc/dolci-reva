<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lounge_product_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lounge_id')->constrained('lounges')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();

            $table->index('lounge_id');
        });

        Schema::create('lounge_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lounge_id')->constrained('lounges')->cascadeOnDelete();
            $table->foreignId('category_id')->constrained('lounge_product_categories')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price', 12, 2)->default(0);
            $table->string('currency', 8)->default('XOF');
            $table->boolean('is_available')->default(true);
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('popularity_score')->default(0);
            $table->unsignedInteger('total_orders')->default(0);
            $table->json('variants')->nullable();
            $table->json('options')->nullable();
            $table->timestamps();

            $table->index(['lounge_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('lounge_products');
        Schema::dropIfExists('lounge_product_categories');
    }
};
