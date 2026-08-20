<?php

namespace App\Enums;

enum BookingEnum: string
{
    case PAYE = 'PAYE';
    case REMBOURSE = 'REMBOURSE';
    case EN_ATTENTE = 'EN_ATTENTE';

}
