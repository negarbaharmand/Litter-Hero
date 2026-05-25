#!/usr/bin/env bash

set -euo pipefail

echo "$KUBECONFIG_B64" | base64 -d >/kubeconfig

export KUBECONFIG=/kubeconfig

envsubst '${CI_COMMIT_REF_SLUG}' <k8s/11-nginx-configmap.yml | kubectl delete -n "${NAMESPACE}" -f -

envsubst '${CI_COMMIT_REF_SLUG} ${CI_REGISTRY_IMAGE} ${CI_COMMIT_SHA}' <k8s/40-deploy-backend.yml | kubectl delete -n "${NAMESPACE}" -f -

envsubst '${CI_COMMIT_REF_SLUG} ${CI_REGISTRY_IMAGE} ${CI_COMMIT_SHA}' <k8s/60-deploy-frontend.yml | kubectl delete -n "${NAMESPACE}" -f -

kubectl delete job backend-migrate-"${CI_COMMIT_REF_SLUG}" -n "${NAMESPACE}" --ignore-not-found

envsubst '${CI_COMMIT_REF_SLUG} ${FRONTEND_HOST} ${BACKEND_HOST}' <k8s/80-ingress.yml | kubectl delete -n "${NAMESPACE}" -f -
