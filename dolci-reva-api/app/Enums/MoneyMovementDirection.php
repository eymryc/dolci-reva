<?php

namespace App\Enums;

enum MoneyMovementDirection: string
{
    case IN = 'IN';
    case OUT = 'OUT';
    case INTERNAL = 'INTERNAL';
}
