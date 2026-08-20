#!/usr/bin/env bash
# Bootstrap one-shot d'un VPS pour Dolci Rêva.
# À lancer EN TANT QUE root ou avec sudo sur le serveur (mode local),
# ou via: ./deploy/bin/dolci bootstrap
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/common.sh
source "${SCRIPT_DIR}/../lib/common.sh"
load_deploy_config

header "Bootstrap VPS Dolci Rêva"

init_sudo

info "Mise à jour APT + paquets de base"
apt_get update -y
apt_get upgrade -y
apt_get install -y nginx curl git ufw rsync ca-certificates gnupg lsb-release

if ! command -v docker >/dev/null 2>&1; then
  info "Installation Docker"
  curl -fsSL https://get.docker.com | as_root sh
else
  ok "Docker déjà installé: $(docker -v 2>/dev/null || true)"
fi

CURRENT_USER="${SUDO_USER:-${USER:-root}}"
if [[ -n "${CURRENT_USER}" && "${CURRENT_USER}" != "root" ]]; then
  as_root usermod -aG docker "${CURRENT_USER}" || true
  ok "User ${CURRENT_USER} ajouté au groupe docker (relogin requis)"
fi

if ! command -v node >/dev/null 2>&1; then
  info "Installation Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | as_root -E bash -
  apt_get install -y nodejs
else
  ok "Node déjà installé: $(node -v)"
fi

if ! command -v pm2 >/dev/null 2>&1; then
  info "Installation PM2"
  as_root npm i -g pm2
else
  ok "PM2 déjà installé"
fi

info "Firewall UFW"
as_root ufw allow OpenSSH || true
as_root ufw allow 'Nginx Full' || true
as_root ufw --force enable || true

info "Paquet Certbot (émission SSL = ./deploy/bin/dolci ssl après DNS)"
apt_get install -y certbot python3-certbot-nginx || warn "certbot non installé"

info "Arborescence ${DEPLOY_PATH}"
as_root mkdir -p "${DEPLOY_PATH}" "${DEPLOY_PATH}/backups"
if [[ -n "${CURRENT_USER}" && "${CURRENT_USER}" != "root" ]]; then
  as_root chown -R "${CURRENT_USER}:${CURRENT_USER}" "${DEPLOY_PATH}"
fi

# PM2 survit au reboot
if command -v pm2 >/dev/null 2>&1; then
  info "pm2 startup (systemd)"
  as_root env PATH="$PATH" pm2 startup systemd -u root --hp /root >/dev/null 2>&1 \
    || pm2 startup systemd -u root --hp /root >/dev/null 2>&1 \
    || warn "pm2 startup à configurer manuellement après premier deploy web"
fi

ok "Bootstrap terminé."
info "Suite manuelle:"
echo "  1. ./deploy/bin/dolci sync          # monorepo → ${DEPLOY_PATH}"
echo "  2. API: cp dolci-reva-api/.env.docker.example dolci-reva-api/.env && éditer (+ APP_KEY)"
echo "  3. Web: cp deploy/env/web.env.production.example dolci-reva-web/.env.production && éditer"
echo "  4. ./deploy/bin/dolci api --skip-pull && ./deploy/bin/dolci web --skip-pull"
echo "  5. DNS A → VPS puis ./deploy/bin/dolci ssl   # Nginx vhost + Let's Encrypt (Next :3001)"
echo "  Note: front PM2 écoute 127.0.0.1:3001 (folioas garde :3000 sur ce VPS)."
