# VPS deployment (iq.iq-a2z.com)

Ubuntu 24.04 · Node 22 · nginx + Let's Encrypt · systemd · SQLite on disk.

| Path on the server | Purpose |
|---|---|
| `/opt/iq-sport/app` | symlink to the current release (`releases/<timestamp>`) |
| `/opt/iq-sport/data/iq-sport.db` | the database (never inside a release) |
| `/opt/iq-sport/media` | uploaded files (`MEDIA_DIR`) |
| `/opt/iq-sport/.env` | secrets + `NEXT_PUBLIC_SERVER_URL`; copied into every release |
| `/opt/iq-sport/backups` | nightly SQLite snapshot + media archive, 14 days |
| `/opt/iq-sport/.ssh/deploy_key` | read-only GitHub deploy key used by `deploy.sh` |

- `setup-server.sh` — one-time, idempotent: app user, systemd unit, nginx vhost, certificate, firewall rule, backup cron.
- `deploy.sh` — builds a new release and switches to it (rolls back if the new release does not answer):
  - `deploy.sh` pulls `main` from GitHub (add the deploy key under *Settings → Deploy keys* first);
  - `deploy.sh --tar file.tgz` deploys an uploaded `git archive --format=tgz HEAD` instead.

Service: `systemctl status iq-sport` · logs: `journalctl -u iq-sport -f` · app port 3400 is loopback-only (ufw).
