<?php

/**
 * Régression pour l'absence de rate limiting relevée dans l'audit du
 * 10/07/2026 : avant ce correctif, /api/auth/* n'avait aucune limite de
 * débit (le groupe middleware "api" n'appelait jamais throttleApi()), ce qui
 * exposait /login à du brute-force et /register à du scraping de masse.
 */
it('throttles repeated login attempts from the same IP', function () {
    for ($i = 0; $i < 5; $i++) {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nobody@example.com',
            'password' => 'wrong-password',
        ]);

        expect($response->status())->not->toBe(429);
    }

    // La 6ème tentative dans la même minute doit être bloquée (limite: 5/min/IP).
    $this->postJson('/api/auth/login', [
        'email' => 'nobody@example.com',
        'password' => 'wrong-password',
    ])->assertStatus(429);
});
