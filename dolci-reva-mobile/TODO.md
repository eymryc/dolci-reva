# TODO — Intégration mobile Dolci Rêva

Suivi de l'intégration complète de l'app mobile avec l'API `dolci-reva-api`. Cocher au fur et à mesure, ajouter des lignes si un aspect a été omis (le projet a explicitement autorisé à compléter cette liste au fil de l'eau).

**Dernière mise à jour : 2026-07-01** — socle + 6 verticales complètes (Résidences, Hôtels, Restaurants, Lounges, Bars, Night-Clubs), réservations (liste/détail/reçu/QR/séquestre), profil (édition + wallet), auth complète (connexion/inscription/mot de passe oublié/réinitialisation).

## Légende
- [x] Fait et vérifié
- [ ] À faire
- [~] En cours / partiellement fait

---

## 0. Socle technique (fondations)

- [x] Scaffold Expo SDK 54 (React Native 0.81.5, React 19.1.0) pinné explicitement
- [x] Expo Router (navigation file-based) configuré, `main: expo-router/entry`
- [x] NativeWind v4.2 + Tailwind 3.4.17, tokens de couleur/police copiés du web
- [x] Reanimated v4 + react-native-worklets (New Architecture)
- [x] TanStack Query v5 configuré (QueryClientProvider racine)
- [x] Client API axios + intercepteurs (token, gestion 401) — `src/core/api/client.ts`
- [x] Stockage sécurisé du token (expo-secure-store, jamais AsyncStorage)
- [x] Store d'auth Zustand (`src/store/auth.store.ts`)
- [x] Structure clean architecture (`core/domain/data/presentation`), 6 verticales suivant strictement le même patron
- [x] Vérifié à chaque étape : `tsc --noEmit` propre, `expo export` iOS et Android réussis
- [ ] ESLint + Prettier configurés (le template blank-typescript n'en fournit pas par défaut — `npx expo lint` à lancer et configurer)
- [ ] Husky / pre-commit hook (typecheck + lint avant commit), si l'équipe le souhaite
- [ ] CI (GitHub Actions) : typecheck + lint + `expo export` à chaque PR

## 1. Authentification

- [x] Écran Connexion (`app/(auth)/sign-in.tsx`)
- [x] Écran Inscription (`app/(auth)/sign-up.tsx`) — avec message "vérifiez votre email" (register ne connecte pas auto)
- [x] Garde de navigation (redirection auto selon état de connexion)
- [x] Écran "Mot de passe oublié" (`app/(auth)/forgot-password.tsx`)
- [x] Écran "Réinitialiser le mot de passe" (`app/(auth)/reset-password.tsx`) — champs pré-remplis si arrivée via deep link `token`/`email`
- [ ] **Deep link réel non câblé côté backend** : l'email envoyé par `POST /auth/forgot-password` doit pointer vers un lien du type `dolcireva://reset-password?token=...&email=...` pour que le pré-remplissage automatique fonctionne — vérifier/configurer l'URL dans le mailable Laravel. En attendant, l'utilisateur peut saisir le code manuellement (fonctionne déjà).
- [ ] Vérification d'email : gérer le cas où l'utilisateur revient sur l'app après avoir cliqué le lien de vérif (deep link `email/verify/{id}/{hash}`)
- [ ] Biométrie (Face ID / empreinte) pour déverrouiller l'app si un token existe déjà — `expo-local-authentication`
- [ ] Rafraîchissement de session / gestion d'expiration de token plus fine (actuellement : 401 global suffisant mais pas de refresh token, à vérifier si Sanctum en a besoin)

## 2. Résidences (verticale de référence, la plus complète)

- [x] Liste publique, détail, galerie photo swipeable (`PhotoGallery`), équipements
- [x] Avis clients (`Opinion`) affichés sur la fiche détail
- [x] Dates indisponibles bloquées dans le date picker (`unavailable_dates`, vérifié nuit par nuit avant soumission)
- [x] Sélection de dates + compteur de Personnes, réservation → ouverture Paystack (`expo-web-browser`)
- [ ] Filtres de recherche (ville, prix, standing) sur la liste — actuellement liste brute sans filtre
- [x] Retour après paiement (10/07/2026) : `openAuthSessionAsync` (`src/core/payments/openPaymentSession.ts`) remplace `openBrowserAsync` sur les 5 écrans de réservation — la session se ferme automatiquement dès que Paystack redirige vers `dolcireva://payment/callback`, et la liste des réservations est invalidée immédiatement (`queryClient.invalidateQueries(['bookings'])`) si le retour est un succès. Nécessite `PaymentController::callback()` côté API (ajouté le même jour).

## 3. Autres verticales établissements — TOUTES CONSTRUITES, polish restant

Chacune suit le patron documenté dans `CLAUDE.md` §4 (entité → repository interface → impl → hooks → card → écrans).

- [x] **Hôtels** (`app/(tabs)/hotels/`) — sélection de chambre obligatoire avant réservation (`hotel_room_id`, prix réel de la chambre)
- [x] **Restaurants** (`app/(tabs)/restaurants/`) — réservation avec date+heure (pas de sélection de table côté UI, comme sur le web actuellement ; le backend accepte `restaurant_table_ids` en option si besoin futur)
- [x] **Lounges** (`app/(tabs)/lounges/`) et **Bars** (`app/(tabs)/bars.tsx`, écran plat) — un Bar est un `Lounge` avec `venue_type=BAR` côté API : même carte (`LoungeCard`), même écran de détail/réservation (`/lounges/[id]`)
- [x] **Night-Clubs** (`app/(tabs)/night-clubs/`) — restriction d'âge affichée, date+heure
- [x] Accueil : grille de catégories (accès rapide aux 6 verticales) + section "Sélections d'exception" (Résidences)
- [ ] **Se loger / Hébergements longue durée** (`Dwelling`) — PAS ENCORE FAIT, logique différente (pas de `Booking` classique, système de demande de visite `VisitRequest`) — nécessite son propre design de flux, ne pas copier le patron réservation classique tel quel
- [ ] Pour Restaurants/Lounges/Bars/Night-Clubs : pas de sélection de table/zone spécifique dans l'UI mobile (le backend le permet via `*_table_ids`/`night_club_area_ids` en option) — actuellement toutes les réservations passent par le tarif de repli par personne ou le `minimum_spend` global, jamais une table précise choisie par le client. À enrichir si le produit le demande.
- [ ] Recherche globale multi-verticales (n'existe pas non plus côté web actuellement)
- [ ] Filtres ville/prix sur les listes Hôtels/Restaurants/Lounges/Bars/Night-Clubs (même limitation que Résidences)

## 4. Réservations — COMPLET

- [x] Liste "Mes réservations" avec statut, annulation
- [x] Écran détail d'une réservation (`app/(tabs)/bookings/[id]/index.tsx`)
- [x] Écran reçu (`app/(tabs)/bookings/[id]/receipt.tsx`) : statut de séquestre affiché (`escrow_status` : en attente / sécurisé / libéré / remboursé), QR code généré (`react-native-qrcode-svg`) à présenter au check-in
- [ ] Téléchargement/partage du reçu en PDF (actuellement affiché à l'écran uniquement, pas d'export — `expo-print` + `expo-sharing` seraient le chemin naturel)
- [ ] Historique complet avec pagination (actuellement page 1 uniquement, `useMyBookings(page)` accepte déjà un paramètre page, juste l'UI de pagination/scroll infini à ajouter)

## 5. Profil & compte

- [x] Écran profil (infos, déconnexion)
- [x] Modification du profil (`app/(tabs)/profile/edit.tsx` — nom, email, téléphone ; **pas** le mot de passe, à ajouter si besoin, endpoint à vérifier côté API)
- [x] Écran Wallet (`app/(tabs)/profile/wallet.tsx` — solde/gelé/recharge + historique des transactions)
- [ ] Recharge du wallet (topup) — le web a `useRechargeWallet()` (`POST /wallets/recharge`) avec redirection Paystack ; pas encore fait côté mobile, même schéma que la réservation (ouvrir `expo-web-browser` sur le `payment_url` retourné)
- [ ] Écran de vérification d'identité propriétaire (KYC, `OwnerVerification`) — upload de document depuis la caméra/galerie (`expo-image-picker` ou `expo-document-picker`), suivi du statut (PENDING/APPROVED/REJECTED)
- [ ] Écran "Devenir propriétaire" / upgrade de compte si un CUSTOMER veut publier un établissement
- [ ] Changement de mot de passe depuis le profil (différent du "mot de passe oublié" — à vérifier si un endpoint dédié existe côté API, sinon réutiliser reset-password)

## 6. Espace propriétaire (OWNER) — décision actée le 10/07/2026 : OUI, à construire

**Décision produit : le mobile expose un espace de gestion propriétaire.** Le web a un back-office admin complet (`app/admin/*`) partagé entre ADMIN et OWNER ; le mobile n'a pas vocation à le dupliquer intégralement, mais à couvrir les usages qui ont du sens en mobilité (consulter ses réservations reçues, son wallet, scanner un QR au check-in). La gestion fine du catalogue (créer/éditer un établissement avec galerie photo, équipements, tarification) reste sur le web pour l'instant — expérience de saisie longue, peu adaptée au mobile.

**Prérequis technique découvert le 10/07/2026, à vérifier avant de commencer :** `GET /bookings` (utilisé par `useMyBookings()`) scope déjà correctement par rôle côté API — `BookingRepository::paginate()` filtre sur `owner_id OR customer_id` pour un non-admin (cf. `docs/commission-et-escrow.md` de l'API pour le contexte du flux financier). Donc un OWNER connecté sur mobile qui appelle cet endpoint aujourd'hui verra déjà ses réservations reçues **mélangées** avec ses réservations clientes s'il a aussi réservé en tant que CUSTOMER (peu probable en pratique mais à garder en tête) — pas de filtre supplémentaire par rôle applicatif ni par établissement précis. À vérifier/étendre côté API si le dashboard a besoin d'un filtre dédié (ex: `?role=owner` ou un endpoint séparé `GET /owner/bookings`) plutôt que de réutiliser tel quel `useMyBookings()`.

**Découverte connexe corrigée le 10/07/2026 (hors périmètre mobile mais pertinente) :** `DELETE /api/bookings/{id}` n'avait aucune vérification d'autorisation côté API — n'importe quel utilisateur authentifié pouvait supprimer la réservation de n'importe qui, sans le remboursement Paystack que déclenche normalement `cancelBooking()`. Corrigé : réservé aux admins désormais. Sans impact sur le mobile qui n'appelle jamais cette route (utilise `cancelBooking`), mentionné ici pour mémoire.

### Découpage proposé (par ordre de valeur / effort)

- [ ] **Réservations reçues (lecture seule)** — écran listant les réservations où l'utilisateur connecté est `owner_id` (filtre déjà supporté côté API via `?owner_id=` si exposé publiquement, sinon réutiliser `useMyBookings` en filtrant côté client par `owner_id === user.id`, en attendant un vrai filtre serveur). Réutilise directement les composants déjà existants pour l'affichage d'une réservation (`app/(tabs)/bookings/[id]/`).
- [ ] **Wallet propriétaire** — déjà consultable via l'écran Wallet existant (`app/(tabs)/profile/wallet.tsx`), à vérifier qu'il fonctionne correctement pour un compte OWNER (solde crédité au check-in, cf. séquestre) et pas seulement testé côté CUSTOMER jusqu'ici.
- [ ] **Scan QR check-in** — le cas le plus fort en valeur mobile : le web a `admin/scan-qr` avec `html5-qrcode`, mais un scan est *plus naturel* sur mobile via la caméra native `expo-camera`. Le backend expose déjà `POST /payments/qr-code/scan` (ajouté le 2026-07-01) qui valide le token généré par l'écran reçu (§4) et déclenche `releaseFundsToOwner()`. Aucun développement API nécessaire, uniquement le écran caméra + appel à cet endpoint existant.
- [ ] **Dashboard basique** (stats : nb réservations reçues, revenus du mois) — nécessite de vérifier si l'API expose déjà un endpoint d'agrégation ou s'il faut le calculer côté client à partir de la liste des réservations reçues (probable, pas d'endpoint dédié identifié).
- [ ] Gestion des établissements (CRUD) — explicitement hors périmètre v1, restant sur le web pour l'instant.

## 7. Notifications

- [ ] Push notifications (`expo-notifications`) — le backend a un vrai système de notifications (`NotificationService`, ajouté le 2026-07-01, actuellement email uniquement) : ajouter un canal push nécessiterait d'exposer un endpoint d'enregistrement de push token côté API, puis un channel dans les classes `Notification` Laravel
- [ ] Badge de l'icône de l'app (nombre de réservations en attente, etc.)
- [ ] Notifications locales (rappel de check-in la veille, par exemple)

## 8. Qualité, tests, observabilité

- [ ] Tests unitaires (Jest + `jest-expo` + React Native Testing Library) — aucun test pour l'instant
- [ ] Tests des repositories (mock axios) et des hooks (mock TanStack Query)
- [ ] Tests E2E (Maestro ou Detox) sur le parcours critique : connexion → réservation → paiement
- [ ] Crash reporting / monitoring (Sentry a un SDK Expo officiel) — rien en place actuellement
- [ ] Analytics (si besoin produit — à décider)
- [ ] Gestion d'erreurs réseau plus fine (offline, timeout) — actuellement pas de détection explicite de perte de connexion (`expo-network` + `onlineManager` de TanStack Query, mentionné dans la doc officielle, pas encore branché)

## 9. Accessibilité & i18n

- [ ] Audit accessibilité (labels `accessibilityLabel`, contrastes, tailles de touch target ≥ 44pt) — pas encore fait systématiquement
- [ ] Support du mode sombre (le web n'en a pas non plus actuellement, donc pas prioritaire, mais Tailwind/NativeWind le permettrait facilement si décidé)
- [ ] Internationalisation si l'app doit un jour supporter l'anglais (actuellement tout est en dur en français, comme le web)

## 10. Mise en production

- [ ] Configurer EAS Build (`eas.json`, profils development/preview/production)
- [ ] Icônes et splash screen définitifs (actuellement icônes par défaut du template Expo, `assets/icon.png` à remplacer par le vrai logo Dolci Rêva)
- [ ] `bundleIdentifier` / `package` définitifs (actuellement `com.dolcireva.mobile`, à valider — nom réservé sur App Store Connect / Google Play Console ?)
- [ ] Politique de confidentialité + CGU accessibles depuis l'app (obligatoire pour la publication sur les stores)
- [ ] Fiches App Store / Google Play (captures d'écran, description, mots-clés)
- [ ] Variables d'environnement de prod dans EAS (`EXPO_PUBLIC_API_URL` de prod déjà en fallback par défaut, à confirmer explicitement dans la config EAS)
- [x] Deep linking pour le retour de paiement Paystack (10/07/2026, cf. §2) — reste à vérifier en conditions réelles sur build EAS (dev/preview/prod) que le scheme `dolcireva://` est bien enregistré par iOS/Android, `openAuthSessionAsync` n'a été testé qu'en logique/unitaire côté API jusqu'ici
- [ ] Deep link pour le reset de mot de passe (cf. §1) — même sujet de configuration backend

---

## Notes de contexte importantes (à ne pas oublier en reprenant ce fichier)

- Le **séquestre** (escrow) a été ajouté côté API le 2026-07-01 : le propriétaire n'est crédité qu'au check-in (scan QR), pas au paiement. **Déjà affiché côté mobile** sur l'écran reçu (§4).
- Un **canal de réservation WhatsApp** a été ajouté côté API le même jour (endpoint webhook `/whatsapp/webhook`, entièrement côté serveur) — n'a **aucun impact** sur ce projet mobile, simplement mentionné pour contexte si la cohérence produit entre canaux devient un sujet.
- La correction du bug de prix hôtel (`hotel_room_id` obligatoire) est **respectée** dans la verticale Hôtels mobile (§3) : sélection de chambre obligatoire avant de pouvoir choisir des dates.
- **6 verticales sur 7** sont construites avec le même patron clean architecture (seul "Se loger / Dwelling" manque, §3 — logique différente, ne pas copier le patron classique tel quel).
- Aucun test automatisé n'existe encore (§8) — c'est le trou le plus important à combler avant toute mise en production sérieuse, surtout sur le parcours paiement/séquestre.
