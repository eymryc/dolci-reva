#!/usr/bin/env bash
# Shared helpers for Dolci Rêva homemade deploy tooling.
# shellcheck disable=SC2034

set -euo pipefail

DOLCI_DEPLOY_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOLCI_REPO_ROOT="$(cd "${DOLCI_DEPLOY_ROOT}/.." && pwd)"

# Colors (TTY only)
if [[ -t 1 ]]; then
  C_RESET='\033[0m'
  C_BOLD='\033[1m'
  C_DIM='\033[2m'
  C_RED='\033[31m'
  C_GREEN='\033[32m'
  C_YELLOW='\033[33m'
  C_BLUE='\033[34m'
  C_CYAN='\033[36m'
else
  C_RESET='' C_BOLD='' C_DIM='' C_RED='' C_GREEN='' C_YELLOW='' C_BLUE='' C_CYAN=''
fi

log()   { printf "${C_DIM}[%s]${C_RESET} %s\n" "$(date '+%H:%M:%S')" "$*"; }
info()  { printf "${C_BLUE}→${C_RESET} %s\n" "$*"; }
ok()    { printf "${C_GREEN}✓${C_RESET} %s\n" "$*"; }
warn()  { printf "${C_YELLOW}!${C_RESET} %s\n" "$*"; }
err()   { printf "${C_RED}✗${C_RESET} %s\n" "$*" >&2; }
die()   { err "$*"; exit 1; }
header() {
  printf "\n${C_BOLD}${C_CYAN}══ %s ══${C_RESET}\n" "$*"
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Commande requise introuvable: $1"
}

# sudo optionnel (root → rien)
init_sudo() {
  if [[ "${EUID}" -ne 0 ]]; then
    if command -v sudo >/dev/null 2>&1; then
      SUDO=(sudo)
    else
      die "Root ou sudo requis"
    fi
  else
    SUDO=()
  fi
}

