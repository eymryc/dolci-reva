# Docker local (API) + Next.js sur l’hôte

Même stack que la prod, sur ta machine : API Docker sur `:8080`, front en `npm run dev`.

## Schéma

```
http://localhost:3000          ← Next.js (hôte)
         │
         ▼ /api/backend/*
http://127.0.0.1:8080          ← Nginx Docker → PHP-FPM Laravel
         │
    mysql · redis · queue · scheduler
```

**Arrête** `php artisan serve` pour éviter la confusion (ports différents OK, mais une seule API à la fois).

## Première fois

```bash
cd dolci-reva-api

# Backup ton .env actuel si besoin (artisan serve / MySQL hôte)
cp .env .env.artisan.bak 2>/dev/null || true

cp .env.docker.local.example .env
# optionnel : nano .env

chmod +x scripts/dev-up.sh scripts/dev-down.sh
./scripts/dev-up.sh
```

```bash
cd ../dolci-reva-web
cp .env.local.example .env.local
# Vérifie :
#   LARAVEL_API_URL=http://127.0.0.1:8080/api/

npm run dev
```

Ouvre **http://localhost:3000**

## Quotidien

```bash
# Terminal API
cd dolci-reva-api
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
# ou : ./scripts/dev-up.sh

# Terminal front
cd dolci-reva-web
npm run dev
```

Arrêt API :

```bash
./scripts/dev-down.sh
```

## Commandes utiles

```bash
cd dolci-reva-api
alias dcdev='docker compose -f docker-compose.yml -f docker-compose.dev.yml'

dcdev ps
dcdev logs -f php nginx queue
dcdev exec php php artisan migrate
dcdev exec php php artisan db:seed --class=FeatureCategorySeeder
dcdev exec php php artisan tinker
dcdev restart php queue
```

## Accès BDD depuis le Mac

| Service | Host       | Port |
|---------|------------|------|
| MySQL   | 127.0.0.1  | 3307 |
| Redis   | 127.0.0.1  | 6380 |

User/pass : voir `.env` (`DB_USERNAME` / `DB_PASSWORD`).

## Revenir à artisan serve

```bash
./scripts/dev-down.sh
cp .env.artisan.bak .env   # ton ancien .env
# Front : LARAVEL_API_URL=http://127.0.0.1:8000/api/
php artisan serve
```

## Code PHP

Le dossier est monté dans le conteneur : tes edits sont pris en compte tout de suite (OPcache local avec `validate_timestamps=1`).  
Pas besoin de rebuild sauf si tu changes le `Dockerfile`.
