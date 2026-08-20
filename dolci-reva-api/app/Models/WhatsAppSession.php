<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WhatsAppSession extends Model
{
    protected $table = 'whatsapp_sessions';

    protected $fillable = [
        'phone_number',
        'user_id',
        'state',
        'context',
        'last_message_at',
    ];

    protected $casts = [
        'context' => 'array',
        'last_message_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
