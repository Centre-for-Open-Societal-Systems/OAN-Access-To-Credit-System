// =============================================================================
//  Jenkinsfile — OAN-Access-To-Credit-System (A2C frontend, Next.js). Single
//  pipeline for the `oan-package` GitHub Organization folder (multibranch).
//
//  Per branch:
//    develop     -> build + push to ECR (oan/oan-a2c-ui/a2c-ui) + ci/deploy-helm-dev.sh
//                   (Helm upgrade on oan_dev k3s, namespace `a2c`, via VPN kubeconfig),
//                   then package + publish the Helm chart oan-a2c-ui to oan-helm
//    staging_aws -> build + push to ECR (oan/access-to-credit-system) + SSH docker-compose
//                   deploy to a SEPARATE frontend stack on the AWS backend box (BACKEND_IP,
//                   ${STAGING_AWS_APP_DIR}, host port 3002). Mirrors Jenkinsfile.main, which
//                   it supersedes; coexists with main's /opt/oan_a2c_fe_main (port 3001).
//    staging_ati -> build + push to ECR (oan/access-to-credit-system) + ci/update-kustomize-ati.sh
//                   (GitOps: bump oan-kustomize `staging` overlay; ArgoCD on node 41 syncs)
//
//  develop: the VPN deploy agent (oan-ci-deploy) runs ci/deploy-helm-dev.sh with the
//  `oan-dev-kubeconfig` Secret file credential (same kubeconfig used by the oan_a2c backend).
//  The agent must have kubectl + helm available. No SSH or EC2 credentials needed.
//
//  API_BASE_URL is set at runtime via Helm values (helm/environments/dev/oan-a2c-ui.yaml),
//  so the same image is deployed without a rebuild when the backend URL changes.
//
//  Tags:  develop: <package.json version>-develop.<build>, e.g. 0.0.0-develop.57 (= chart version)
//         staging_*: <branch>-<build>   immutable, pinned by oan-kustomize
//         <branch>-latest    moving alias
//
//  Agent needs: docker(+buildx), aws cli v2, git, kustomize.
//  Credentials: AWS_ACCOUNT_ID; oan-dev-kubeconfig (develop);
//               backend-ssh-key (staging_aws); oan-deployer (staging_ati GitOps).
// =============================================================================
pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    buildDiscarder(logRotator(numToKeepStr: '30'))
    timeout(time: 30, unit: 'MINUTES')
  }

  environment {
    AWS_REGION               = 'ap-south-1'
    BACKEND_IP               = '10.0.2.100'                            // AWS backend box (staging_aws)
    DEV_API_BASE_URL         = 'https://a2c-backend-development.oanstaging.com/api'
    STAGING_API_BASE_URL     = 'https://a2c.ati-staging.internal'      // on-prem backend on node 41
    AWS_STAGING_API_BASE_URL = 'https://a2c-backend.oanstaging.com/api' // staging_aws: reuse existing public backend; routes call ${API_BASE_URL}/v1/...
    STAGING_AWS_APP_DIR      = '/opt/oan_a2c_fe_staging'               // separate from main's /opt/oan_a2c_fe_main
  }

  stages {
    stage('Resolve') {
      steps {
        script {
          // develop -> oan/oan-a2c-ui/a2c-ui (ECR repo must exist) + dev backend.
          // staging_aws -> namespaced repo + existing public backend.
          // staging_ati -> namespaced repo + on-prem backend (node 41).
          env.ECR_REPO      = (env.BRANCH_NAME == 'develop') ? 'oan/oan-a2c-ui/a2c-ui' : 'oan/access-to-credit-system'
          env.API_BASE_URL  = (env.BRANCH_NAME == 'staging_ati') ? env.STAGING_API_BASE_URL
                            : (env.BRANCH_NAME == 'staging_aws') ? env.AWS_STAGING_API_BASE_URL
                            : env.DEV_API_BASE_URL
          // staging_ati / staging_aws publish under hyphenated `staging-ati-` / `staging-aws-`
          // prefixes (not the branch-derived `staging_ati-` / `staging_aws-`) so the immutable
          // tags read staging-ati-<build> / staging-aws-<build>, uniform across all repos.
          // develop keeps its branch-name tag.
          def tagPrefix     = (env.BRANCH_NAME == 'staging_ati') ? 'staging-ati'
                            : (env.BRANCH_NAME == 'staging_aws') ? 'staging-aws'
                            : env.BRANCH_NAME
          env.IMMUTABLE_TAG = "${tagPrefix}-${env.BUILD_NUMBER}"
          // develop: tag = chart version = <package.json version>-develop.<build>, e.g. 0.0.0-develop.57
          if (env.BRANCH_NAME == 'develop') {
            env.IMMUTABLE_TAG = sh(returnStdout: true, script: 'python3 ci/package_chart.py version').trim()
          }
          env.MOVING_TAG    = "${tagPrefix}-latest"
          echo "branch=${env.BRANCH_NAME}  repo=${env.ECR_REPO}  tag=${env.IMMUTABLE_TAG}  api=${env.API_BASE_URL}"
        }
      }
    }

    stage('Build image') {
      when { anyOf { branch 'develop'; branch 'staging_aws'; branch 'staging_ati' } }
      steps {
        withCredentials([string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID')]) {
          sh '''#!/usr/bin/env bash
            set -euo pipefail
            IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
            # --no-cache: never reuse a layer from an earlier build on this
            #   shared agent, so every image is built from the checked-out tree.
            # --pull: re-resolve the `node:24` base rather than building on a
            #   copy the agent may have cached weeks ago, which would keep the
            #   image pinned to an unpatched base indefinitely.
            DOCKER_BUILDKIT=1 docker build \
              --no-cache --pull \
              --build-arg API_BASE_URL="${API_BASE_URL}" \
              --tag ${IMAGE_URI}:${IMMUTABLE_TAG} \
              --tag ${IMAGE_URI}:${MOVING_TAG} \
              .
            echo "Built ${IMAGE_URI}:${IMMUTABLE_TAG}"
          '''
        }
      }
    }

    stage('Push to ECR') {
      when { anyOf { branch 'develop'; branch 'staging_aws'; branch 'staging_ati' } }
      steps {
        withCredentials([string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID')]) {
          sh '''#!/usr/bin/env bash
            set -euo pipefail
            REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
            IMAGE_URI="${REGISTRY}/${ECR_REPO}"
            aws ecr get-login-password --region ${AWS_REGION} \
              | docker login --username AWS --password-stdin "${REGISTRY}"

            # ECR does not create a repository on push.
            aws ecr describe-repositories --region ${AWS_REGION} --repository-names "${ECR_REPO}" >/dev/null 2>&1 \
              || aws ecr create-repository --region ${AWS_REGION} --repository-name "${ECR_REPO}" >/dev/null

            docker push ${IMAGE_URI}:${IMMUTABLE_TAG}
            docker push ${IMAGE_URI}:${MOVING_TAG}
            # Scoped cleanup only — never `docker system prune -f` on a shared agent.
            docker rmi ${IMAGE_URI}:${IMMUTABLE_TAG} ${IMAGE_URI}:${MOVING_TAG} || true
            echo "Pushed ${IMAGE_URI}:${IMMUTABLE_TAG} (+ ${MOVING_TAG})"
          '''
        }
      }
    }

    // ---------------------- Helm chart package (same name as the chart) ----------------------
    // Flow (develop): Resolve (version) -> Build image -> Push to ECR -> Package chart -> deploy -> Publish chart.
    // helm/oan-a2c-ui is zipped with this build's image before the deploy; the same archive is
    // published to oan-helm after it.
    stage('Package chart') {
      when { branch 'develop' }
      steps {
        withCredentials([string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID')]) {
          script {
            env.IMAGE_TAG = env.IMMUTABLE_TAG
            env.SOURCE_COMMIT = sh(returnStdout: true, script: 'git rev-parse --verify HEAD').trim()
            env.COMMIT_SUBJECT = sh(returnStdout: true, script: 'git log -1 --pretty=%s').trim()
            env.IMAGE_REPOSITORY = "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"
          }
          sh 'python3 ci/package_chart.py package'
          stash name: 'built-chart', includes: 'built-chart/**'
        }
      }
    }

    // ---------------------- per-branch deploy ----------------------

    stage('develop → oan_dev (helm)') {
      when { branch 'develop' }
      agent { label 'oan-ci-deploy' }
      options { timeout(time: 15, unit: 'MINUTES') }
      steps {
        checkout scm
        sh 'rm -rf built-chart'
        unstash 'built-chart'
        withCredentials([
          string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID'),
          file(credentialsId: 'oan-dev-kubeconfig', variable: 'KUBECONFIG')
        ]) {
          sh '''#!/usr/bin/env bash
            set -euo pipefail
            chmod +x ci/deploy-helm-dev.sh
            IMAGE_REPOSITORY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}" \
            IMMUTABLE_TAG="${IMMUTABLE_TAG}" \
            bash ci/deploy-helm-dev.sh
          '''
        }
      }
    }

    // staging_aws -> a SEPARATE frontend stack on the SAME AWS backend box (BACKEND_IP),
    // mirroring Jenkinsfile.main's Deploy-to-Staging-VM but into ${STAGING_AWS_APP_DIR} on
    // host port 3002 (main uses /opt/oan_a2c_fe_main:3001). API_BASE_URL is baked at build
    // time; we reuse the existing public backend (a2c-backend.oanstaging.com) per the env.
    // PREREQ: ${STAGING_AWS_APP_DIR} must exist on BACKEND_IP, owned by the ssh user, so scp
    // can land the compose file (mkdir in /opt needs root — provisioned once, out of band).
    stage('staging_aws → AWS frontend (separate stack)') {
      when { branch 'staging_aws' }
      steps {
        withCredentials([
          string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID'),
          sshUserPrivateKey(credentialsId: 'backend-ssh-key',
                            keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')
        ]) {
          sh '''#!/usr/bin/env bash
            set -euo pipefail
            REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
            IMAGE_URI="${REGISTRY}/${ECR_REPO}:${IMMUTABLE_TAG}"

            scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no \
              docker-compose.yaml "${SSH_USER}@${BACKEND_IP}:${STAGING_AWS_APP_DIR}/docker-compose.yaml"

            ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${SSH_USER}@${BACKEND_IP}" << SSHEOF
              set -e
              cd ${STAGING_AWS_APP_DIR}

              # host port 3002 + distinct container name so this coexists with main's 3001 stack
              sed -i 's/3000:3000/3002:3000/' docker-compose.yaml
              sed -i 's/oan_a2c_frontend/oan_a2c_frontend_staging/' docker-compose.yaml

              cat > .env <<ENVEOF
ECR_IMAGE=${IMAGE_URI}
API_BASE_URL=${API_BASE_URL}
ENVEOF

              aws ecr get-login-password --region ${AWS_REGION} \
                | docker login --username AWS --password-stdin ${REGISTRY}

              docker compose pull
              docker compose down || true
              docker compose up -d
              sleep 15
              curl -sf http://localhost:3002 >/dev/null \
                && echo "Health check passed (port 3002)" || echo "Warning: health check failed"

              # Reclaim disk: each deploy pulls a fresh image; -a drops old tags no running
              # container uses so the shared box doesn't fill up over deploys.
              echo "=== Pruning unused images ==="
              docker image prune -af || true
              echo "=== staging_aws frontend deployed on port 3002 ==="
              docker compose ps
SSHEOF
          '''
        }
      }
    }

    // staging_ati -> GitOps: bump apps/access-to-credit-system/overlays/staging in oan-kustomize.
    // Auth is the `oan-deployer` GitHub App (contents:write on oan-kustomize only).
    stage('staging → GitOps (ArgoCD@41)') {
      when { branch 'staging_ati' }
      steps {
        withCredentials([
          string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID'),
          gitUsernamePassword(credentialsId: 'oan-deployer', gitToolName: 'Default')
        ]) {
          sh '''#!/usr/bin/env bash
            set -euo pipefail
            chmod +x ci/update-kustomize-ati.sh
            # args: <overlay> <kustomize image match-name> <new image ref>
            ci/update-kustomize-ati.sh staging access-to-credit-system \
              "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}:${IMMUTABLE_TAG}"
          '''
        }
      }
    }
    // ---------------------- Helm chart publish ----------------------
    // Adds the archive built by 'Package chart' to repository/develop/ of oan-helm, only after
    // the dev VM deploy succeeded.
    stage('Publish chart') {
      when { branch 'develop' }
      steps {
        // UNSTABLE, not failed: the image is already deployed.
        catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
          withCredentials([usernamePassword(credentialsId: 'oan-helm-fork-token', usernameVariable: 'GH_USER', passwordVariable: 'GH_TOKEN')]) {
            sh 'python3 ci/package_chart.py publish'
          }
        }
      }
    }
  }

  post {
    // Bound the BuildKit cache so the shared agent's disk can't fill over many builds.
    // `docker rmi` only drops the final tag; the build cache is a SEPARATE store that
    // otherwise grows unbounded. --max-used-space caps it at ~20GB (buildx v0.34+; replaces
    // the deprecated --keep-storage). Scoped to the build cache only — never
    // `docker system prune`, which wipes other jobs on a shared agent.
    always  { sh 'docker buildx prune -f --max-used-space=20GB 2>/dev/null || true' }
    success { echo "OK  ${env.BRANCH_NAME} #${env.BUILD_NUMBER} -> ${env.IMMUTABLE_TAG}" }
    failure { echo "FAIL ${env.BRANCH_NAME} #${env.BUILD_NUMBER}" }
  }
}
