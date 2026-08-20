<?php

namespace App\Enums;

enum BookingEnumStatus: string
{
    case EN_ATTENTE = 'EN_ATTENTE';    // En attente de confirmation
    case CONFIRME = 'CONFIRME';        // Confirmé
    case ANNULE = 'ANNULE';            // Annulé
    case COMPLETE = 'COMPLETE';        // Terminé
    case NO_SHOW = 'NO_SHOW';          // Absent
}
