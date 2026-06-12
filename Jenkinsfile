pipeline {
    agent any

    environment {
        AWS_REGION          = 'ap-south-1'
        ECR_REPO            = 'oan-a2c-frontend'
        BACKEND_IP          = '10.0.2.100'
        STAGING_API_URL     = 'https://a2c-backend.oanstaging.com'
        DEVELOPMENT_API_URL = 'https://a2c-backend-development.oanstaging.com'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Staging Image') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID')
                ]) {
                    sh '''
                        IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"

                        DOCKER_BUILDKIT=1 docker build \
                          --build-arg API_BASE_URL=${STAGING_API_URL} \
                          --tag ${IMAGE_URI}:staging-${BUILD_NUMBER} \
                          --tag ${IMAGE_URI}:staging \
                          --no-cache .

                        echo "Built staging image: ${IMAGE_URI}:staging-${BUILD_NUMBER}"
                    '''
                }
            }
        }

        stage('Build Development Image') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID')
                ]) {
                    sh '''
                        IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"

                        DOCKER_BUILDKIT=1 docker build \
                          --build-arg API_BASE_URL=${DEVELOPMENT_API_URL} \
                          --tag ${IMAGE_URI}:develop-${BUILD_NUMBER} \
                          --tag ${IMAGE_URI}:develop \
                          --no-cache .

                        echo "Built development image: ${IMAGE_URI}:develop-${BUILD_NUMBER}"
                    '''
                }
            }
        }

        stage('Push to ECR') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID')
                ]) {
                    sh '''
                        IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"

                        aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin \
                        ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                        aws ecr describe-repositories \
                          --repository-names ${ECR_REPO} \
                          --region ${AWS_REGION} >/dev/null 2>&1 || \
                        aws ecr create-repository \
                          --repository-name ${ECR_REPO} \
                          --region ${AWS_REGION}

                        docker push ${IMAGE_URI}:staging-${BUILD_NUMBER}
                        docker push ${IMAGE_URI}:staging
                        docker push ${IMAGE_URI}:develop-${BUILD_NUMBER}
                        docker push ${IMAGE_URI}:develop

                        echo "Pushed staging: ${IMAGE_URI}:staging-${BUILD_NUMBER}"
                        echo "Pushed develop: ${IMAGE_URI}:develop-${BUILD_NUMBER}"
                    '''
                }
            }
        }

        stage('Deploy to AWS Staging') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID'),
                    sshUserPrivateKey(
                        credentialsId: 'backend-ssh-key',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                        ssh -i ${SSH_KEY} \
                        -o StrictHostKeyChecking=no \
                        ${SSH_USER}@${BACKEND_IP} <<SSHEOF

                        set -e
                        cd /opt/oan_a2c_fe

                        cat > .env <<ENVEOF
ECR_IMAGE=${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/oan-a2c-frontend:staging-${BUILD_NUMBER}
API_BASE_URL=https://a2c-backend.oanstaging.com
ENVEOF

                        aws ecr get-login-password --region ap-south-1 | \
                        docker login --username AWS --password-stdin \
                        ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com

                        docker compose pull
                        docker compose down || true
                        docker compose up -d

                        sleep 15
                        curl -sf http://localhost:3000

                        echo "=== Staging Frontend deployed ==="
                        docker compose ps
SSHEOF
                    '''
                }
            }
        }

        stage('Deploy to Development') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID'),
                    sshUserPrivateKey(
                        credentialsId: 'frontend-uat-ssh-key',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    ),
                    string(credentialsId: 'FRONTEND_UAT_IP', variable: 'DEV_IP')
                ]) {
                    sh '''
                        ssh -i ${SSH_KEY} \
                        -o StrictHostKeyChecking=no \
                        ${SSH_USER}@${DEV_IP} <<SSHEOF

                        set -e
                        cd /home/ubuntu/frontend

                        cat > .env <<ENVEOF
ECR_IMAGE=${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com/oan-a2c-frontend:develop-${BUILD_NUMBER}
API_BASE_URL=https://a2c-backend-development.oanstaging.com
ENVEOF

                        aws ecr get-login-password --region ap-south-1 | \
                        docker login --username AWS --password-stdin \
                        ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com

                        docker compose pull
                        docker compose down || true
                        docker compose up -d

                        sleep 15
                        curl -sf http://localhost:3000 || echo "Warning: health check failed"

                        echo "=== Development Frontend deployed ==="
                        docker compose ps
SSHEOF
                    '''
                }
            }
        }

        stage('Cleanup') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID')
                ]) {
                    sh '''
                        IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"

                        docker rmi ${IMAGE_URI}:staging-${BUILD_NUMBER} || true
                        docker rmi ${IMAGE_URI}:develop-${BUILD_NUMBER} || true
                        docker system prune -f || true
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Staging frontend deployed successfully! Image: staging-${BUILD_NUMBER}"
            echo "Development frontend deployed successfully! Image: develop-${BUILD_NUMBER}"
        }
        failure {
            echo "Frontend pipeline failed!"
        }
    }
}