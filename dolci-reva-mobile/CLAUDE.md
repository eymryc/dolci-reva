# Dolci Rêva — Application mobile

Application mobile (iOS/Android) de la marketplace de réservation **Dolci Rêva**, consommant la même API Laravel que `dolci-reva-web` (`../dolci-reva-api`). Ce document est la référence pour toute session future travaillant sur ce projet : lisez-le avant de modifier quoi que ce soit.

## 1. Stack technique et versions (figées volontairement)

| Techno | Version | Pourquoi ce choix précis |
|---|---|---|
| Expo SDK | **54** (`^54.0.0`) | Demandé explicitement pour ce projet. **Ne pas mettre à jour vers SDK 55+ sans validation** — SDK 55 rend la New Architecture obligatoire et non désactivable, ce qui peut casser des libs tierces pas encore prêtes. |
| React Native | 0.81.5 | Version exacte livrée par Expo SDK 54. |
| React | 19.1.0 | Idem. |
| NativeWind | **v4.2.0+** (pas v5) | v5 est encore en pré-release non recommandée en production au moment de la rédaction. v4.2.0+ est la première version patchée pour être compatible avec Reanimated v4 (obligatoire en New Architecture). |
| Tailwind CSS | **3.4.17** (pas v4.x) | Version exigée par NativeWind v4.x, ne pas monter en v4 tant que NativeWind reste en v4. |
| react-native-reanimated | ~4.1.1 | Version New Architecture-only livrée avec SDK 54. Nécessite `react-native-worklets` en dépendance séparée (le plugin worklets est inclus *dans* `react-native-reanimated/plugin` — ne jamais ajouter les deux plugins babel, ça duplique et casse le build). |
| Expo Router | ~6.0.24 | Navigation file-based officielle, pas de React Navigation manuel. |
| TanStack Query | v5 | Identique au web (`dolci-reva-web`), mêmes réflexes de cache/invalidation. |
| Zustand | v5 | State client léger (session auth), pas de Redux. |
| expo-secure-store | ~15 | Stockage **chiffré** du token (Keychain iOS / Keystore Android). **Ne jamais utiliser AsyncStorage pour le token** — il est lisible en clair sur un appareil rooté/jailbreaké ou via extraction de backup. |
| react-hook-form + zod | — | Identique au web. |
| lucide-react-native | — | Port mobile de `lucide-react` utilisé sur le web : mêmes icônes des deux côtés. |
| @expo-google-fonts/rajdhani | — | Police Rajdhani, identique à `next/font/google` sur le web. |

**Avant toute mise à jour de dépendance** : vérifier la matrice de compatibilité sur https://docs.expo.dev/versions/v54.0.0/ et ne jamais lancer `npx expo install --fix` sans relire ce tableau — SDK 54 est une version pinnée, pas "latest".

`.npmrc` contient `legacy-peer-deps=true` : nécessaire pour résoudre l'arbre de dépendances React Native/Expo qui a des peer deps historiquement bruyantes (RN core + web tooling coexistent dans le même arbre). Ce n'est pas un hack de contournement d'un vrai conflit de version, juste la config standard recommandée pour ce type de projet.

## 2. Architecture (Clean Architecture pragmatique)

