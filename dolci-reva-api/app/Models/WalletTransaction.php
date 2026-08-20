<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class WalletTransaction extends Model
{   
    use HasFactory, SoftDeletes;
    protected $fillable = [
        'wallet_id',
        'type',
        'amount',
        'reason',
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }
}
