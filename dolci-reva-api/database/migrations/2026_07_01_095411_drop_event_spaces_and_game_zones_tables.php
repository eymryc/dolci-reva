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
        Schema::dropIfExists('event_spaces');
        Schema::dropIfExists('game_zones');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
    }
};
