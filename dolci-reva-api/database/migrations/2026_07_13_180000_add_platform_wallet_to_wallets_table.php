<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('wallets', function (Blueprint $table) {
            $table->boolean('is_platform')->default(false)->after('user_id');
        });

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            // SQLite : rebuild pour rendre user_id nullable (pas de DROP FOREIGN propre).
            Schema::table('wallets', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->change();
            });
        } else {
            Schema::table('wallets', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });

            Schema::table('wallets', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable()->change();
                $table->foreign('user_id')->references('id')->on('users')->nullOnDelete();
            });
        }

        // Une seule ligne plateforme : index unique partiel (SQLite / Postgres).
        // MySQL n'a pas d'index partiel — unicité via PlatformLedgerService::wallet().
        if (in_array($driver, ['sqlite', 'pgsql'], true)) {
            DB::statement(
                'CREATE UNIQUE INDEX wallets_platform_unique ON wallets (is_platform) WHERE is_platform = 1'
            );
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if (in_array($driver, ['sqlite', 'pgsql'], true)) {
            DB::statement('DROP INDEX IF EXISTS wallets_platform_unique');
        }

        DB::table('wallets')->where('is_platform', true)->delete();

        if ($driver === 'sqlite') {
            Schema::table('wallets', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable(false)->change();
                $table->dropColumn('is_platform');
            });
        } else {
            Schema::table('wallets', function (Blueprint $table) {
                $table->dropForeign(['user_id']);
            });

            Schema::table('wallets', function (Blueprint $table) {
                $table->unsignedBigInteger('user_id')->nullable(false)->change();
                $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
                $table->dropColumn('is_platform');
            });
        }
    }
};
