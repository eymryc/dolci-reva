<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use App\Notifications\VerifyEmailNotification;
use App\Enums\UserEnum;
use App\Traits\ReleasesUniqueOnSoftDelete;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes, ReleasesUniqueOnSoftDelete;

    /**
     * Colonnes uniques à libérer au soft delete (recréation possible).
     *
     * @var list<string>
     */
    protected array $uniqueOnSoftDelete = ['email', 'phone'];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'first_name',
        'last_name',
        'phone',
        'email',
        'password',
        'type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }


    /**
     * The business types that belong to the user.
     */
    public function businessTypes()
    {
        return $this->belongsToMany(BusinessType::class, 'business_type_user');
    }

    /**
     * Get the user's wallet.
     */
    public function wallet()
    {
        return $this->hasOne(Wallet::class);    
    }

    /**
     * Documents de vérification propriétaire.
     */
    public function ownerVerifications(): HasMany
    {
        return $this->hasMany(OwnerVerification::class);
    }

    /**
     * Get the user's withdrawals.
     */
    public function withdrawals()
    {
        return $this->hasMany(Withdrawal::class); 
    }

    /**
     * Compte de versement propriétaire (Wave / Orange / banque…).
     */
    public function payoutAccount()
    {
        return $this->hasOne(PayoutAccount::class);
    }

    /**
     * Get the user's opinions.
     */
    public function opinions()
    {
        return $this->hasMany(Opinion::class);
    }

    /**
     * Check if the user is an admin.
     */
    public function isAdmin(): bool
    {
        return in_array($this->type, [UserEnum::ADMIN->value, UserEnum::SUPER_ADMIN->value], true);
    }

    public function isOwner(): bool
    {
        return $this->type === UserEnum::OWNER->value;
    }

    public function isCustomer(): bool
    {
        return $this->type === UserEnum::CUSTOMER->value;
    }

    /**
     * Peut créer / gérer des établissements (hôte ou admin).
     */
    public function canManageEstablishments(): bool
    {
        return $this->isAdmin() || $this->isOwner();
    }

    /**
     * Send the email verification notification.
     *
     * @return void
     */
    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmailNotification());
    }
}
