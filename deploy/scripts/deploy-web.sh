#!/usr/bin/env bash
# Déploie / met à jour le front Next.js (PM2) sur le serveur.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/common.sh
source "${SCRIPT_DIR}/../lib/common.sh"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-pull) SKIP_PULL=1; shift ;;
    *) shift ;;
  esac
done

DEPLOY_PATH="${DEPLOY_PATH:-/opt/dolci-reva}"
WEB_DIR="${DEPLOY_PATH}/dolci-reva-web"
GIT_REMOTE="${GIT_REMOTE:-origin}"
GIT_BRANCH="${GIT_BRANCH:-main}"
SKIP_PULL="${SKIP_PULL:-0}"
PM2_APP_NAME="${PM2_APP_NAME:-dolci-front}"
ECOSYSTEM="${DEPLOY_PATH}/deploy/pm2/ecosystem.config.cjs"

header "Déploiement Web (Next.js + PM2)"
[[ -d "$WEB_DIR" ]] || die "Dossier web introuvable: $WEB_DIR"
require_cmd node
require_cmd npm
require_cmd pm2

[[ -f "${WEB_DIR}/.env.production" ]] || \
  die "Fichier ${WEB_DIR}/.env.production manquant — copiez deploy/env/web.env.production.example"

cd "$WEB_DIR"

if [[ -d "${DEPLOY_PATH}/.git" ]]; then
  git_pull_in "${DEPLOY_PATH}"
elif [[ -d "${WEB_DIR}/.git" ]]; then
  git_pull_in "${WEB_DIR}"
else
  warn "Aucun .git détecté — déploiement sur fichiers présents"
fi

STAMP="$(date '+%Y%m%d_%H%M%S')"
mkdir -p "${DEPLOY_PATH}/deploy/logs"
LOG_FILE="${DEPLOY_PATH}/deploy/logs/web-${STAMP}.log"
exec > >(tee -a "$LOG_FILE") 2>&1
info "Log: $LOG_FILE"

info "npm ci"
npm ci

info "npm run build"
npm run build

if pm2 describe "${PM2_APP_NAME}" >/dev/null 2>&1; then
  info "pm2 reload ${PM2_APP_NAME}"
  pm2 reload "${PM2_APP_NAME}" --update-env
else
  info "pm2 start ${ECOSYSTEM}"
  [[ -f "$ECOSYSTEM" ]] || die "ecosystem PM2 manquant: $ECOSYSTEM"
  pm2 start "$ECOSYSTEM"
fi

pm2 save

# Survivre au reboot
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

# Local smoke (port dédié — ne pas utiliser :3000 si une autre app PM2 l'occupe)
WEB_PORT="${WEB_PORT:-3001}"
if curl -fsS -o /dev/null --max-time 15 "http://127.0.0.1:${WEB_PORT}/" ; then
  ok "Front local :${WEB_PORT} répond"
else
  warn "Front local :${WEB_PORT} ne répond pas — pm2 logs ${PM2_APP_NAME}"
fi

ok "Déploiement Web terminé"
info "pm2 status:"
pm2 status "${PM2_APP_NAME}" || pm2 status
