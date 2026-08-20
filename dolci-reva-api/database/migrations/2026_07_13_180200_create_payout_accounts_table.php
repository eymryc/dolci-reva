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
        Schema::create('payout_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('channel'); // wave|orange_money|mtn|moov|bank
            $table->string('account_name');
            $table->string('account_number'); // téléphone ou IBAN/compte bancaire
            $table->string('bank_code')->nullable();
            $table->string('bank_name')->nullable();
            $table->string('currency', 3)->default('XOF');
            $table->string('paystack_recipient_code')->nullable();
            $table->string('paystack_recipient_type')->nullable(); // mobile_money|nuban|…
            $table->boolean('is_verified')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payout_accounts');
    }
};
