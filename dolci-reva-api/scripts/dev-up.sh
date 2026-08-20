#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

COMPOSE=(docker compose -f docker-compose.yml -f docker-compose.dev.yml)

echo "==> Build + start (API Docker local)"
"${COMPOSE[@]}" up -d --build

echo "==> Composer (PHP 8.3)"
"${COMPOSE[@]}" exec -T -u www-data -e COMPOSER_HOME=/tmp/composer php \
  composer install --no-interaction --prefer-dist

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null && ! grep -qE '^APP_KEY=.+' .env 2>/dev/null; then
  echo "==> key:generate"
  "${COMPOSE[@]}" exec -T php php artisan key:generate
elif grep -q '^APP_KEY=$' .env 2>/dev/null; then
  "${COMPOSE[@]}" exec -T php php artisan key:generate
fi

echo "==> migrate"
"${COMPOSE[@]}" exec -T php php artisan migrate --force
"${COMPOSE[@]}" exec -T php php artisan storage:link >/dev/null 2>&1 || true

echo ""
echo "API prête : http://127.0.0.1:8080"
echo "MySQL hôte : 127.0.0.1:3307 (user/pass voir .env)"
echo "Front     : dans dolci-reva-web → LARAVEL_API_URL=http://127.0.0.1:8080/api/"
echo "            npm run dev"
echo ""
"${COMPOSE[@]}" ps
