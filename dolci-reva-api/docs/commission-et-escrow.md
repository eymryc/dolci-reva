# Commission & séquestre (escrow) — comment l'argent circule

Référence technique du flux financier d'une réservation. À lire avant toute
discussion business sur les taux de commission (investisseur, partenaire
hôtelier) : ce document décrit ce que le code fait **réellement** aujourd'hui,
pas une intention.

## 1. Les deux moments distincts

Une réservation payée traverse deux moments financiers bien séparés, et il ne
faut jamais les confondre :

| Moment | Déclencheur | Ce qui se passe | Code |
|---|---|---|---|
| **A. Calcul de la commission** | Création de la réservation (avant même le paiement) | `commission_amount` et `owner_amount` sont calculés et figés sur la ligne `bookings`, à partir du taux actif au moment de la réservation | `BookingService::calculateCommission()`, appelé dans chaque `save<Verticale>Booking()` |
| **B. Libération des fonds au propriétaire** | Check-in du client (scan du QR code de la réservation) | Le wallet du propriétaire est crédité de `owner_amount` ; le wallet **plateforme** (`is_platform`) est crédité de `commission_amount` | `BookingService::completeBooking()` → `releaseFundsToOwner()` + `PlatformLedgerService::credit()` |

Entre A et B, l'argent du client est retenu par la plateforme (séquestre) : le
paiement Paystack est confirmé (webhook `charge.success` ou retour navigateur
`/payments/callback`), mais **aucun wallet n'est crédité à ce stade-là**. Voir
`Booking::escrowStatus()` pour les 4 états exposés à l'API/mobile/web :
`EN_ATTENTE_PAIEMENT` → `SECURISE` → `LIBERE` (ou `REMBOURSE` si annulation
après paiement mais avant libération).

## 2. Où va la commission concrètement ?

Au check-in (moment B), `PlatformLedgerService` crédite le wallet plateforme
unique (`wallets.is_platform = true`, `user_id` null) du montant
`commission_amount`, avec un motif du type `Commission réservation #X`.
`owner_amount = total_price - commission_amount` reste le seul montant crédité
au wallet du propriétaire.

**Tableau de bord CA commission :** somme des transactions CREDIT du wallet
plateforme, ou agrégat `bookings.commission_amount` filtré par
`funds_released_at IS NOT NULL`.

## 3. Taux de commission : un taux par verticale, avec repli global

Depuis la migration `2026_07_10_112217_add_bookable_type_to_commissions_table`,
la table `commissions` porte une colonne `bookable_type` :

- `bookable_type = NULL` → taux **global de repli**, utilisé si aucune ligne
  active n'existe pour la verticale concernée.
- `bookable_type = 'App\Models\Residence'` (ou `Hotel`, `Restaurant`,
  `Lounge`, `NightClub`, `Dwelling`) → taux dédié à cette verticale, prioritaire
  sur le taux global s'il est actif.

`CommissionRepository::getLastCommission(?string $bookableType)` implémente
cette priorité. Une seule ligne peut être active à la fois **par verticale**
(activer un nouveau taux "Hôtels" désactive l'ancien taux "Hôtels", mais ne
touche pas aux taux "Résidences" ni au taux global).

**Aucun taux réel n'est configuré à ce jour** — l'infrastructure est prête,
mais les pourcentages par verticale restent une décision business à prendre
et à saisir via l'admin (`/admin/commissions`) ou l'API
(`POST /api/commissions`). Tant qu'aucune ligne active n'existe, la
commission calculée est 0 (le propriétaire perçoit 100% du prix).

## 4. Annulation et remboursement

Si une réservation payée est annulée **avant** la libération des fonds
(`funds_released_at` vide), `BookingService::resolveCancellationRefund()`
applique la politique d'annulation (gratuité sous délai / grâce, sinon
`late_refund_percent`) :

- montant remboursé > 0 → `refundBooking()` via Paystack ;
- montant retenu = `total_price - refunded` > 0 → crédit du wallet plateforme
  (`Rétention annulation réservation #X`), idempotent via
  `bookings.platform_retained_at`.

Un échec de remboursement Paystack est journalisé mais ne bloque pas
l'annulation elle-même.

## 5. Money movements — source de suivi admin

Table `money_movements` : journal chronologique **unique** des événements
monétaires (append-only, clé `idempotency_key`).

| type | Quand |
|---|---|
| `CLIENT_CHARGE` | Webhook / callback paiement Paystack OK |
| `CLIENT_REFUND` | Annulation → refund Paystack |
| `OWNER_RELEASE` | Check-in → crédit wallet proprio |
| `PLATFORM_COMMISSION` | Check-in → crédit wallet plateforme |
| `PLATFORM_RETENTION` | Annulation tardive avec part retenue |
| `OWNER_WITHDRAWAL` / `OWNER_TRANSFER_*` | Demande / résultat de retrait |

**API admin** (middleware `admin`) :

- `GET /api/finance/summary` — KPIs (GMV, remboursé, escrow, commissions…)
- `GET /api/finance/movements` — flux filtrable
- `GET /api/finance/escrow` — résas `PAYE` non libérées

**Backfill** : `php artisan finance:backfill-money-movements`

La page admin **Finance** (`/admin/operations`) lit ce ledger.  
`wallet_transactions` reste le sous-ledger des soldes internes (wallets),
pas la piste d’audit métier.

## 6. Avoir Dolci (crédit réservation)

À l’annulation d’une résa `PAYE` non libérée, le client choisit :

- `settlement=paystack` (défaut) → refund Paystack (`CLIENT_REFUND`)
- `settlement=credit` → émission d’un **avoir** (`CREDIT_ISSUED`) =
  montant remboursable + **bonus 10 %**, expiration 12 mois

Table `customer_credits` + `customer_credit_redemptions` (FIFO à l’usage).

À la prochaine réservation, `BookingService::initializePaymentForBooking()`
applique automatiquement l’avoir (`CREDIT_REDEEMED`) puis Paystack sur le reste.
Si l’avoir couvre 100 %, la résa passe `PAYE` sans Paystack.

Config : `config/booking.php` → `credit.enabled|bonus_percent|expires_months`  
API : `GET /api/customer-credits`


