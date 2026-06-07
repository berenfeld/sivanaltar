# Migration: Sivanaltar base44 → Self-Hosted AWS VM

## Overview

Sivan Altararovici's life-coaching website was running on the [base44](https://base44.app) platform which provided auth, entity CRUD, file storage, email, LLM, and serverless functions as a managed service. This document describes the migration to a self-hosted Ubuntu 24 AWS VM with no remaining dependency on base44 infrastructure.

---

## Repository Structure After Migration

```
sivanaltar-base44/
├── src/                         ← React frontend (mostly unchanged)
├── base44-sdk/                  ← DROP-IN REPLACEMENT for @base44/sdk
│   ├── package.json             (name: "@base44/sdk" — same as original)
│   └── index.js                 (same API surface: entities, auth, integrations, functions)
├── server/                      ← Express.js backend (Node 20)
│   ├── index.js                 (entry point, port 3001)
│   ├── db/
│   │   ├── schema.sql           (PostgreSQL table definitions)
│   │   └── pool.js              (pg connection pool)
│   ├── routes/
│   │   ├── auth.js              (Google OAuth 2.0 + JWT httpOnly cookie)
│   │   ├── entities.js          (generic CRUD for all 9 entity tables)
│   │   ├── upload.js            (Multer → local disk)
│   │   ├── integrations.js      (SendEmail via Nodemailer, InvokeLLM via Anthropic SDK)
│   │   └── functions.js         (invokeAiGuidance — ported from Deno)
│   └── middleware/
│       └── requireAuth.js       (JWT cookie → req.user)
├── scripts/
│   ├── bootstrap.sh             (run once on VM as root)
│   └── import-data.js           (one-shot: base44 data dump → postgres)
├── package.json                 (root — @base44/sdk points to file:./base44-sdk)
└── vite.config.js               (no more @base44/vite-plugin)
```

---

## Architecture

```
[Browser] ──HTTPS──▶ [Nginx :443 / :80]
                          │
              ┌───────────┼────────────────┐
              │                            │
    static /var/www/sivanaltar/    /api/* → [Express :3001]
           app/dist/                               │
    /uploads/ → local disk         ┌──────────────┼──────────────┐
                              [PostgreSQL]   [/var/www/sivanaltar/  [External]
                                             uploads/]             Google OAuth
                                                                   Nodemailer SMTP
                                                                   Anthropic API
```

---

## The Drop-in SDK (`base44-sdk/`)

The original `@base44/sdk` package provided:
- `base44.auth.{me, isAuthenticated, redirectToLogin, logout}`
- `base44.entities.<EntityName>.{list, filter, create, update, delete}`
- `base44.integrations.Core.{UploadFile, SendEmail, InvokeLLM}`
- `base44.functions.invoke(name, args)`

Our replacement in `base44-sdk/index.js` exposes **exactly the same API** and routes all calls to our own Express backend at `VITE_API_BASE_URL`. This means **zero changes** to any page component.

---

## Environment Variables

### Server (`server/.env`)
```
DATABASE_URL=postgresql://sivanaltar:sivanaltar@localhost/sivanaltar

GOOGLE_CLIENT_ID=<from Google Cloud Console>
GOOGLE_CLIENT_SECRET=<from Google Cloud Console>
GOOGLE_CALLBACK_URL=http://51.102.220.193/api/auth/google/callback

JWT_SECRET=<generate with: openssl rand -hex 32>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<gmail address>
SMTP_PASS=<gmail app password>
SMTP_FROM_NAME=אתר סיון אלטרוביץ

ANTHROPIC_API_KEY=<from Anthropic console>

UPLOADS_DIR=/var/www/sivanaltar/uploads
PUBLIC_URL=http://51.102.220.193
```

### Frontend (`.env.production` in repo root)
```
VITE_API_BASE_URL=http://51.102.220.193/api
```

---

## VM Setup (Ubuntu 24, IP: 51.102.220.193)

Run once as root:
```bash
bash scripts/bootstrap.sh
```

This installs: Node 20, PostgreSQL 16, Nginx, PM2, creates OS user `sivanaltar`, creates DB `sivanaltar` (user: `sivanaltar`, password: `sivanaltar`).

---

## Deployment

