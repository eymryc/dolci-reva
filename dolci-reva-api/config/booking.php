<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Devise de facturation
    |--------------------------------------------------------------------------
    */
    'currency' => 'XOF',

    /*
    |--------------------------------------------------------------------------
    | Tarifs de repli par personne (hospitality)
    |--------------------------------------------------------------------------
    */
    'restaurant_cover_fee_per_guest' => (float) env('BOOKING_RESTAURANT_COVER_FEE', 2000),
    'lounge_fallback_fee_per_guest' => (float) env('BOOKING_LOUNGE_FALLBACK_FEE', 3000),
    'night_club_fallback_fee_per_guest' => (float) env('BOOKING_NIGHT_CLUB_FALLBACK_FEE', 5000),

    /*
    |--------------------------------------------------------------------------
    | Durées de créneau hospitality (minutes)
    |--------------------------------------------------------------------------
    |
    | Restaurant / bar / lounge : occupation table type repas/boisson.
    | Night-club : location de zone pour la soirée (pas un séjour multi-jours).
    | L'API recalcule toujours end_date = start_date + durée.
    |
    */
    'slots' => [
        'restaurant_minutes' => (int) env('BOOKING_SLOT_RESTAURANT_MINUTES', 120),
        'lounge_minutes' => (int) env('BOOKING_SLOT_LOUNGE_MINUTES', 120),
        'night_club_minutes' => (int) env('BOOKING_SLOT_NIGHT_CLUB_MINUTES', 360),
    ],

    /*
    |--------------------------------------------------------------------------
    | Hold inventaire — réservations non payées
    |--------------------------------------------------------------------------
    |
    | Au-delà de ce délai, les bookings encore unpaid (payment_status EN_ATTENTE
    | ou ECHEC) sont auto-annulés pour libérer les dates / tables / zones.
    |
    */
    'unpaid_hold_minutes' => (int) env('BOOKING_UNPAID_HOLD_MINUTES', 30),

    /*
    |--------------------------------------------------------------------------
    | Grâce post-réservation (annulation 100 %)
    |--------------------------------------------------------------------------
    |
    | Même si le séjour commence dans moins de free_cancel_hours (ex. résa
    | le jour même), le client a encore X minutes après la création pour
    | annuler gratuitement. Évite le message « délai passé » juste après book.
    |
    */
    'post_booking_free_cancel_minutes' => (int) env('BOOKING_POST_BOOKING_FREE_CANCEL_MINUTES', 120),

    /*
    |--------------------------------------------------------------------------
    | Politiques d'annulation (heures avant le début)
    |--------------------------------------------------------------------------
    |
    | free_cancel_hours : remboursement 100 % si annulation ≥ X heures avant
    |                     le début (et paiement encore en séquestre).
    | late_refund_percent : % remboursé si annulation plus tardive (0–100).
    |
    */
    'cancellation' => [
        'residence' => [
            'free_cancel_hours' => (int) env('BOOKING_CANCEL_RESIDENCE_HOURS', 48),
            'late_refund_percent' => (int) env('BOOKING_CANCEL_RESIDENCE_LATE_PCT', 50),
        ],
        'hotel' => [
            'free_cancel_hours' => (int) env('BOOKING_CANCEL_HOTEL_HOURS', 48),
            'late_refund_percent' => (int) env('BOOKING_CANCEL_HOTEL_LATE_PCT', 50),
        ],
        'restaurant' => [
            'free_cancel_hours' => (int) env('BOOKING_CANCEL_RESTAURANT_HOURS', 4),
            'late_refund_percent' => (int) env('BOOKING_CANCEL_RESTAURANT_LATE_PCT', 0),
        ],
        'lounge' => [
            'free_cancel_hours' => (int) env('BOOKING_CANCEL_LOUNGE_HOURS', 6),
            'late_refund_percent' => (int) env('BOOKING_CANCEL_LOUNGE_LATE_PCT', 0),
        ],
        'night_club' => [
            'free_cancel_hours' => (int) env('BOOKING_CANCEL_NIGHTCLUB_HOURS', 12),
            'late_refund_percent' => (int) env('BOOKING_CANCEL_NIGHTCLUB_LATE_PCT', 0),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Avoir Dolci (crédit réservation)
    |--------------------------------------------------------------------------
    |
    | À l'annulation, le client peut convertir le montant remboursable en avoir
    | (+ bonus) utilisable uniquement pour de nouvelles réservations.
    |
    */
    'credit' => [
        'enabled' => (bool) env('BOOKING_CREDIT_ENABLED', true),
        'bonus_percent' => (int) env('BOOKING_CREDIT_BONUS_PERCENT', 10),
        'expires_months' => (int) env('BOOKING_CREDIT_EXPIRES_MONTHS', 12),
    ],

];
