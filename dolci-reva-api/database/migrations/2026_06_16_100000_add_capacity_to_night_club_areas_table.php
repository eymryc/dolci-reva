<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('night_club_areas', function (Blueprint $table) {
            $table->unsignedSmallInteger('capacity')->nullable()->after('area_type');
            $table->boolean('reservation_required')->default(false)->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('night_club_areas', function (Blueprint $table) {
            $table->dropColumn(['capacity', 'reservation_required']);
        });
    }
};
