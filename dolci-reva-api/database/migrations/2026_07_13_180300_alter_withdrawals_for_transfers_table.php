<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * MySQL ENUM : conversion en VARCHAR pour accepter PROCESSING / FAILED.
     * SoftDeletes + colonnes transfer / review.
     */
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE withdrawals MODIFY status VARCHAR(32) NOT NULL DEFAULT 'PENDING'");
        }

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->string('transfer_reference')->nullable()->after('status');
            $table->string('transfer_code')->nullable()->after('transfer_reference');
            $table->json('payout_snapshot')->nullable()->after('transfer_code');
            $table->text('failure_reason')->nullable()->after('payout_snapshot');
            $table->unsignedBigInteger('reviewed_by')->nullable()->after('failure_reason');
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');

            if (!Schema::hasColumn('withdrawals', 'deleted_at')) {
                $table->softDeletes();
            }
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $table->foreign('reviewed_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('withdrawals', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
        });

        Schema::table('withdrawals', function (Blueprint $table) {
            $cols = [
                'transfer_reference',
                'transfer_code',
                'payout_snapshot',
                'failure_reason',
                'reviewed_by',
                'reviewed_at',
            ];
            if (Schema::hasColumn('withdrawals', 'deleted_at')) {
                $cols[] = 'deleted_at';
            }
            $table->dropColumn($cols);
        });

        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'mysql') {
            DB::statement("ALTER TABLE withdrawals MODIFY status ENUM('PENDING','APPROVED','REJECTED') NOT NULL DEFAULT 'PENDING'");
        }
    }
};
