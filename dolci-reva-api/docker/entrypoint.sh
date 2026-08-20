#!/bin/sh
set -e

cd /var/www/html

if [ -z "$APP_KEY" ]; then
  echo "[entrypoint] WARN: APP_KEY vide — exécutez: docker compose exec php php artisan key:generate"
fi

# Lien public storage (idempotent)
php artisan storage:link >/dev/null 2>&1 || true

if [ "$APP_ENV" = "production" ] && [ -n "$APP_KEY" ]; then
  php artisan config:cache >/dev/null 2>&1 || true
  php artisan route:cache >/dev/null 2>&1 || true
  php artisan view:cache >/dev/null 2>&1 || true
fi

exec "$@"
