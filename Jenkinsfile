pipeline {
    agent any

    environment {
        AWS_REGION   = 'ap-south-1'
        ECR_REPO     = 'oan-a2c-frontend'
        BACKEND_IP   = '10.0.2.100'
        API_BASE_URL = 'https://a2c-backend.oanstaging.com'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                withCredentials([
                    string(credentialsId: 'AWS_ACCOUNT_ID', variable: 'AWS_ACCOUNT_ID')
                ]) {
                    sh '''
                        IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"

                        DOCKER_BUILDKIT=1 docker build \
                          --build-arg API_BASE_URL=${API_BASE_URL} \
                          --tag ${IMAGE_URI}:develop-${BUILD_NUMBER} \
                          --tag ${IMAGE_URI}:develop \
                          --no-cache .

                        echo "Built ${IMAGE_URI}:develop-${BUILD_NUMBER}"
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

                        docker push ${IMAGE_URI}:develop-${BUILD_NUMBER}
                        docker push ${IMAGE_URI}:develop
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

                        aws ecr get-login-password --region ap-south-1 | \
                        docker login --username AWS --password-stdin \
                        ${AWS_ACCOUNT_ID}.dkr.ecr.ap-south-1.amazonaws.com

                      
                        docker compose pull
                        docker compose down || true
                        docker compose up -d

                        sleep 15

                        curl -sf http://localhost:3000

                        echo "=== Frontend deployed ==="
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

                        docker rmi ${IMAGE_URI}:develop-${BUILD_NUMBER} || true
                        docker system prune -f || true
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "Frontend staging deployment successful! Build: develop-${BUILD_NUMBER}"
        }
        failure {
            echo "Frontend staging deployment failed!"
        }
    }
}
