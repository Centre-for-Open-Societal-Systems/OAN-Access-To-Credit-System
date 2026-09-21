#!/usr/bin/env bash
# =============================================================================
#  deploy-dev.sh — deploy the A2C frontend to the dev VM (Jenkins, develop branch).
#  Writes .env on the VM, logs in to ECR, and rolls the docker-compose stack.
#
#  Required env (from the Jenkinsfile develop stage):
#    AWS_ACCOUNT_ID SSH_KEY SSH_USER DEV_IP AWS_REGION ECR_REPO IMAGE_TAG API_BASE_URL
# =============================================================================
set -euo pipefail
: "${AWS_ACCOUNT_ID:?}"; : "${SSH_KEY:?}"; : "${SSH_USER:?}"; : "${DEV_IP:?}"
: "${AWS_REGION:?}"; : "${ECR_REPO:?}"; : "${IMAGE_TAG:?}"; : "${API_BASE_URL:?}"

echo "=== Deploying frontend to dev VM ${DEV_IP} :: ${ECR_REPO}:${IMAGE_TAG} ==="

ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${SSH_USER}@${DEV_IP}" <<SSHEOF
  set -e
  cd /home/ubuntu/frontend

  cat > .env <<ENVEOF
ECR_IMAGE=${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMAGE_TAG}
API_BASE_URL=${API_BASE_URL}
ENVEOF

  aws ecr get-login-password --region ${AWS_REGION} | \
    docker login --username AWS --password-stdin \
    ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

  docker compose pull
  docker compose down || true
  docker compose up -d

  sleep 15
  curl -sf http://localhost:3000 >/dev/null && echo "Health check passed" || echo "Warning: health check failed"

  # Reclaim disk: each deploy pulls a fresh image; -a drops old tags no running container
  # uses so the dev VM doesn't fill up over deploys ("no space left on device" on pull).
  echo "=== Pruning unused images ==="
  docker image prune -af || true
  docker compose ps
SSHEOF

echo "=== dev frontend deployment finished ==="
