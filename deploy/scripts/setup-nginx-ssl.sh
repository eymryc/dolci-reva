#!/usr/bin/env bash
# Installe / met à jour le vhost Nginx + certificat Let's Encrypt (Certbot).
# Idempotent : n'écrase pas un cert existant (sauf --force-renew).
#
# Usage:
#   bash deploy/scripts/setup-nginx-ssl.sh
#   bash deploy/scripts/setup-nginx-ssl.sh --force-renew
#   ./deploy/bin/dolci ssl
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/common.sh
source "${SCRIPT_DIR}/../lib/common.sh"

FORCE_RENEW=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --force-renew) FORCE_RENEW=1; shift ;;
    *) shift ;;
  esac
done

DEPLOY_PATH="${DEPLOY_PATH:-/opt/dolci-reva}"
DOMAIN="${DOMAIN:-dolci-reva.com}"
DOMAIN_WWW="${DOMAIN_WWW:-www.${DOMAIN}}"
CERTBOT_EMAIL="${CERTBOT_EMAIL:-noreply@${DOMAIN}}"
NGINX_SITE_SRC="${DEPLOY_PATH}/deploy/nginx/dolci-reva.com.conf"
NGINX_AVAILABLE="/etc/nginx/sites-available/dolci-reva.com.conf"
NGINX_ENABLED="/etc/nginx/sites-enabled/dolci-reva.com.conf"
CERT_LIVE="/etc/letsencrypt/live/${DOMAIN}"

header "Nginx + Let's Encrypt (Certbot)"

init_sudo
require_cmd nginx

info "Paquets certbot (idempotent apt)"
apt_get update -y
apt_get install -y nginx certbot python3-certbot-nginx

[[ -f "$NGINX_SITE_SRC" ]] || die "Vhost source manquant: $NGINX_SITE_SRC"

info "Déploiement vhost (routing / upstreams) → $NGINX_AVAILABLE"
as_root cp "$NGINX_SITE_SRC" "$NGINX_AVAILABLE"
as_root ln -sfn "$NGINX_AVAILABLE" "$NGINX_ENABLED"
as_root rm -f /etc/nginx/sites-enabled/default

info "nginx -t + reload"
as_root nginx -t
as_root systemctl enable nginx
as_root systemctl reload nginx
ok "Nginx HTTP OK pour ${DOMAIN} / ${DOMAIN_WWW}"

issue_or_renew() {
  # Non-interactif ; --nginx modifie le vhost pour HTTPS automatiquement
  if [[ "$FORCE_RENEW" == "1" ]]; then
    as_root certbot --nginx \
      -d "${DOMAIN}" \
      -d "${DOMAIN_WWW}" \
      --non-interactive \
      --agree-tos \
      --email "${CERTBOT_EMAIL}" \
      --redirect \
      --force-renewal
  else
    as_root certbot --nginx \
      -d "${DOMAIN}" \
      -d "${DOMAIN_WWW}" \
      --non-interactive \
      --agree-tos \
      --email "${CERTBOT_EMAIL}" \
      --redirect
  fi
}

# Après chaque cp du conf HTTP-only : réinjecter le certificat si déjà émis
# (sinon un 2e `dolci ssl` écrase HTTPS sans le restaurer).
ensure_certbot_installed_in_nginx() {
  if [[ ! -d "$CERT_LIVE" ]]; then
    return 1
  fi
  info "Réinjection certificat Certbot dans le vhost (idempotent)"
  as_root certbot install \
    --cert-name "${DOMAIN}" \
    --nginx \
    --non-interactive \
    --reinstall 2>/dev/null \
  || as_root certbot --nginx \
      -d "${DOMAIN}" \
      -d "${DOMAIN_WWW}" \
      --non-interactive \
      --agree-tos \
      --email "${CERTBOT_EMAIL}" \
      --redirect \
      --keep-until-expiring
  as_root nginx -t
  as_root systemctl reload nginx
}

if [[ -d "$CERT_LIVE" && "$FORCE_RENEW" != "1" ]]; then
  ok "Certificat déjà présent: $CERT_LIVE"
  ensure_certbot_installed_in_nginx
  info "Test renouvellement à sec (certbot renew --dry-run)"
  if as_root certbot renew --dry-run; then
    ok "Renouvellement automatique OK (timer/cron certbot)"
  else
    warn "dry-run renew a échoué — vérifie DNS / ports 80-443"
  fi
else
  info "Émission certificat Let's Encrypt pour ${DOMAIN}"
  issue_or_renew
  ok "HTTPS actif pour https://${DOMAIN}"
fi

if systemctl list-unit-files 2>/dev/null | grep -q certbot.timer; then
  as_root systemctl enable --now certbot.timer 2>/dev/null || true
  ok "certbot.timer activé (renouvellement auto)"
else
  warn "certbot.timer introuvable — ajoute un cron: 0 3 * * * certbot renew --quiet"
fi

info "Vérif HTTPS"
code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "https://${DOMAIN}/" || echo '000')"
if [[ "$code" =~ ^2|^3 ]]; then
  ok "https://${DOMAIN}/ → HTTP $code"
else
  warn "https://${DOMAIN}/ → HTTP $code (front/API peut ne pas tourner encore)"
fi

ok "Setup SSL terminé"
