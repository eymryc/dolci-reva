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
        Schema::table('lounges', function (Blueprint $table) {
            $table->string('venue_type')->default('LOUNGE')->after('outdoor_seating');
            // LOUNGE, BAR (used to distinguish bars from lounges)
            $table->index(['venue_type', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lounges', function (Blueprint $table) {
            $table->dropIndex(['venue_type', 'is_active']);
            $table->dropColumn('venue_type');
        });
    }
};
