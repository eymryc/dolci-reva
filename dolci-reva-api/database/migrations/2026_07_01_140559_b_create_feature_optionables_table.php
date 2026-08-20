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
        Schema::create('feature_optionables', function (Blueprint $table) {
            $table->id();
            $table->morphs('feature_optionable', 'feature_optionable_index');
            $table->foreignId('feature_option_id')->constrained('feature_options')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feature_optionables');
    }
};