```
app/                          # ROUTES UNIQUEMENT (Expo Router, file-based)
  _layout.tsx                 # Racine : fonts, QueryClientProvider, init auth, splash screen
  index.tsx                   # Porte d'entrée : redirige vers (auth) ou (tabs) selon l'état de connexion
  (auth)/
    _layout.tsx                # Redirige vers (tabs) si déjà connecté
    sign-in.tsx
    sign-up.tsx
  (tabs)/
    _layout.tsx                # Bottom tabs, redirige vers (auth) si non connecté
    index.tsx                  # Accueil
    residences/
      _layout.tsx               # Stack imbriqué (liste -> détail)
      index.tsx                 # Liste
      [id].tsx                  # Détail + réservation
    bookings/index.tsx         # Mes réservations
    profile/index.tsx          # Profil + déconnexion

src/
  core/                       # Transversal, sans logique métier
    api/client.ts               # Instance axios unique + intercepteurs (token, 401)
    api/response.ts             # extractApiData() — port fidèle du web (enveloppes Laravel variées)
    config/env.ts                # EXPO_PUBLIC_API_URL
    storage/secureStorage.ts     # Wrapper expo-secure-store
    theme/colors.ts              # Mêmes valeurs que tailwind.config.js, pour les cas hors className (icônes, StatusBar)
    lib/cn.ts                    # clsx + tailwind-merge, identique à dolci-reva-web/lib/utils.ts

  domain/                     # Cœur métier, ZÉRO dépendance à React/axios
    entities/                    # User, Residence, Booking... reflet fidèle des types web (types/entities/*)
    repositories/                # INTERFACES uniquement (contrat), jamais d'implémentation ici

  data/                       # Implémentations techniques des interfaces du domaine
    repositories/*.impl.ts       # Appellent apiClient, mappent vers les entités du domaine

  presentation/
    components/ui/               # Button, Card, Input, Badge, Skeleton, Text — équivalents mobiles du shadcn/ui web
    components/establishments/   # ResidenceCard (et futurs HotelCard, RestaurantCard...)
    hooks/                       # Hooks TanStack Query (useResidences, useBookings...) — consomment les repository *.impl.ts

  store/
    auth.store.ts                # Zustand : session utilisateur, login/register/logout/init
```

**Règle de dépendance** (Clean Architecture) : `presentation` → `data` → `domain`. Le `domain` ne connaît jamais axios, React ni Zustand — uniquement des interfaces et entités pures. Si vous devez ajouter une nouvelle verticale (Hôtels, Restaurants...), suivez **exactement** ce schéma pour rester cohérent : voir la section 4 (patron à reproduire).

## 3. Design system — cohérence stricte avec le web

Toutes les couleurs viennent de `dolci-reva-web/app/globals.css` (`@theme`), copiées à l'identique dans `tailwind.config.js` **et** `src/core/theme/colors.ts` :

```
theme-primary   #f08400   (orange, couleur de marque dominante)
theme-secondary #12100c   (quasi-noir, texte principal)
theme-accent    #ff6b35
theme-warm      #ff8c42
theme-cool      #4a90e2
theme-success   #10b981
theme-warning   #f59e0b
theme-error     #ef4444
theme-info      #3b82f6
```

Police : **Rajdhani** (regular/medium/semibold/bold), chargée via `@expo-google-fonts/rajdhani` dans `app/_layout.tsx`. Le composant `Text` (`src/presentation/components/ui/Text.tsx`) l'applique par défaut — toujours l'utiliser à la place du `Text` natif de React Native.

Les composants UI (`Button`, `Badge`...) reprennent les mêmes variantes que `dolci-reva-web/components/ui/*` (shadcn/ui) : `default`, `outline`, `secondary`, `ghost`, `destructive`. Si le web ajoute une variante, la porter ici aussi.

**Si un jour NativeWind v5 devient stable et que vous voulez adopter `react-native-reusables`** (portage officiel de shadcn/ui pour React Native, basé sur NativeWind), c'est le chemin naturel pour remplacer les composants UI actuels — mais évaluez d'abord la compatibilité de version avec ce qui est pinné ici.

## 4. Connexion à l'API — patron à reproduire pour une nouvelle verticale

L'API (`dolci-reva-api`) est documentée en détail dans `../dolci-reva-api` (voir son propre historique de travail). Points clés côté mobile :

