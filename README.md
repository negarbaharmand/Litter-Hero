# Litter Hero

**Grupp 2 · [CHAS Challenge 2026](https://git.chas-lab.dev/chas-challenge-2026/grupp-2/grupp-2)**

Litter Hero is a community-driven web app for reporting street litter and verifying cleanups. Users photograph trash, pin it on a map, and help close the loop through community voting. The app combines civic action with points, badges, and leaderboards to make environmental care collaborative and rewarding.

The current rollout and challenge scope is **Sweden-focused**, inspired by local cleanup initiatives such as [Håll Sverige Rent](https://www.hsr.se/).

## Quick links

- Repository: [git.chas-lab.dev/chas-challenge-2026/grupp-2/grupp-2](https://git.chas-lab.dev/chas-challenge-2026/grupp-2/grupp-2)
- Live app: `TODO: Add deployed frontend URL`
- Backend base URL: `TODO: Add deployed backend URL`
- Demo video: `TODO: Add demo video link`

## Project summary

Litter Hero addresses a real Tech for Good problem: litter harms nature, public spaces, and community wellbeing, while reporting and follow-up are often disconnected.  
The product creates one transparent flow: report litter, verify it with peers, submit cleanup proof, vote as a community, and reward verified impact.

## Tech for Good impact

- **Environmental impact**: litter is visible and trackable from report to verified cleanup.
- **Community empowerment**: trust is distributed through peer voting, not centralized moderation.
- **Low-friction participation**: mobile-friendly reporting with image upload and location support.
- **Transparency**: report statuses, vote outcomes, and points are tied to verifiable actions.

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [DevOps and infrastructure](#devops-and-infrastructure)
- [Getting started](#getting-started)
- [API documentation](#api-documentation)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Team](#team)
- [Project structure](#project-structure)

## Features

### Report litter

- Report litter with photo, location, description, and size.
- Upload flow supports Garage (S3-compatible) image storage.
- Built-in report quality rules in backend workflow:
  - minimum image size checks,
  - hourly report rate limit,
  - duplicate detection within a nearby radius.

### Explore and verify

- Map and list views for active reports.
- Dedicated report details page with status and submissions.
- Community report verification voting (`legit` vs `not_trash`).

### Cleanup proof and voting

- Users submit cleanup proof (after-photo + optional note).
- Cleanup submissions are resolved through community voting.
- Rules include self-vote restrictions and vote thresholds.
- Approved cleanup updates report status and awards points.

### Gamification

- Size-based points for reports and approved cleanups.
- Leaderboard and profile statistics.
- Streaks, activity heatmap, and badges in user profile.

### Authentication and UX

- Email/password login.
- Google sign-in support.
- JWT-protected API actions for reporting, voting, and cleanup flows.

## Tech stack

- **Frontend**: React 19, TypeScript, Vite, React Router, TanStack Query, Tailwind CSS, Leaflet
- **Backend**: Node.js, Express 5, TypeScript, Zod
- **Database**: PostgreSQL + PostGIS, Drizzle ORM, Drizzle Kit
- **Storage**: Garage (S3-compatible)
- **Auth**: JWT, bcrypt, Google OAuth
- **API docs**: Swagger UI at `/api-docs`
- **Monitoring**: `express-prom-bundle`, ServiceMonitor, PrometheusRule, Grafana dashboard config
- **Infra**: Docker, Kubernetes manifests, Traefik ingress, GitLab CI/CD
- **Security scanning**: Trivy container image scans in CI
- **Email**: Resend API
  - `TODO: Add Resend integration details (template IDs/events)`

## Architecture

```text
Browser (React SPA)
  -> Frontend (Vite/Nginx in production)
    -> /api/* -> Backend (Express API)
      -> PostgreSQL/PostGIS
      -> Garage (S3-compatible object storage)
      -> /metrics -> Prometheus/Grafana stack
```

Technical service docs:
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)
- [Cleanup flow summary](./CLEANUP_FLOW_SUMMARY.md)

## DevOps and infrastructure

- CI/CD pipeline in [`.gitlab-ci.yml`](./.gitlab-ci.yml) with build, scan, deploy, and cleanup stages.
- Docker image builds for frontend/backend plus deploy utility image.
- Trivy vulnerability scans for container images in pipeline.
- Kubernetes manifests in [`k8s/`](./k8s/) for app, DB, ingress, migration job, and monitoring.
- Deployment scripts in [`scripts/`](./scripts/) for deploy and environment cleanup.
- Monitoring setup includes:
  - ServiceMonitor scrape config,
  - Prometheus alert rules,
  - Grafana dashboard config map.

## Getting started

### Prerequisites

- Docker + Docker Compose
- Copy and complete env files:
  - `cp .env.example .env`
  - `cp backend/.env.example backend/.env` (if running backend outside Docker)

### Run full stack locally (recommended)

```bash
docker compose -f docker-compose.local.yml up -d --build
docker compose logs -f
```

Default local services:
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:3000](http://localhost:3000)
- Swagger UI: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- Drizzle Studio: [http://localhost:4983](http://localhost:4983)

### Run without Docker

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run db:migrate
npm run dev

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

If needed, set `VITE_API_URL=http://localhost:3000` in frontend env.

## API documentation

Open Swagger at [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

Main endpoint groups:
- `/api/auth`
- `/api/users`
- `/api/reports`
- `/api/upload`

## Demo video

`TODO: Add demo video URL or embedded player`

Suggested short flow:
1. Create a report with image and location
2. View report on map/list
3. Submit cleanup proof
4. Show voting and status transition
5. Show profile points and leaderboard update

## Accessibility

Accessibility work is already documented and audited in detail:
- [Accessibility.md](./Accessibility.md)

Highlights include:
- keyboard and screen-reader considerations
- contrast and semantic improvements
- Lighthouse accessibility score improvements across key pages

## Performance

- `TODO: Add measured frontend performance metrics`
- `TODO: Add backend latency/error metrics snapshot`
- `TODO: Add before/after benchmark notes (if available)`

## Team

**Grupp 2 · CHAS Challenge 2026**

- `TODO: Add team member names and roles`

## Project structure

```text
grupp-2/
|- frontend/                  # React SPA
|- backend/                   # Express API + Drizzle schema/migrations
|- k8s/                       # Kubernetes manifests
|- scripts/                   # deploy/cleanup scripts
|- docker-compose.local.yml   # local full-stack development
|- .gitlab-ci.yml             # CI/CD pipeline
|- Accessibility.md           # accessibility audit notes
|- CLEANUP_FLOW_SUMMARY.md    # cleanup workflow documentation
```