# apt-get sûr avec DEBIAN_FRONTEND (root ou sudo)
apt_get() {
  if [[ ${#SUDO[@]} -gt 0 ]]; then
    "${SUDO[@]}" env DEBIAN_FRONTEND=noninteractive apt-get "$@"
  else
    env DEBIAN_FRONTEND=noninteractive apt-get "$@"
  fi
}

# Préfixe sudo optionnel pour une commande quelconque
as_root() {
  if [[ ${#SUDO[@]} -gt 0 ]]; then
    "${SUDO[@]}" "$@"
  else
    "$@"
  fi
}

# Load deploy/config/deploy.env (optional overrides via env)
load_deploy_config() {
  local cfg="${DOLCI_DEPLOY_CONFIG:-${DOLCI_DEPLOY_ROOT}/config/deploy.env}"
  if [[ -f "$cfg" ]]; then
    # shellcheck disable=SC1090
    set -a
    # shellcheck source=/dev/null
    source "$cfg"
    set +a
    info "Config: $cfg"
  else
    warn "Pas de config ($cfg) — variables d'environnement / défauts utilisés"
  fi

  DEPLOY_MODE="${DEPLOY_MODE:-remote}"                 # remote | local
  DEPLOY_HOST="${DEPLOY_HOST:-}"
  DEPLOY_USER="${DEPLOY_USER:-}"
  DEPLOY_SSH_KEY="${DEPLOY_SSH_KEY:-}"
  DEPLOY_SSH_PORT="${DEPLOY_SSH_PORT:-22}"
  DEPLOY_PATH="${DEPLOY_PATH:-/opt/dolci-reva}"
  GIT_REMOTE="${GIT_REMOTE:-origin}"
  GIT_BRANCH="${GIT_BRANCH:-main}"
  HEALTH_URL="${HEALTH_URL:-https://dolci-reva.com/up}"
  WEB_HEALTH_URL="${WEB_HEALTH_URL:-https://dolci-reva.com/}"
  DOMAIN="${DOMAIN:-dolci-reva.com}"
  DOMAIN_WWW="${DOMAIN_WWW:-www.${DOMAIN}}"
  CERTBOT_EMAIL="${CERTBOT_EMAIL:-noreply@${DOMAIN}}"
  SKIP_PULL="${SKIP_PULL:-0}"
  SKIP_MIGRATE="${SKIP_MIGRATE:-0}"
  SKIP_BUILD_IMAGES="${SKIP_BUILD_IMAGES:-0}"
  DOCKER_COMPOSE_FILE="${DOCKER_COMPOSE_FILE:-docker-compose.yml}"
  PM2_APP_NAME="${PM2_APP_NAME:-dolci-front}"
}

expand_path() {
  local p="${1:-}"
  if [[ "$p" == ~* ]]; then
    p="${p/#\~/$HOME}"
  fi
  printf '%s' "$p"
}

# Remplit le tableau global SSH_ARGS (compatible Bash 3 / macOS).
# IdentitiesOnly=yes évite "Too many authentication failures" (beaucoup de clés ~/.ssh).
build_ssh_args() {
  SSH_ARGS=(
    -o StrictHostKeyChecking=accept-new
    -o ConnectTimeout=15
    -o IdentitiesOnly=yes
    -p "${DEPLOY_SSH_PORT}"
  )
  local key
  key="$(expand_path "${DEPLOY_SSH_KEY}")"
  if [[ -n "${DEPLOY_SSH_KEY}" && -n "$key" && -f "$key" ]]; then
    SSH_ARGS+=(-i "$key")
  fi
}

require_remote_config() {
  [[ -n "${DEPLOY_HOST}" ]] || die "DEPLOY_HOST manquant (voir deploy/config/deploy.env)"
  [[ -n "${DEPLOY_USER}" ]] || die "DEPLOY_USER manquant (voir deploy/config/deploy.env)"
}

ssh_run() {
  require_remote_config
  build_ssh_args
  ssh "${SSH_ARGS[@]}" "${DEPLOY_USER}@${DEPLOY_HOST}" "$@"
}

# Run a script that lives in DEPLOY_PATH/deploy/scripts on the target machine.
# For remote: rsync ensure scripts are current, then ssh bash.
run_on_target() {
  local script_rel="$1"
  shift
  local script_local="${DOLCI_DEPLOY_ROOT}/scripts/${script_rel}"
  [[ -f "$script_local" ]] || die "Script introuvable: $script_local"

  if [[ "${DEPLOY_MODE}" == "local" ]]; then
    info "Mode local — exécution sur cette machine (${DEPLOY_PATH})"
    # Assurer que les scripts locaux du monorepo sont utilisés si DEPLOY_PATH == repo
    local target_script="${DEPLOY_PATH}/deploy/scripts/${script_rel}"
    if [[ ! -f "$target_script" ]]; then
      target_script="$script_local"
    fi
    (
      export DEPLOY_PATH GIT_REMOTE GIT_BRANCH SKIP_PULL SKIP_MIGRATE SKIP_BUILD_IMAGES
      export DOCKER_COMPOSE_FILE PM2_APP_NAME HEALTH_URL WEB_HEALTH_URL DOMAIN DOMAIN_WWW CERTBOT_EMAIL
      bash "$target_script" "$@"
    )
    return
  fi

  require_remote_config
  require_cmd rsync
  local key rsh
  key="$(expand_path "${DEPLOY_SSH_KEY}")"
  rsh="ssh -p ${DEPLOY_SSH_PORT} -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15"
  if [[ -n "$key" ]]; then
    rsh="${rsh} -i ${key}"
  fi

  info "Sync scripts deploy → ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/deploy/"
  # shellcheck disable=SC2029
  ssh -p "${DEPLOY_SSH_PORT}" ${DEPLOY_SSH_KEY:+-i "$(expand_path "$DEPLOY_SSH_KEY")"} \
    -o StrictHostKeyChecking=accept-new \
    "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${DEPLOY_PATH}/deploy'"

  rsync -az -e "$rsh" \
    --exclude 'config/deploy.env' \
    --exclude 'logs/' \
    --exclude '*.log' \
    "${DOLCI_DEPLOY_ROOT}/" \
    "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/deploy/"

  local quoted_args=""
  local a
  for a in "$@"; do
    quoted_args+=" $(printf '%q' "$a")"
  done

  info "SSH → ${script_rel}${quoted_args}"
  # shellcheck disable=SC2029
  ssh -p "${DEPLOY_SSH_PORT}" ${DEPLOY_SSH_KEY:+-i "$(expand_path "$DEPLOY_SSH_KEY")"} \
    -o StrictHostKeyChecking=accept-new \
    "${DEPLOY_USER}@${DEPLOY_HOST}" \
    "export DEPLOY_PATH='${DEPLOY_PATH}' GIT_REMOTE='${GIT_REMOTE}' GIT_BRANCH='${GIT_BRANCH}' \
            SKIP_PULL='${SKIP_PULL}' SKIP_MIGRATE='${SKIP_MIGRATE}' SKIP_BUILD_IMAGES='${SKIP_BUILD_IMAGES}' \
            DOCKER_COMPOSE_FILE='${DOCKER_COMPOSE_FILE}' PM2_APP_NAME='${PM2_APP_NAME}' \
            HEALTH_URL='${HEALTH_URL}' WEB_HEALTH_URL='${WEB_HEALTH_URL}' \
            DOMAIN='${DOMAIN:-dolci-reva.com}' DOMAIN_WWW='${DOMAIN_WWW:-www.dolci-reva.com}' \
            CERTBOT_EMAIL='${CERTBOT_EMAIL:-noreply@dolci-reva.com}'; \
     bash '${DEPLOY_PATH}/deploy/scripts/${script_rel}'${quoted_args}"
}

# Rsync monorepo local → VPS (premier envoi / sans git pull sur le serveur).
# N'écrase pas les .env déjà présents sur le serveur.
sync_monorepo_to_remote() {
  require_remote_config
  require_cmd rsync
  local repo_root key rsh
  repo_root="$(cd "${DOLCI_DEPLOY_ROOT}/.." && pwd)"
  [[ -d "${repo_root}/dolci-reva-api" ]] || die "Monorepo introuvable (dolci-reva-api manquant): $repo_root"
  [[ -d "${repo_root}/dolci-reva-web" ]] || die "Monorepo introuvable (dolci-reva-web manquant): $repo_root"

  key="$(expand_path "${DEPLOY_SSH_KEY}")"
  rsh="ssh -p ${DEPLOY_SSH_PORT} -o StrictHostKeyChecking=accept-new -o ConnectTimeout=15"
  if [[ -n "$key" ]]; then
    rsh="${rsh} -i ${key}"
  fi

  info "mkdir -p ${DEPLOY_PATH}"
  # shellcheck disable=SC2029
  ssh -p "${DEPLOY_SSH_PORT}" ${DEPLOY_SSH_KEY:+-i "$(expand_path "$DEPLOY_SSH_KEY")"} \
    -o StrictHostKeyChecking=accept-new \
    "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p '${DEPLOY_PATH}'"

  info "rsync monorepo → ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"
  rsync -az --delete -e "$rsh" \
    --exclude '.git/' \
    --exclude 'node_modules/' \
    --exclude '.next/' \
    --exclude 'vendor/' \
    --exclude '.env' \
    --exclude '.env.local' \
    --exclude '.env.production' \
    --exclude '.env.*.local' \
    --exclude 'deploy/config/deploy.env' \
    --exclude 'deploy/logs/' \
    --exclude 'backups/' \
    --exclude '*.log' \
    --exclude '.DS_Store' \
    --exclude 'storage/app/public/' \
    --exclude 'storage/app/private/' \
    --exclude 'storage/logs/' \
    --exclude 'storage/framework/cache/' \
    --exclude 'storage/framework/sessions/' \
    --exclude 'storage/framework/views/' \
    --exclude 'bootstrap/cache/*.php' \
    --exclude 'coverage/' \
    --exclude '.phpunit.result.cache' \
    "${repo_root}/" \
    "${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/"

  ok "Code sync → ${DEPLOY_PATH}"
  info "Les .env locaux n'ont pas été envoyés (sécurité). Crée-les sur le VPS si besoin."
}

git_pull_in() {
  local dir="$1"
  if [[ "${SKIP_PULL}" == "1" ]]; then
    warn "SKIP_PULL=1 — pas de git pull dans $dir"
    return 0
  fi
  [[ -d "$dir/.git" ]] || die "Pas de dépôt git dans $dir (utilise ./deploy/bin/dolci sync puis --skip-pull)"
  info "git fetch/pull ($GIT_REMOTE/$GIT_BRANCH) dans $dir"
  git -C "$dir" fetch --prune "$GIT_REMOTE"
  git -C "$dir" checkout "$GIT_BRANCH"
  git -C "$dir" pull --ff-only "$GIT_REMOTE" "$GIT_BRANCH"
  ok "Code à jour: $(git -C "$dir" rev-parse --short HEAD)"
}

compose() {
  # Prefer docker compose v2
  if docker compose version >/dev/null 2>&1; then
    docker compose -f "${DOCKER_COMPOSE_FILE}" "$@"
  else
    docker-compose -f "${DOCKER_COMPOSE_FILE}" "$@"
  fi
}
