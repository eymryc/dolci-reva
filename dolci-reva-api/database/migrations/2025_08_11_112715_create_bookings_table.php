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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            // Clés étrangères
            $table->foreignId('customer_id')->constrained('users')->onDelete('cascade'); // Celui qui fait la réservation
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade'); // Celui qui possède l'élément réservé

            // Relation polymorphique
            $table->morphs('bookable');

            // Période de réservation
            $table->dateTime('start_date');
            $table->dateTime('end_date');

            // Informations de réservation
            $table->integer('guests')->default(1); // Nombre d'invités
            $table->string('booking_reference', 20)->unique(); // Référence unique de réservation

            // Informations financières
            $table->decimal('total_price', 10, 2);
            $table->decimal('commission_amount', 10, 2)->nullable();
            $table->decimal('owner_amount', 10, 2)->nullable();

            // Statuts
            $table->enum('status', [
                'EN_ATTENTE',    // En attente de confirmation
                'CONFIRME',      // Confirmé
                'ANNULE',        // Annulé
                'COMPLETE',      // Terminé
                'NO_SHOW'        // Absent
            ])->default('EN_ATTENTE');

            $table->enum('payment_status', [
                'EN_ATTENTE',    // En attente de paiement
                'PAYE',          // Payé
                'PARTIELLEMENT_PAYE', // Partiellement payé
                'REMBOURSE',     // Remboursé
                'ECHEC'          // Échec de paiement
            ])->default('EN_ATTENTE');

            // Informations supplémentaires
            $table->text('notes')->nullable(); // Notes internes
            $table->text('cancellation_reason')->nullable(); // Raison d'annulation
            $table->timestamp('cancelled_at')->nullable(); // Date d'annulation
            $table->timestamp('confirmed_at')->nullable(); // Date de confirmation

            // Index pour optimiser les requêtes
            $table->index('start_date');
            $table->index('end_date');
            $table->index('status');
            $table->index('payment_status');
            $table->index('customer_id');
            $table->index('owner_id');
            // Note: L'index sur bookable_type et bookable_id est automatiquement créé par morphs()

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
