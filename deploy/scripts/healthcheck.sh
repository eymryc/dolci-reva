#!/usr/bin/env bash
# Vérifie santé API locale Docker, front PM2, et URLs publiques.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/common.sh
source "${SCRIPT_DIR}/../lib/common.sh"

DEPLOY_PATH="${DEPLOY_PATH:-/opt/dolci-reva}"
API_DIR="${DEPLOY_PATH}/dolci-reva-api"
HEALTH_URL="${HEALTH_URL:-https://dolci-reva.com/up}"
WEB_HEALTH_URL="${WEB_HEALTH_URL:-https://dolci-reva.com/}"
PM2_APP_NAME="${PM2_APP_NAME:-dolci-front}"
FAIL=0

header "Healthcheck"

check_http() {
  local label="$1" url="$2" expect="${3:-}"
  local code
  code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 20 "$url" || echo '000')"
  if [[ -n "$expect" ]]; then
    if [[ "$code" == "$expect" ]]; then
      ok "$label → HTTP $code ($url)"
    else
      err "$label → HTTP $code (attendu $expect) ($url)"
      FAIL=1
    fi
  else
    if [[ "$code" =~ ^2|^3 ]]; then
      ok "$label → HTTP $code ($url)"
    else
      err "$label → HTTP $code ($url)"
      FAIL=1
    fi
  fi
}

if [[ -d "$API_DIR" ]]; then
  cd "$API_DIR"
  if command -v docker >/dev/null 2>&1; then
    info "Docker services:"
    if docker compose ps 2>/dev/null; then
      :
    else
      warn "docker compose ps failed"
    fi
  fi
  check_http "API locale" "http://127.0.0.1:8080/up" "200"
fi

if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe "${PM2_APP_NAME}" >/dev/null 2>&1; then
    ok "PM2 app ${PM2_APP_NAME} présente"
    check_http "Front locale" "http://127.0.0.1:${WEB_PORT:-3001}/"
  else
    err "PM2 app ${PM2_APP_NAME} absente"
    FAIL=1
  fi
fi

check_http "API publique /up" "${HEALTH_URL}"
check_http "Site public" "${WEB_HEALTH_URL}"

if [[ "$FAIL" -ne 0 ]]; then
  die "Un ou plusieurs checks ont échoué"
fi
ok "Tous les healthchecks OK"
