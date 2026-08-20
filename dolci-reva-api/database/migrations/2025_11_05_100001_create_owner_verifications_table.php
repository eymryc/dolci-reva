<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('owner_verifications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            $table->enum('document_type', ['IDENTITY', 'BUSINESS_REGISTRATION', 'TAX_CERTIFICATE', 'OTHER'])->default('IDENTITY');
            $table->enum('identity_document_type', ['CNI', 'PASSPORT', 'SEJOUR', 'OTHER'])->nullable();
            $table->string('document_number');
            $table->date('document_issue_date')->nullable();
            $table->date('document_expiry_date')->nullable();
            $table->string('issuing_authority')->nullable();

            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'])->default('PENDING');
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();

            $table->index('user_id');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('owner_verifications');
    }
};
