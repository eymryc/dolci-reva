<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customer_credits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->decimal('remaining_amount', 14, 2);
            $table->decimal('bonus_amount', 14, 2)->default(0);
            $table->foreignId('source_booking_id')->nullable()->constrained('bookings')->nullOnDelete();
            $table->timestamp('expires_at')->nullable()->index();
            $table->string('status', 16)->default('ACTIVE')->index(); // ACTIVE|DEPLETED|EXPIRED
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status', 'expires_at']);
        });

        Schema::create('customer_credit_redemptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_credit_id')->constrained('customer_credits')->cascadeOnDelete();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->decimal('amount', 14, 2);
            $table->timestamps();

            $table->index(['booking_id']);
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->decimal('credit_applied', 14, 2)->default(0)->after('owner_amount');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('credit_applied');
        });
        Schema::dropIfExists('customer_credit_redemptions');
        Schema::dropIfExists('customer_credits');
    }
};