```bash
# On your local machine:
npm run build                              # builds frontend to dist/
rsync -avz dist/ ubuntu@51.102.220.193:/var/www/sivanaltar/app/dist/
rsync -avz server/ ubuntu@51.102.220.193:/var/www/sivanaltar/server/
rsync -avz server/.env ubuntu@51.102.220.193:/var/www/sivanaltar/server/.env

# On the VM:
cd /var/www/sivanaltar/server && npm install
pm2 restart sivanaltar || pm2 start index.js --name sivanaltar
```

---

## Data Migration (one-time)

1. Export all entity data from base44 (JSON dump via base44 admin token or data export)
2. Download all images from base44 CDN URLs found in entity data
3. Run: `node scripts/import-data.js <path-to-dump.json>`
4. Images land in `/var/www/sivanaltar/uploads/`; DB records updated with `/uploads/...` paths

---

## Adding SSL Later (after DNS cutover to sivanaltar.com)

```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d sivanaltar.com -d www.sivanaltar.com
```

Certbot auto-rewrites the nginx config to add HTTPS and redirects from port 80.

---

## Ran's TODO List

### Credentials & Secrets (fill into `/var/www/sivanaltar/server/.env` on the VM)

- [ ] **Google OAuth** — Google client ID+secret are in `.env` but the redirect URI `http://51.102.220.193/api/auth/google/callback` is **blocked by Google** (IP-only URIs not allowed). Cannot test login until DNS cutover to `sivanaltar.com`.
- [ ] **SMTP / Email** — Fill in `SMTP_USER` and `SMTP_PASS` in `.env`, then `pm2 restart sivanaltar --update-env`
- [ ] **Anthropic API key** — Fill in `ANTHROPIC_API_KEY` in `.env`, then `pm2 restart sivanaltar --update-env`
- [ ] After filling in `.env`: `ssh -i ~/.ssh/sivanaltar.com-access ubuntu@51.102.220.193 "pm2 restart sivanaltar --update-env"`

### Data Migration

- [x] Exported all CSVs from base44 dashboard
- [x] Imported into PostgreSQL (blog posts, gallery, appointments, working hours, contact messages, sessions, AI config)
- [x] Gallery images downloaded from base44 CDN → stored in `/var/www/sivanaltar/uploads/`
- [x] Blog post images downloaded

### GitHub Actions CI/CD

- [x] Secrets `VM_HOST` and `VM_SSH_KEY` provisioned in GitHub
- [x] Branch `self-hosted-migration` — pipeline deploys on every push
- [x] Pipeline tested and working
- [ ] After DNS cutover: update workflow trigger to also include `main` (or merge branch)

### Pages Status (verified at http://51.102.220.193)

- [x] Home — loads, images display
- [x] Blog — posts load
- [x] Gallery — images load
- [x] Calendar — loads (null-time crash fixed)
- [ ] Contact form — needs SMTP credentials to test email delivery
- [ ] FloatingChat AI — needs Anthropic API key
- [ ] Any admin editing — needs Google login (blocked until domain)

### SSL / Domain Cutover (do in order)

- [ ] Fill in SMTP + Anthropic in `.env` on VM and restart server
- [ ] Point `sivanaltar.com` DNS A record → `51.102.220.193`
- [ ] SSH into VM: `sudo apt-get install -y certbot python3-certbot-nginx && sudo certbot --nginx -d sivanaltar.com -d www.sivanaltar.com`
- [ ] Update `GOOGLE_CALLBACK_URL` in `.env` → `https://sivanaltar.com/api/auth/google/callback`
- [ ] Add `https://sivanaltar.com/api/auth/google/callback` to Google OAuth authorised redirect URIs
- [ ] Update `.env.production` in repo: `VITE_API_BASE_URL=https://sivanaltar.com/api` → push to trigger deploy
- [ ] Restart server: `pm2 restart sivanaltar --update-env`
- [ ] Test Google login end-to-end

### Final Smoke Test (after domain + credentials)

- [ ] Google login works
- [ ] Admin can edit blog, gallery, working hours
- [ ] Book an appointment → email notification received by both admin addresses
- [ ] Contact form → email delivered
- [ ] Upload an image in Gallery → image appears at `/uploads/...`
- [ ] FloatingChat responds in Hebrew, respects 3-question limit
- [ ] Confirm no remaining `base44.app` URLs anywhere in the live site

---

## What Didn't Change

- All React page components, hooks, modals — untouched
- TanStack Query, Radix UI, Tailwind, TinyMCE — untouched
- react-router-dom routing — untouched
- Entity usage patterns (`base44.entities.BlogPost.list()` etc.) — untouched
