# Go-live — dolci-reva.com (domaine unique)

Checklist opérationnelle avant bascule production.

## Domaines

| Rôle | URL |
|------|-----|
| Site + API | https://dolci-reva.com (+ www) |
| Health Laravel | https://dolci-reva.com/up |
| Webhook Paystack | https://dolci-reva.com/api/payments/webhook |
| Callback Paystack | https://dolci-reva.com/api/payments/callback |
| Médias | https://dolci-reva.com/storage/... |

Nginx route :
- `/api/backend`, `/api/auth` → Next.js (BFF)
- `/api/*`, `/storage/*`, `/images/*`, `/up` → Laravel Docker
- reste → Next.js

## Variables API (Docker)

Copier `.env.docker.example` → `.env` :

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://dolci-reva.com
FRONTEND_URL=https://dolci-reva.com
SANCTUM_STATEFUL_DOMAINS=dolci-reva.com,www.dolci-reva.com
DB_HOST=mysql
REDIS_HOST=redis
QUEUE_CONNECTION=redis
CACHE_STORE=redis
PAYSTACK_SECRET_KEY=sk_live_…
PAYSTACK_PUBLIC_KEY=pk_live_…
MAIL_FROM_ADDRESS=noreply@dolci-reva.com
```

## Variables Web (PM2)

```env
NEXT_PUBLIC_API_URL=/api/backend/
LARAVEL_API_URL=http://127.0.0.1:8080/api/
NEXT_PUBLIC_API_HOSTNAME=dolci-reva.com
```

## DNS

- `A` dolci-reva.com → IP VPS
- `A` www.dolci-reva.com → IP VPS  
*(pas de sous-domaine api.)*

## Paystack

1. Mode Live
2. Webhook URL = `https://dolci-reva.com/api/payments/webhook`
3. Callback = `https://dolci-reva.com/api/payments/callback` (si utilisé)

## SSL

```bash
sudo certbot --nginx -d dolci-reva.com -d www.dolci-reva.com
```

Voir aussi [`../deploy/DEPLOY.md`](../deploy/DEPLOY.md).
