#!/usr/bin/env bash
# Déploie / met à jour l'API Laravel (Docker) sur le serveur.
# Exécuté depuis ${DEPLOY_PATH} (racine monorepo).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/common.sh
source "${SCRIPT_DIR}/../lib/common.sh"

# Accept CLI flags when invoked directly
while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-pull) SKIP_PULL=1; shift ;;
    --skip-migrate) SKIP_MIGRATE=1; shift ;;
    --skip-build) SKIP_BUILD_IMAGES=1; shift ;;
    --migrate) SKIP_MIGRATE=0; shift ;;
    --build) SKIP_BUILD_IMAGES=0; shift ;;
    *) shift ;;
  esac
done

DEPLOY_PATH="${DEPLOY_PATH:-/opt/dolci-reva}"
API_DIR="${DEPLOY_PATH}/dolci-reva-api"
DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_FILE:-docker-compose.yml}"
GIT_REMOTE="${GIT_REMOTE:-origin}"
GIT_BRANCH="${GIT_BRANCH:-main}"
SKIP_PULL="${SKIP_PULL:-0}"
SKIP_MIGRATE="${SKIP_MIGRATE:-0}"
SKIP_BUILD_IMAGES="${SKIP_BUILD_IMAGES:-0}"

header "Déploiement API (Laravel + Docker)"
[[ -d "$API_DIR" ]] || die "Dossier API introuvable: $API_DIR"
require_cmd docker
[[ -f "${API_DIR}/.env" ]] || die "Fichier ${API_DIR}/.env manquant — copiez .env.docker.example"

cd "$API_DIR"

# Pull monorepo (git at repo root) or api subfolder if independent
if [[ -d "${DEPLOY_PATH}/.git" ]]; then
  git_pull_in "${DEPLOY_PATH}"
elif [[ -d "${API_DIR}/.git" ]]; then
  git_pull_in "${API_DIR}"
else
  warn "Aucun .git détecté — déploiement sur fichiers présents"
fi

mkdir -p storage/framework/{cache,sessions,views} storage/logs storage/app/public bootstrap/cache
if id www-data >/dev/null 2>&1; then
  sudo chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || \
    chown -R "$(id -u)":"$(id -g)" storage bootstrap/cache || true
fi
find storage bootstrap/cache -type d -exec chmod 775 {} \; 2>/dev/null || true

STAMP="$(date '+%Y%m%d_%H%M%S')"
mkdir -p "${DEPLOY_PATH}/deploy/logs"
LOG_FILE="${DEPLOY_PATH}/deploy/logs/api-${STAMP}.log"
exec > >(tee -a "$LOG_FILE") 2>&1
info "Log: $LOG_FILE"

if [[ "${SKIP_BUILD_IMAGES}" == "1" ]]; then
  info "docker compose up -d (sans rebuild)"
  compose up -d
else
  info "docker compose build + up -d"
  compose build
  compose up -d
fi

# Wait php healthy
info "Attente healthcheck PHP…"
for i in $(seq 1 30); do
  if compose ps php 2>/dev/null | grep -qi healthy; then
    ok "PHP healthy"
    break
  fi
  if [[ "$i" -eq 30 ]]; then
    warn "PHP pas encore healthy — on continue quand même"
  fi
  sleep 2
done

info "composer install --no-dev"
compose exec -T php composer install --no-dev --optimize-autoloader --no-interaction

# APP_KEY obligatoire en prod
if ! grep -qE '^APP_KEY=base64:' .env 2>/dev/null; then
  info "APP_KEY vide — génération automatique"
  compose exec -T php php artisan key:generate --force
fi
grep -qE '^APP_KEY=base64:' .env || die "APP_KEY toujours manquant dans ${API_DIR}/.env"

if [[ "${SKIP_MIGRATE}" == "1" ]]; then
  warn "SKIP_MIGRATE=1 — migrations ignorées"
else
  info "php artisan migrate --force"
  compose exec -T php php artisan migrate --force
fi

info "Optimisations Laravel"
compose exec -T php php artisan storage:link 2>/dev/null || true
compose exec -T php php artisan config:cache
compose exec -T php php artisan route:cache
compose exec -T php php artisan view:cache 2>/dev/null || true
compose exec -T php php artisan queue:restart 2>/dev/null || true

info "Restart services applicatifs"
compose restart php nginx queue scheduler 2>/dev/null || compose up -d

# Local smoke
if curl -fsS -o /dev/null -w "%{http_code}" --max-time 10 "http://127.0.0.1:8080/up" | grep -qE '200|204'; then
  ok "API locale /up OK (127.0.0.1:8080)"
else
  warn "API locale /up non OK — vérifier docker compose logs nginx php"
fi

ok "Déploiement API terminé"
