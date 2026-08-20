<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Le modèle WalletTransaction utilise le trait SoftDeletes depuis sa
     * création, mais la migration d'origine n'a jamais ajouté la colonne
     * "deleted_at" : toute requête sur ce modèle (y compris l'historique des
     * transactions du wallet, affiché côté web/mobile) échoue en production
     * avec "Unknown column 'deleted_at'" — cf. audit du 10/07/2026, découvert
     * en écrivant les tests du parcours paiement/escrow.
     */
    public function up(): void
    {
        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('wallet_transactions', function (Blueprint $table) {
            $table->dropSoftDeletes();
        });
    }
};
