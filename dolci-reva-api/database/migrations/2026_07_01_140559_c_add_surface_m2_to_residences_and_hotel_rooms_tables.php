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
        Schema::table('residences', function (Blueprint $table) {
            $table->decimal('surface_m2', 8, 2)->nullable()->after('max_guests');
        });

        Schema::table('hotel_rooms', function (Blueprint $table) {
            $table->decimal('surface_m2', 8, 2)->nullable()->after('max_guests');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('residences', function (Blueprint $table) {
            $table->dropColumn('surface_m2');
        });

        Schema::table('hotel_rooms', function (Blueprint $table) {
            $table->dropColumn('surface_m2');
        });
    }
};
