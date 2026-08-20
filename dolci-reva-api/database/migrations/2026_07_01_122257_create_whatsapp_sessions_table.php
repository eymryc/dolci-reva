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
        Schema::create('whatsapp_sessions', function (Blueprint $table) {
            $table->id();
            // Numéro au format international sans "+" (ex: 2250700000000), tel que fourni par Meta.
            $table->string('phone_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            // État courant du parcours conversationnel (cf. WhatsAppConversationService::STATE_*).
            $table->string('state')->default('IDLE');
            // Données accumulées pendant la conversation (type d'établissement,
            // établissement choisi, dates, invités...).
            $table->json('context')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('whatsapp_sessions');
    }
};