- **Base URL** : `EXPO_PUBLIC_API_URL` (`.env`, voir `.env.example`). Fallback prod déjà en dur dans `src/core/config/env.ts`.
- **Auth** : Laravel Sanctum, token Bearer. `POST /auth/login` renvoie `{token, user}` ; le token est stocké via `secureStorage.setAccessToken()`, jamais en `AsyncStorage`.
- **Register** : `POST /auth/register` ne renvoie **pas** de token — l'utilisateur doit vérifier son email avant de se connecter (`MustVerifyEmail` côté Laravel). L'écran `sign-up.tsx` affiche un message d'attente, ne connecte pas automatiquement.
- **401** : intercepté globalement dans `core/api/client.ts`, déclenche `onUnauthorized` (branché par `auth.store.ts` à l'initialisation) qui vide `user` → `(tabs)/_layout.tsx` redirige alors automatiquement vers `(auth)/sign-in`.
- **Enveloppes de réponse** : jamais uniformes côté Laravel (`{data}`, `{success, data}`, pagination `{data, meta}`, ou resource brute). Toujours passer par `extractApiData()` (`core/api/response.ts`), jamais lire `response.data.data` à la main.

### Patron reproduit pour chaque verticale (6 sur 7 déjà construites)

Résidences, Hôtels, Restaurants, Lounges, Bars, Night-Clubs suivent **exactement** ce schéma (seul `Dwelling`/"Se loger" manque encore, cf. `TODO.md` §3 — logique différente, ne pas copier tel quel) :

1. `domain/entities/<verticale>.ts` — entité + types de payload de réservation.
2. `domain/repositories/<verticale>.repository.ts` — interface (`getAllPublic`, `getByIdPublic`, `book`...).
3. `data/repositories/<verticale>.repository.impl.ts` — implémentation axios, endpoints Laravel réels.
4. `presentation/hooks/use<Verticale>.ts` — hooks TanStack Query.
5. `presentation/components/establishments/<Verticale>Card.tsx` — carte de listing.
6. `app/(tabs)/<verticale>/_layout.tsx` + `index.tsx` + `[id].tsx` — écrans (liste, détail + réservation).
7. Route enregistrée dans `app/(tabs)/_layout.tsx` : soit en onglet visible (cas de Résidences), soit masquée de la tab bar via `options={{ href: null }}` et accessible depuis la grille de catégories de l'accueil (cas de toutes les autres, pour ne pas surcharger la tab bar au-delà de 4 onglets).

**Cas particuliers déjà résolus, à connaître avant de "réinventer" :**
- **Hôtels** exige la sélection d'une chambre (`hotel_room_id`) avant les dates — bug de prix corrigé côté API le 2026-07-01, ne jamais réserver un `Hotel` sans `hotel_room_id`.
- **Bars et Lounges partagent le même modèle** côté API (`Lounge` avec `venue_type=BAR|LOUNGE`) : un seul repository/entité `lounge.ts`, mais deux endpoints de listing (`/public/lounges` et `/public/bars`) et un seul écran de détail/réservation partagé (`/(tabs)/lounges/[id]`, y compris pour les bars).
- **Restaurants, Lounges, Bars, Night-Clubs** utilisent un picker `datetime` (pas juste `date`) car ce sont des réservations ponctuelles (soirée/service), contrairement à Résidences/Hôtels qui sont des séjours multi-nuits.

Le détail de toutes les tâches restantes (polish, verticale manquante, filtres, etc.) et leur état d'avancement est dans **`TODO.md`** — toujours le mettre à jour en cochant/ajoutant des lignes au fur et à mesure, ne pas le laisser dériver.

## 5. Commandes

```bash
npm install              # installe les dépendances (legacy-peer-deps actif via .npmrc)
npm run start             # démarre Metro (Expo Go ou dev client)
npm run ios               # build + lance sur simulateur iOS
npm run android           # build + lance sur émulateur Android
npm run typecheck          # tsc --noEmit
npx expo export --platform ios|android   # vérifie que le bundle se construit sans erreur (utilisé comme test de fumée)
```

## 6. Conventions

- Toujours importer via l'alias `@/*` → `src/*` (configuré dans `tsconfig.json`), jamais de chemins relatifs profonds (`../../../`).
- Un écran (`app/**`) ne contient **jamais** de logique d'appel API directe : toujours passer par un hook de `presentation/hooks`.
- Un composant de `presentation/components` ne connaît jamais `apiClient` directement — seulement les hooks/repositories.
- Toute nouvelle info sensible (jamais de secret) va dans `.env` avec le préfixe `EXPO_PUBLIC_` s'il doit être lu côté client — sinon il n'a rien à faire dans ce projet mobile (les vrais secrets restent côté API Laravel).
- Le screenOptions `headerShown: false` est la norme partout : chaque écran gère son propre header custom si besoin (cf. bouton retour dans `residences/[id].tsx`).
