#!/usr/bin/env bash

set -euo pipefail

echo "$KUBECONFIG_B64" | base64 -d >/kubeconfig

export KUBECONFIG=/kubeconfig

kubectl apply -n "${NAMESPACE}" -f k8s/10-configmap-backend.yml
envsubst '${CI_COMMIT_REF_SLUG}' <k8s/11-nginx-configmap.yml | kubectl apply -n "${NAMESPACE}" -f -

kubectl apply -n "${NAMESPACE}" -f k8s/20-gitlab-secrets.yml \
  -f k8s/21-cc-secrets.yml \
  -f k8s/22-basic-auth-secret.yml

kubectl apply -n "${NAMESPACE}" -f k8s/30-deploy-database.yml
kubectl rollout status statefulset database -n "${NAMESPACE}" --timeout=5m

envsubst '${CI_COMMIT_REF_SLUG} ${CI_REGISTRY_IMAGE} ${CI_COMMIT_SHA}' <k8s/40-deploy-backend.yml | kubectl apply -n "${NAMESPACE}" -f -
kubectl rollout status deployment backend-"${CI_COMMIT_REF_SLUG}" -n "${NAMESPACE}" --timeout=5m

kubectl delete job backend-migrate-"${CI_COMMIT_REF_SLUG}" -n "${NAMESPACE}" --ignore-not-found

envsubst '${CI_COMMIT_REF_SLUG} ${CI_REGISTRY_IMAGE} ${CI_COMMIT_SHA}' <k8s/50-migrate-db-job.yml | kubectl apply -n "${NAMESPACE}" -f -

envsubst '${CI_COMMIT_REF_SLUG} ${CI_REGISTRY_IMAGE} ${CI_COMMIT_SHA}' <k8s/60-deploy-frontend.yml | kubectl apply -n "${NAMESPACE}" -f -
kubectl rollout status deployment frontend-"${CI_COMMIT_REF_SLUG}" -n "${NAMESPACE}" --timeout=5m

kubectl apply -n "${NAMESPACE}" -f k8s/70-middleware.yml

envsubst '${CI_COMMIT_REF_SLUG} ${FRONTEND_HOST} ${BACKEND_HOST}' <k8s/80-ingress.yml | kubectl apply -n "${NAMESPACE}" -f -

if [[ "${CI_COMMIT_REF_NAME}" == "${CI_DEFAULT_BRANCH}" ]]; then
  kubectl apply -n "${NAMESPACE}" -f k8s/90-monitoring.yml
fi
