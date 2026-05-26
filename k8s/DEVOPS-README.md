# Kubernetes architecture

Manifests for Litter Hero. Applied by the scripts in `../scripts/`,
which are invoked from `.gitlab-ci.yml`.

## Layout

Manifests are numbered by apply order.

| File                       | Kind                            | Purpose                                                     |
| -------------------------- | ------------------------------- | ----------------------------------------------------------- |
| `10-configmap-backend.yml` | ConfigMap                       | Non-secret backend env (DB host/port, S3 endpoint).         |
| `11-nginx-configmap.yml`   | ConfigMap                       | Frontend nginx config. Proxies `/api/` to the backend.      |
| `20-gitlab-secrets.yml`    | SealedSecret                    | Image pull secret for the GitLab registry.                  |
| `21-cc-secrets.yml`        | SealedSecret                    | App secrets (DB, S3, JWT).                                  |
| `22-basic-auth-secret.yml` | SealedSecret                    | Credentials for the ingress basic-auth middleware.          |
| `30-deploy-database.yml`   | StatefulSet + Service           | Postgres/PostGIS with a Longhorn PVC, headless svc `db`.    |
| `40-deploy-backend.yml`    | Deployment + Service            | Node backend, 3 replicas, ClusterIP :3000.                  |
| `50-migrate-db-job.yml`    | Job                             | Runs `npm run db:migrate:prod` before the backend rolls out.|
| `60-deploy-frontend.yml`   | Deployment + Service            | Nginx + frontend, 3 replicas, ClusterIP :8080.              |
| `70-middleware.yml`        | Traefik Middleware              | Basic-auth middleware used by the ingress.                  |
| `80-ingress.yml`           | Ingress                         | Frontend host (with basic-auth) + API host.                 |
| `90-monitoring.yml`        | ServiceMonitor + PrometheusRule + Grafana ConfigMap | Scrape, alerts, dashboard. `main` only.  |

## Per-branch deployments

Everything runs in the namespace `doe25-group-2`. Per-branch resources
are suffixed with `${CI_COMMIT_REF_SLUG}` (e.g. `backend-main`) so
multiple branches can live side-by-side in the same namespace. These
manifests are piped through `envsubst` before `kubectl apply`.

Shared resources (database, secrets, shared configmap, middleware,
monitoring) are not suffixed.

Variables substituted by `envsubst`:

- `CI_COMMIT_REF_SLUG` — branch-suffixed resource names
- `CI_REGISTRY_IMAGE`, `CI_COMMIT_SHA` — image tag
- `FRONTEND_HOST`, `BACKEND_HOST` — ingress hostnames

## Request flow

```
client ──HTTPS──> Traefik ──> frontend-${slug} (nginx :8080)
                     │              └── /api/* ──> backend-${slug} :3000
                     └── api host ──────────────> backend-${slug} :3000

backend-${slug} ──> db (headless svc) ──> database-0 (StatefulSet, Longhorn PVC)
                └─> S3 (Hetzner object storage)
```

The separate API ingress lets the backend be reached directly without
basic-auth.

# Scripts

## `deploy-k8s.sh`

Runs on `development`, `main`, and any branch with `/` in the name:

1. Apply configmaps and secrets.
2. Apply the database StatefulSet, wait for rollout.
3. Recreate the migration Job, wait for it to complete.
4. Apply backend, wait for rollout.
5. Apply frontend, wait for rollout.
6. Apply middleware and ingress.
7. On `main` only: apply monitoring.

The order matters: db must be reachable before migrations, and
migrations must finish before new backend pods start.

## `delete-k8s.sh`

Triggered by the manual `stop_review` job. Removes only the per-branch
resources (nginx configmap, backend, frontend, migration job, ingress).
Shared resources are left alone.

## `Dockerfile-utils`

Image used by the deploy/cleanup CI jobs: Alpine + `bash` + `kubectl` +
`envsubst`. Built and pushed as `$CI_REGISTRY_IMAGE/utils:latest`.
