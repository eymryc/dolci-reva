#!/usr/bin/env bash
# Déploie API puis Web séquentiellement.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/common.sh
source "${SCRIPT_DIR}/../lib/common.sh"

header "Déploiement complet (API + Web)"

bash "${SCRIPT_DIR}/deploy-api.sh" "$@"
bash "${SCRIPT_DIR}/deploy-web.sh" "$@"
bash "${SCRIPT_DIR}/healthcheck.sh" || warn "Healthcheck public en échec — vérifier Nginx / DNS / SSL"

ok "Déploiement ALL terminé"
