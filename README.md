# Litter Hero

**Grupp 2 · [CHAS Challenge 2026](https://git.chas-lab.dev/chas-challenge-2026/grupp-2/grupp-2)**

Litter Hero is a community-driven web application for reporting litter and verifying cleanups. Users photograph trash, pin it on a map, and earn points for reporting and cleaning up. Cleanup proof is validated through **community voting** — turning individual action into a shared, transparent workflow.

---

## Links

| Resource | URL |
|----------|-----|
| **GitLab repository** | [git.chas-lab.dev/chas-challenge-2026/grupp-2/grupp-2](https://git.chas-lab.dev/chas-challenge-2026/grupp-2/grupp-2) _(private — jury access via DevOps)_ |
| **Live web app** | _[Not deployed yet — add URL here when ready]_ |
| **Demo video** | _[Add link or embed when ready — e.g. GitLab snippet, YouTube, or `docs/demo.mp4`]_ |

<!-- Demo video embed placeholder — replace with your video when ready:
[![Litter Hero demo](docs/demo-thumbnail.png)](docs/demo.mp4)
-->

---

## Project summary

**Litter Hero** helps communities fight litter through Tech for Good. Anyone can report trash with a photo and GPS location; volunteers submit cleanup proof that peers verify by vote — no central moderation needed. Points, badges, and a leaderboard reward both reporting and verified cleanups. The app is production-ready: containerised, deployed on Kubernetes with CI/CD, security scanning, and Prometheus monitoring.

---

## Tech for Good

**CHAS Challenge 2026 theme:** _Tech for Good_

Litter Hero applies technology to a real environmental and social problem: litter harms nature, public spaces, and community pride, yet reporting and follow-up are often disconnected.

| How we address the theme | What it means in practice |
|--------------------------|---------------------------|
| **Environmental impact** | Makes litter visible on a map, tracks it from report → cleanup → verified clean |
| **Community empowerment** | Peer voting verifies cleanups — trust is distributed, not top-down |
| **Accessibility of action** | Mobile-first UI, camera capture, automatic location — low friction to participate |
| **Transparency** | Open report lifecycle, vote counts, and points tied to verified outcomes |
| **Sustainable engineering** | Cloud-native deployment on shared CHAS infrastructure — built to run, not just demo |

Our solution gives everyday citizens a practical way to report litter, verify cleanups, and care for shared spaces together.

---

## What makes Litter Hero unique

- **Report → clean → verify loop** in one product — not just a reporting tool.
- **Community verification** replaces manual moderation: 3-vote threshold, conflict-of-interest rules, and automatic report closure.
- **Size-aware gamification** — larger cleanups earn more points, nudging effort toward bigger impact.
- **Production-grade delivery** — full GitLab CI/CD pipeline, Kubernetes manifests, image security scanning, and observability out of the box.
- **Documented API** — Swagger UI for every endpoint, plus backend unit tests on core workflow logic.

---

## Table of contents

- [Demo video](#demo-video)
- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [DevOps & infrastructure](#devops--infrastructure)
- [Getting started](#getting-started)
- [API documentation](#api-documentation)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Team](#team)
- [Project structure](#project-structure)

---

## Demo video

_[Section reserved for your short demo video. Suggested content: report litter → view on map → submit cleanup proof → community vote → points & leaderboard.]_

```
<!-- Replace this block when your video is ready:

Option A — link:
Watch the demo: [Litter Hero walkthrough](YOUR_VIDEO_URL)

Option B — local file in repo:
![Demo thumbnail](docs/demo-thumbnail.png)
[▶ Watch demo](docs/demo.mp4)

Option C — embedded (YouTube/Vimeo):
<iframe ...></iframe>

-->
```

---

## Features

### Report litter

- Capture a photo via **camera** or file upload.
- Location from **EXIF GPS**, **browser geolocation**, or **manual map picker**.
- Categorise litter (Mixed, Plastic, Cardboard, Metal, Glass, Organic) and estimate size (Small / Medium / Large).
- Anti-abuse safeguards: rate limiting, minimum image size, duplicate detection within 20 m radius.

### Explore reports

- **Map view** — Interactive Leaflet map with markers, status filters, “needs votes” shortcut, and user location.
- **Reports list** — Filterable list with status badges, thumbnails, and image preview.
- **Report detail** (`/reports/:id`) — Full view with cleanup submissions and voting.

### Community cleanup verification

Users submit **after-photos** as cleanup proof. Submissions enter community voting:

| Rule | Detail |
|------|--------|
| Vote threshold | 3 votes per submission |
| Outcome | Majority **clean** → approved; otherwise rejected |
| Restrictions | Reporter and submitter cannot vote on their own submission |
| Report lifecycle | `open` → `cleanup_pending_vote` → `cleaned` |

Approved submissions mark the report as cleaned, expire competing pending submissions, and award points to the cleaner.

### Points & gamification

| Action | Small | Medium | Large |
|--------|------:|-------:|------:|
| Report litter | +10 | +15 | +20 |
| Approved cleanup | +20 | +30 | +40 |

- **Leaderboard** — Top users by points with time-period filtering.
- **Profile** — Points, weekly activity, reports created, cleanups approved, votes cast, and milestone badges.
- **Badges** — e.g. First Report, First Cleanup, 5 / 10 / 50 Cleanups.

### Authentication & UX

- Email/password and **Google OAuth** sign-in (JWT).
- Auth-gated reporting, cleanup submission, and voting with clear login prompts.
- Mobile-first bottom navigation; desktop top bar.
- Light / dark theme with system preference support.

---

## Tech stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS 4, Leaflet |
| **Backend** | Node.js, Express 5, TypeScript, Zod |
| **Database** | PostgreSQL + PostGIS, Drizzle ORM, Drizzle Kit |
| **Storage** | Garage (S3-compatible) for images |
| **Auth** | JWT, bcrypt, Google OAuth |
| **API docs** | Swagger UI at `/api-docs` |
| **Observability** | Prometheus (`express-prom-bundle`), Grafana dashboard, alert rules |
| **Infrastructure** | Docker, Kubernetes (k3s), Traefik, GitLab CI/CD |
| **Security** | Trivy container image scanning in CI |

---

## Architecture

```
┌─────────────┐     HTTPS      ┌──────────────┐     /api/*     ┌─────────────┐
│   Browser   │ ──────────────▶│   Frontend   │ ─────────────▶│   Backend   │
│  (React SPA)│                │    (Nginx)   │               │  (Express)  │
└─────────────┘                └──────────────┘               └──────┬──────┘
                                                                      │
                                                    ┌─────────────────┼─────────────────┐
                                                    ▼                 ▼                 ▼
                                              ┌──────────┐    ┌──────────┐    ┌──────────┐
                                              │ PostGIS  │    │  Garage  │    │Prometheus│
                                              │    DB    │    │   (S3)   │    │ /metrics │
                                              └──────────┘    └──────────┘    └──────────┘
```

- Single-page React app; Nginx serves static assets and proxies `/api/*` to the backend in production.
- Images upload to Garage; the API stores public URLs in PostgreSQL.
- Database migrations run as a Kubernetes Job before each deploy.

---

## DevOps & infrastructure

DevOps is a core part of this delivery — not an afterthought.

### GitLab CI/CD pipeline

Defined in [`.gitlab-ci.yml`](./.gitlab-ci.yml):

| Stage | What it does |
|-------|--------------|
| **Build** | Multi-stage Docker builds for frontend, backend, and deploy utilities; pushed to GitLab Container Registry with layer caching |
| **Scan** | [Trivy](https://trivy.dev/) scans images for HIGH/CRITICAL vulnerabilities; HTML reports saved as CI artifacts |
| **Deploy** | Automated deploy to CHAS k3s cluster — review apps on feature branches, production on `main` |
| **Cleanup** | Manual teardown of review environments when a branch is done |

### Kubernetes

Manifests in [`k8s/`](./k8s/):

- **Frontend & backend** Deployments with branch-scoped naming (`frontend-${CI_COMMIT_REF_SLUG}`)
- **PostGIS database** Stateful deployment with persistent volume
- **DB migration Job** runs Drizzle migrations before app rollout
- **Ingress** via Traefik — separate routes for SPA and `/api` proxy
- **Secrets** — GitLab registry pull secrets, app credentials via external secrets operator
- **Review environments** — per-branch URLs (`{branch}-litter-hero.cc.k3s.chas-lab.dev`)

### Observability & alerting

[`k8s/90-monitoring.yml`](./k8s/90-monitoring.yml) includes:

- **ServiceMonitor** — scrapes backend `/metrics` every 15 s
- **PrometheusRule** alerts — high 5xx rate, no traffic, traffic spikes
- **Grafana dashboard** — request rate by path, error ratio, p95 latency, status code breakdown

### Local development parity

[`docker-compose.local.yml`](./docker-compose.local.yml) runs frontend, backend, PostGIS, and Drizzle Studio — same stack as production, without Kubernetes overhead.

### Security practices

- Container image vulnerability scanning in CI (Trivy)
- JWT-authenticated API; role-based middleware for admin routes
- Environment secrets never committed — `.env.example` templates only
- Swagger-documented API surface for auditability

---

## Getting started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- Copy [`.env.example`](./.env.example) to `.env` and fill in Postgres, JWT, Google OAuth, and Garage S3 credentials

### Run locally

```bash
docker compose -f docker-compose.local.yml up -d --build
docker compose logs -f
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Swagger docs | http://localhost:3000/api-docs |
| Drizzle Studio | http://localhost:4983 |

Migrations run automatically when the backend container starts.

### Run without Docker

```bash
# Backend
cd backend && cp .env.example .env && npm install && npm run db:migrate && npm run dev

# Frontend (separate terminal)
cd frontend && cp .env.example .env && npm install && npm run dev
```

Set `VITE_API_URL=http://localhost:3000` in frontend `.env` when not using the Nginx proxy.

---

## API documentation

Interactive Swagger UI at **`/api-docs`** when the backend is running.

| Group | Base path | Description |
|-------|-----------|-------------|
| Auth | `/api/auth` | Register, login, Google OAuth |
| Users | `/api/users` | Profile (`/me`), leaderboard |
| Reports | `/api/reports` | Reports, cleanup submissions, votes |
| Upload | `/api/upload` | Image upload to Garage |

New routes require `@swagger` JSDoc blocks in `backend/src/routes/` — see `userRoutes.ts` for examples.

---

## Testing

### Backend unit tests

Core workflow logic is tested (voting thresholds, size-based points, weekly aggregation):

```bash
cd backend
npm test
```

See [`backend/src/controllers/reportWorkflow.test.ts`](./backend/src/controllers/reportWorkflow.test.ts).

---

## Accessibility

<!-- TODO: Complete after accessibility audit. -->

_Results and improvements will be documented here._

| Tool / method | Status | Notes |
|---------------|--------|-------|
| _TBD_ | _Pending_ | |
| _TBD_ | _Pending_ | |

---

## Performance

<!-- TODO: Complete after performance audit. -->

_Results and improvements will be documented here._

| Metric / tool | Before | After | Notes |
|---------------|--------|-------|-------|
| _TBD_ | _Pending_ | _Pending_ | |

---

## Team

**Grupp 2 · CHAS Challenge 2026**

| # | Name | Role |
|---|------|------|
| 1 | _[Name]_ | _[Role]_ |
| 2 | _[Name]_ | _[Role]_ |
| 3 | _[Name]_ | _[Role]_ |
| 4 | _[Name]_ | _[Role]_ |
| 5 | _[Name]_ | _[Role]_ |
| 6 | _[Name]_ | _[Role]_ |
| 7 | _[Name]_ | _[Role]_ |
| 8 | _[Name]_ | _[Role]_ |
| 9 | _[Name]_ | _[Role]_ |

---

## Project structure

```
grupp-2/
├── frontend/              # React SPA
│   └── src/pages/         # Map, Reports, Add Report, Profile, Leaderboard, Login
├── backend/               # Express API + Drizzle schema & migrations
├── k8s/                   # Kubernetes manifests (deploy, ingress, monitoring)
├── scripts/               # deploy-k8s.sh, delete-k8s.sh
├── docker-compose.local.yml
├── .gitlab-ci.yml
└── CLEANUP_FLOW_SUMMARY.md  # Technical deep-dive on cleanup verification
```

---

## Related documentation

- [`CLEANUP_FLOW_SUMMARY.md`](./CLEANUP_FLOW_SUMMARY.md) — Cleanup verification feature: data model, API, voting rules, and frontend UX.
