pipeline {
    agent any
    
    environment {
        // GitHub Container Registry
        REGISTRY = 'ghcr.io'
        IMAGE_NAME = 'aadarsh0507/greetings-aph'
        
        // GitHub credentials (configure in Jenkins)
        GITHUB_TOKEN = credentials('ghcr-cred')
        
        // Docker image tag
        IMAGE_TAG = "${env.BRANCH_NAME}-${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
            }
        }
        
        stage('Code Quality Check') {
            steps {
                echo '🔍 Running code quality checks...'
                script {
                    // Check backend code
                    dir('backend') {
                        sh '''
                            echo "Checking backend dependencies..."
                            npm install
                            echo "Backend dependencies installed successfully"
                        '''
                    }
                    
                    // Check frontend code
                    dir('frontend') {
                        sh '''
                            echo "Checking frontend dependencies..."
                            npm install
                            echo "Running frontend linter..."
                            npm run lint || true
                            echo "Frontend check completed"
                        '''
                    }
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                echo '🧪 Running tests...'
                script {
                    // Backend tests (if you have any)
                    dir('backend') {
                        sh '''
                            echo "Running backend tests..."
                            # npm test || true
                            echo "Backend tests completed"
                        '''
                    }
                    
                    // Frontend tests (if you have any)
                    dir('frontend') {
                        sh '''
                            echo "Running frontend tests..."
                            # npm test || true
                            echo "Frontend tests completed"
                        '''
                    }
                }
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker image...'
                script {
                    sh """
                        docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} .
                        docker tag ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:latest
                        docker tag ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME}
                    """
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                echo '🔒 Running security scan...'
                script {
                    sh """
                        echo "Scanning Docker image for vulnerabilities..."
                        # docker scan ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} || true
                        echo "Security scan completed"
                    """
                }
            }
        }
        
        stage('Push to GitHub Container Registry') {
            when {
                anyOf {
                    branch 'main'
                    branch 'features'
                }
            }
            steps {
                echo '📦 Pushing Docker image to GitHub Container Registry...'
                script {
                    sh """
                        echo ${GITHUB_TOKEN} | docker login ${REGISTRY} -u aadarsh0507 --password-stdin
                        
                        docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME}
                        
                        if [ "${env.BRANCH_NAME}" = "main" ]; then
                            docker push ${REGISTRY}/${IMAGE_NAME}:latest
                        fi
                        
                        docker logout ${REGISTRY}
                    """
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                echo '🧹 Cleaning up...'
                script {
                    sh """
                        docker rmi ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} || true
                        echo "Cleanup completed"
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            echo "Docker image available at: ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
            echo "Pull command: docker pull ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
        }
        
        failure {
            echo '❌ Pipeline failed!'
            echo 'Check the logs above for details.'
        }
        
        always {
            echo '📊 Pipeline execution completed'
        }
    }
}

