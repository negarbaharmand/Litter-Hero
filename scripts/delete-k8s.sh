#!/usr/bin/env bash

set -euo pipefail

echo "$KUBECONFIG_B64" | base64 -d >/kubeconfig

export KUBECONFIG=/kubeconfig

kubectl delete -n "${NAMESPACE}" -f k8s/30-deploy-database.yml

envsubst '${CI_REGISTRY_IMAGE} ${CI_COMMIT_SHA}' <k8s/40-deploy-backend.yml | kubectl delete -n "${NAMESPACE}" -f -

envsubst '${CI_REGISTRY_IMAGE} ${CI_COMMIT_SHA}' <k8s/60-deploy-frontend.yml | kubectl delete -n "${NAMESPACE}" -f -

kubectl delete -n "${NAMESPACE}" -f k8s/70-middleware.yml

envsubst '${FRONTEND_HOST} ${BACKEND_HOST}' <k8s/80-ingress.yml | kubectl delete -n "${NAMESPACE}" -f -
