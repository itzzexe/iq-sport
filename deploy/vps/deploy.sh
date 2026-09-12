#!/usr/bin/env bash
# Deploys a new release of the site and switches to it with a few seconds of
# downtime at most. Run as root:
#
#   /opt/iq-sport/deploy.sh                 # pull main from GitHub (needs the deploy key added there)
#   /opt/iq-sport/deploy.sh --tar FILE.tgz  # deploy from an uploaded `git archive` tarball
#
# Layout:  /opt/iq-sport/releases/<timestamp>  (code + build)
#          /opt/iq-sport/app -> current release
#          /opt/iq-sport/data, /media, /.env   (persistent, linked into every release)
set -euo pipefail

ROOT=/opt/iq-sport
APP_USER=iqsport
REPO=git@github.com:itzzexe/iq-sport.git
BRANCH=main
STAMP=$(date +%Y%m%d-%H%M%S)
NEW=$ROOT/releases/$STAMP
as_app() { runuser -u "$APP_USER" -- env HOME="$ROOT" npm_config_cache="$ROOT/.npm-cache" NODE_OPTIONS=--no-deprecation "$@"; }

echo "== fetching code → $NEW"
mkdir -p "$NEW" "$ROOT/.npm-cache"
chown "$APP_USER:$APP_USER" "$NEW" "$ROOT/.npm-cache"
if [ "${1:-}" = "--tar" ]; then
  tar -xzf "$2" -C "$NEW"
  chown -R "$APP_USER:$APP_USER" "$NEW"
else
  as_app git clone --depth 1 --branch "$BRANCH" "$REPO" "$NEW"
fi

echo "== environment"
# Database and uploads live outside the release (absolute paths in .env), so no
# symlinks are needed inside the project — Turbopack refuses links that point
# out of the project root. A fresh copy of .env is what `next build` reads.
rm -rf "$NEW/data" "$NEW/public/media"
install -o "$APP_USER" -g "$APP_USER" -m 600 "$ROOT/.env" "$NEW/.env"

echo "== installing dependencies"
( cd "$NEW" && as_app npm ci --no-audit --no-fund )

echo "== building (applies migrations, seeds an empty database)"
# The build reads .env; the service passes the same file at runtime.
( cd "$NEW" && set -a && . "$ROOT/.env" && set +a && as_app npm run build )

echo "== switching release"
PREV=$(readlink -f "$ROOT/app" 2>/dev/null || true)
ln -sfn "$NEW" "$ROOT/app.tmp" && mv -Tf "$ROOT/app.tmp" "$ROOT/app"
systemctl restart iq-sport.service
sleep 3
if ! curl -fsS -o /dev/null --max-time 60 "http://127.0.0.1:$(grep ^PORT= "$ROOT/.env" | cut -d= -f2)/"; then
  echo "!! new release did not answer; rolling back" >&2
  if [ -n "$PREV" ] && [ -d "$PREV" ]; then
    ln -sfn "$PREV" "$ROOT/app.tmp" && mv -Tf "$ROOT/app.tmp" "$ROOT/app"
    systemctl restart iq-sport.service
  fi
  exit 1
fi

echo "== cleaning old releases (keeping the last 3)"
ls -1dt "$ROOT"/releases/* | tail -n +4 | xargs -r rm -rf

echo "== deployed $STAMP"
