# Déploiement Dolci Rêva (VPS Debian) — pipeline maison

> **Docker local** : [`LOCAL_DOCKER.md`](./LOCAL_DOCKER.md)  
> **Pas de GitHub Actions** pour le déploiement — CLI : `./deploy/bin/dolci`

## Architecture (domaine unique)

```
Internet
   │
   ▼
Nginx hôte (:80/:443)  — dolci-reva.com / www
   │
   ├── /api/backend, /api/auth  → 127.0.0.1:3001  (Next.js / PM2 — BFF)
   ├── /api/*, /storage/*, /up  → 127.0.0.1:8080  (Laravel Docker)
   └── /*                       → 127.0.0.1:3001  (Next.js)
```

**Pas de sous-domaine `api.`** — front et API partagent `https://dolci-reva.com`.
Next écoute **127.0.0.1:3001** (sur ce VPS, :3000 = folioas-web).

## Structure VPS

```
/opt/dolci-reva/
├── dolci-reva-api/     # Docker (php, nginx:8080, mysql, redis, queue, scheduler)
├── dolci-reva-web/     # PM2 :3001 (bind 127.0.0.1)
└── deploy/             # scripts maison + nginx + pm2
    ├── bin/dolci
    ├── scripts/
    └── config/deploy.env   # (local, gitignored — ne jamais committer)
```

## DNS

- `A` dolci-reva.com → IP VPS
- `A` www.dolci-reva.com → IP VPS

---

## Pipeline maison (recommandé)

### 1) Depuis ton laptop

```bash
# une fois
./deploy/bin/dolci setup
nano deploy/config/deploy.env   # HOST, USER, clé SSH, DEPLOY_PATH

# première fois sur un VPS nu
./deploy/bin/dolci bootstrap

# déploiements quotidiens
./deploy/bin/dolci api          # Laravel Docker + migrate + cache
./deploy/bin/dolci web          # npm ci + build + pm2 reload
./deploy/bin/dolci all          # api + web + healthcheck
./deploy/bin/dolci health
./deploy/bin/dolci backup       # mysqldump gzip
./deploy/bin/dolci status
```

Flags utiles :

```bash
./deploy/bin/dolci api --skip-build     # pas de rebuild images Docker
./deploy/bin/dolci api --skip-migrate   # pas de migrate
./deploy/bin/dolci web --skip-pull      # code déjà sync / hors git
```

Le CLI **rsync** les scripts `deploy/` vers le VPS, puis exécute en SSH.

### 2) Directement sur le VPS

```bash
cd /opt/dolci-reva
bash deploy/scripts/deploy-api.sh
bash deploy/scripts/deploy-web.sh
bash deploy/scripts/healthcheck.sh
bash deploy/scripts/backup-db.sh
```

Mode 100 % local (sans SSH) : dans `deploy.env` mets `DEPLOY_MODE=local` et `DEPLOY_PATH` vers le monorepo.

---

## Prérequis Ubuntu (ou via bootstrap)

```bash
./deploy/bin/dolci bootstrap
# équivalent manuel : docker, node 20, pm2, nginx, ufw — voir scripts/bootstrap-vps.sh
```

---

## Première installation (après bootstrap)

Le bootstrap ne clone pas le code — uniquement l’outillage + `deploy/`.

Depuis le laptop (monorepo complet) :

```bash
./deploy/bin/dolci sync          # rsync api + web + deploy (sans .env)
```

Puis crée les `.env` sur le VPS (`./deploy/bin/dolci ssh`) :

### API

```bash
cd /opt/dolci-reva/dolci-reva-api
cp .env.docker.example .env
nano .env   # APP_URL=https://dolci-reva.com + secrets
```

Puis depuis le laptop (pas de `.git` sur le VPS après sync) :

```bash
./deploy/bin/dolci api --skip-pull
```

### Web

```bash
# sur le VPS :
cd /opt/dolci-reva/dolci-reva-web
cp ../deploy/env/web.env.production.example .env.production
# LARAVEL_API_URL=http://127.0.0.1:8080/api/
# NEXT_PUBLIC_API_HOSTNAME=dolci-reva.com
```

```bash
./deploy/bin/dolci web --skip-pull
```

### Nginx + HTTPS (Let's Encrypt)

Prérequis : DNS `A` dolci-reva.com + www → IP du VPS, ports 80/443 ouverts.

```bash
./deploy/bin/dolci ssl
# renouvellement forcé :
./deploy/bin/dolci ssl --force-renew
```

Le script :
1. Copie `deploy/nginx/dolci-reva.com.conf` vers Nginx
2. Émet (ou détecte) le certificat Certbot pour `dolci-reva.com` + `www`
3. Active la redirection HTTP→HTTPS
4. Active `certbot.timer` (renouvellement auto)

Email Certbot : `CERTBOT_EMAIL` dans `deploy/config/deploy.env` (défaut `noreply@dolci-reva.com`).

Webhook Paystack : **`https://dolci-reva.com/api/payments/webhook`**

---

## Variables clés

| | Variable | Valeur |
|--|----------|--------|
| API | `APP_URL` | `https://dolci-reva.com` |
| API | `FRONTEND_URL` | `https://dolci-reva.com` |
| API | `DB_HOST` | `mysql` |
| API | `REDIS_HOST` | `redis` |
| Front | `LARAVEL_API_URL` | `http://127.0.0.1:8080/api/` |
| Front | `NEXT_PUBLIC_API_URL` | `/api/backend/` |
| Front | `NEXT_PUBLIC_API_HOSTNAME` | `dolci-reva.com` |

Modèles : `dolci-reva-api/.env.docker.example` · `deploy/env/web.env.production.example` · `deploy/config/deploy.env.example`

---

## Cron recommandé (sur le VPS)

```cron
# Backup DB tous les jours à 03:15
15 3 * * * cd /opt/dolci-reva && bash deploy/scripts/backup-db.sh >> deploy/logs/backup-cron.log 2>&1
```

---

## Points d’attention

1. Ne pas exposer MySQL/Redis publiquement  
2. Permissions `storage` / `bootstrap/cache` → www-data  
3. Backups : `deploy/scripts/backup-db.sh` (+ `BACKUP_STORAGE=1` pour les médias)  
4. Une seule IP DNS pour le site  
5. Certbot sans `-d api.…`  
6. Ne pas committer `deploy/config/deploy.env`
