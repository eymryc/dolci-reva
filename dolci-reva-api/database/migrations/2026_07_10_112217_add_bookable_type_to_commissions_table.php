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
        Schema::table('commissions', function (Blueprint $table) {
            // NULL = taux global par défaut (fallback si aucun taux spécifique
            // n'est actif pour la verticale). Non-NULL = un des morph types
            // utilisés dans bookings.bookable_type (cf. Commission::BOOKABLE_TYPES).
            $table->string('bookable_type')->nullable()->after('commission');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('commissions', function (Blueprint $table) {
            $table->dropColumn('bookable_type');
        });
    }
};
