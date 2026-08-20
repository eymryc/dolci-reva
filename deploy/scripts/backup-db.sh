#!/usr/bin/env bash
# Backup MySQL (volume Docker) + optionnel storage médias.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=../lib/common.sh
source "${SCRIPT_DIR}/../lib/common.sh"

DEPLOY_PATH="${DEPLOY_PATH:-/opt/dolci-reva}"
API_DIR="${DEPLOY_PATH}/dolci-reva-api"
BACKUP_ROOT="${BACKUP_ROOT:-${DEPLOY_PATH}/backups}"
STAMP="$(date '+%Y%m%d_%H%M%S')"
KEEP_DAYS="${KEEP_DAYS:-14}"

header "Backup DB"
[[ -d "$API_DIR" ]] || die "API dir manquant: $API_DIR"
[[ -f "${API_DIR}/.env" ]] || die ".env API manquant"
require_cmd docker

# shellcheck disable=SC1091
set -a
# shellcheck source=/dev/null
source "${API_DIR}/.env"
set +a

DB_NAME="${DB_DATABASE:-dolci_reva}"
DB_USER="${DB_USERNAME:-dolci_user}"
DB_PASS="${DB_PASSWORD:?DB_PASSWORD manquant dans .env}"

mkdir -p "${BACKUP_ROOT}/db"
OUT="${BACKUP_ROOT}/db/${DB_NAME}_${STAMP}.sql.gz"

info "mysqldump → $OUT"
cd "$API_DIR"
compose exec -T mysql mysqldump -u"${DB_USER}" -p"${DB_PASS}" "${DB_NAME}" | gzip -c > "$OUT"
ok "DB backup: $OUT ($(du -h "$OUT" | awk '{print $1}'))"

if [[ "${BACKUP_STORAGE:-0}" == "1" ]]; then
  mkdir -p "${BACKUP_ROOT}/storage"
  TAR="${BACKUP_ROOT}/storage/storage_${STAMP}.tar.gz"
  info "Tar storage → $TAR"
  tar -czf "$TAR" -C "${API_DIR}" storage/app/public 2>/dev/null || warn "storage/app/public vide ou absent"
  ok "Storage backup: $TAR"
fi

info "Purge backups > ${KEEP_DAYS} jours"
find "${BACKUP_ROOT}" -type f \( -name '*.sql.gz' -o -name '*.tar.gz' \) -mtime "+${KEEP_DAYS}" -delete 2>/dev/null || true
ok "Backup terminé"
