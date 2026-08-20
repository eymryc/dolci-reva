<?php

namespace App\Enums;

enum BookingEnumPaymentStatus: string
{
    case EN_ATTENTE = 'EN_ATTENTE';           // En attente de paiement
    case PAYE = 'PAYE';                       // Payé
    case PARTIELLEMENT_PAYE = 'PARTIELLEMENT_PAYE'; // Partiellement payé
    case REMBOURSE = 'REMBOURSE';             // Remboursé
    case ECHEC = 'ECHEC';                     // Échec de paiement
}
