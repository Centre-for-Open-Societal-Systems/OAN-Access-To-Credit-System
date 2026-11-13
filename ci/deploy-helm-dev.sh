#!/usr/bin/env bash
# =============================================================================
#  deploy-helm-dev.sh — deploy the A2C frontend to oan_dev (k3s) via Helm.
#  Runs on the oan-ci-deploy Jenkins agent (VPN; has kubectl + helm + kubeconfig).
#
#  Required env (injected by Jenkins):
#    KUBECONFIG        path to the oan-dev kubeconfig (Secret file credential)
#    IMAGE_REPOSITORY  full ECR URI of the frontend image (without tag)
#    IMMUTABLE_TAG     image tag for this build, e.g. 0.0.1-develop.42
#    HELM_RELEASE      Helm release name, default: a2c-ui
#    HELM_NAMESPACE    Kubernetes namespace,  default: a2c
# =============================================================================
set -euo pipefail

: "${KUBECONFIG:?KUBECONFIG must be set}"
: "${IMAGE_REPOSITORY:?IMAGE_REPOSITORY must be set}"
: "${IMMUTABLE_TAG:?IMMUTABLE_TAG must be set}"

HELM_RELEASE="${HELM_RELEASE:-a2c-ui}"
HELM_NAMESPACE="${HELM_NAMESPACE:-a2c}"
CHART_DIR="$(cd "$(dirname "$0")/../helm/oan-a2c-ui" && pwd)"
VALUES_FILE="$(cd "$(dirname "$0")/../helm/environments/dev/oan-a2c-ui.yaml" && pwd)"

echo "=== Deploying ${HELM_RELEASE} to namespace ${HELM_NAMESPACE} ==="
echo "    image: ${IMAGE_REPOSITORY}:${IMMUTABLE_TAG}"

helm upgrade "${HELM_RELEASE}" "${CHART_DIR}" \
  --install \
  --namespace "${HELM_NAMESPACE}" \
  --create-namespace \
  --values "${VALUES_FILE}" \
  --set ui.image.repository="${IMAGE_REPOSITORY}" \
  --set ui.image.tag="${IMMUTABLE_TAG}" \
  --wait \
  --timeout 5m

echo "=== Helm deploy finished ==="
kubectl rollout status deployment \
  -l "app.kubernetes.io/instance=${HELM_RELEASE}" \
  -n "${HELM_NAMESPACE}" \
  --timeout=3m || true
