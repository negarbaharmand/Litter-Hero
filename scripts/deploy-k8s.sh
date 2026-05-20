#!/usr/bin/env bash

set -euo pipefail

echo "$KUBECONFIG_B64" | base64 -d >/kubeconfig

export KUBECONFIG=/kubeconfig

kubectl apply -n "${NAMESPACE}" -f k8s/10-configmap-backend.yml

kubectl apply -n "${NAMESPACE}" -f k8s/20-gitlab-secrets.yml \
  -f k8s/21-cc-secrets.yml \
  -f k8s/22-basic-auth-secret.yml

kubectl apply -n "${NAMESPACE}" -f k8s/30-deploy-database.yml
kubectl rollout status statefulset database -n "${NAMESPACE}" --timeout=5m

envsubst '${CI_REGISTRY_IMAGE} ${CI_COMMIT_SHA}' <k8s/40-deploy-backend.yml | kubectl apply -n "${NAMESPACE}" -f -
kubectl rollout status deployment backend -n "${NAMESPACE}" --timeout=5m

kubectl delete job backend-migrate -n "${NAMESPACE}" --ignore-not-found
envsubst '${CI_REGISTRY_IMAGE} ${CI_COMMIT_SHA}' <k8s/50-migrate-db-job.yml | kubectl apply -n "${NAMESPACE}" -f -

envsubst '${CI_REGISTRY_IMAGE} ${CI_COMMIT_SHA}' <k8s/60-deploy-frontend.yml | kubectl apply -n "${NAMESPACE}" -f -
kubectl rollout status deployment frontend -n "${NAMESPACE}" --timeout=5m

kubectl apply -n "${NAMESPACE}" -f k8s/70-middleware.yml

envsubst '${FRONTEND_HOST} ${BACKEND_HOST}' <k8s/80-ingress.yml | kubectl apply -n "${NAMESPACE}" -f -

kubectl apply -n "${NAMESPACE}" -f k8s/90-monitoring.yml
