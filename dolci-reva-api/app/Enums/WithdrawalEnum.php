<?php

namespace App\Enums;

enum WithdrawalEnum: string
{
    case PENDING = 'PENDING';
    case PROCESSING = 'PROCESSING';
    case APPROVED = 'APPROVED';
    case REJECTED = 'REJECTED';
    case FAILED = 'FAILED';
}
