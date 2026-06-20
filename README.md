# Sivan Altar — Website

Personal website for Sivan Altarowitz, emotional coach (Satya method). Built with React + Vite frontend and Express + PostgreSQL backend.

## Local development

1. Clone the repository
2. Install frontend dependencies: `npm install`
3. Install server dependencies: `cd server && npm install`
4. Create `server/.env` with `DATABASE_URL=postgres://...`
5. Run migrations: `cd server && npm run migrate`
6. Start the server: `cd server && npm run dev`
7. Start the frontend: `npm run dev`

## Deployment

Pushes to `master` trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`) which:
- Builds the React frontend
- Syncs `dist/` to the VM via rsync
- Syncs `server/` to the VM
- Reloads nginx
- Runs database migrations
- Restarts the Node process via pm2

## Monitoring deploys with Claude Code

A `GITHUB_TOKEN` (fine-grained PAT with Actions read permission) is provisioned in `~/.bashrc` on the dev VM so Claude Code can monitor GitHub Actions runs:

```bash
# ~/.bashrc
export GITHUB_TOKEN=github_pat_...
```

Claude Code uses this token to poll `https://api.github.com/repos/berenfeld/sivanaltar/actions/runs` and report deploy status without needing the `gh` CLI.

To rotate the token: generate a new fine-grained PAT at https://github.com/settings/tokens with **Actions: read** permission on this repo, then update `~/.bashrc`.

## Architecture

| Layer | Tech |
|-------|------|
| Frontend | React 18, Vite, Tailwind CSS, react-router-dom v6 |
| Backend | Express, PostgreSQL, node-pg-migrate |
| Auth | Google OAuth via custom auth flow |
| Hosting | Ubuntu VM, nginx reverse proxy, pm2 |
| CI/CD | GitHub Actions → rsync to VM |

## Server access

```bash
ssh -i ~/.ssh/sivanaltar.com-access ubuntu@www.sivanaltar.com
```

Key paths on the server:
- App dist: `/var/www/sivanaltar/app/dist/`
- Uploads: `/var/www/sivanaltar/uploads/`
- Server code: `/var/www/sivanaltar/server/`

For one-off file drops that don't need a full deploy (e.g. webmaster verification files):
```bash
scp -i ~/.ssh/sivanaltar.com-access <file> ubuntu@www.sivanaltar.com:/var/www/sivanaltar/app/dist/<file>
```

## nginx

Config lives in `scripts/nginx.conf` and is deployed on every push. Key routing:
- `/api/*` → Express on port 3001
- `/sitemap.xml` → Express on port 3001 (dynamic, includes blog posts)
- `/uploads/*` → `/var/www/sivanaltar/uploads/`
- Everything else → React SPA (`dist/index.html`)
