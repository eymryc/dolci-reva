<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dwellings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');

            $table->text('description')->nullable();
            $table->text('address');
            $table->string('city', 100);
            $table->string('country', 100)->default('Côte d\'Ivoire');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();

            $table->string('phone', 30);
            $table->string('whatsapp', 30)->nullable();

            $table->enum('type', ['STUDIO', 'APPARTEMENT', 'VILLA', 'MAISON', 'DUPLEX', 'TRIPLEX'])->default('APPARTEMENT');
            $table->enum('structure_type', ['MAISON_BASSE', 'IMMEUBLE'])->default('IMMEUBLE');
            $table->enum('construction_type', ['NOUVELLE_CONSTRUCTION', 'ANCIENNE'])->default('NOUVELLE_CONSTRUCTION');
            $table->enum('rental_status', ['PENDING', 'AVAILABLE', 'RENTED'])->default('AVAILABLE');

            // Finances locatives
            $table->decimal('rent', 12, 2)->default(0);
            $table->unsignedTinyInteger('rent_advance_amount_number')->default(1); // nb de mois d'avance
            $table->decimal('rent_advance_amount', 12, 2)->default(0);             // calculé = rent * nb

            $table->decimal('visite_price', 10, 2)->default(0);

            $table->unsignedTinyInteger('security_deposit_month_number')->default(1);
            $table->decimal('security_deposit_amount', 12, 2)->default(0);

            $table->unsignedTinyInteger('agency_fees_month_number')->default(1);
            $table->decimal('agency_fees', 12, 2)->default(0);

            // Caractéristiques
            $table->unsignedSmallInteger('piece_number')->nullable();
            $table->unsignedSmallInteger('rooms')->nullable();
            $table->unsignedSmallInteger('bathrooms')->nullable();
            $table->unsignedSmallInteger('living_room')->nullable();

            $table->boolean('is_available')->default(true);
            $table->boolean('is_active')->default(true);

            $table->timestamps();
            $table->softDeletes();

            $table->index('owner_id');
            $table->index('type');
            $table->index('city');
            $table->index('is_available');
            $table->index('is_active');
            $table->index('rental_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dwellings');
    }
};
