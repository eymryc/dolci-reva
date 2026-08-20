<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('money_movements', function (Blueprint $table) {
            $table->id();
            $table->string('type', 40);
            $table->string('direction', 16); // IN | OUT | INTERNAL
            $table->decimal('amount', 14, 2);
            $table->string('currency', 8)->default('XOF');
            $table->string('status', 16)->default('RECORDED'); // RECORDED | PENDING | FAILED
            $table->foreignId('booking_id')->nullable()->constrained('bookings')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('counterparty_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('withdrawal_id')->nullable()->constrained('withdrawals')->nullOnDelete();
            $table->foreignId('wallet_id')->nullable()->constrained('wallets')->nullOnDelete();
            $table->string('external_reference')->nullable()->index();
            $table->string('idempotency_key')->unique();
            $table->json('meta')->nullable();
            $table->timestamp('occurred_at')->index();
            $table->timestamps();

            $table->index(['type', 'occurred_at']);
            $table->index(['status', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('money_movements');
    }
};
