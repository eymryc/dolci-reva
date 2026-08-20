<?php

namespace App\Enums;

enum MoneyMovementStatus: string
{
    case RECORDED = 'RECORDED';
    case PENDING = 'PENDING';
    case FAILED = 'FAILED';
}
