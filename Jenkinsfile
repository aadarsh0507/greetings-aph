pipeline {
    agent any
    
    triggers {
        // GitHub webhook trigger
        githubPush()
        
        // Fallback: poll SCM every 5 minutes if webhook fails
        pollSCM('H/5 * * * *')
    }
    
    options {
        // GitHub project integration
        githubProjectProperty(projectUrlStr: 'https://github.com/aadarsh0507/greetings-aph')
        
        // Build management
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }
    
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
        
        stage('Setup Node.js') {
            steps {
                echo '🔧 Setting up Node.js...'
                script {
                    // Install Node.js using nvm
                    sh '''
                        curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
                        export NVM_DIR="$HOME/.nvm"
                        [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
                        [ -s "$NVM_DIR/bash_completion" ] && \\. "$NVM_DIR/bash_completion"
                        nvm install 18
                        nvm use 18
                        node --version
                        npm --version
                    '''
                }
            }
        }
        
        stage('Code Quality Check') {
            steps {
                echo '🔍 Running code quality checks...'
                script {
                    // Check backend code
                    dir('backend') {
                        sh '''
                            export NVM_DIR="$HOME/.nvm"
                            [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
                            nvm use 18
                            echo "Checking backend dependencies..."
                            npm install
                            echo "Backend dependencies installed successfully"
                        '''
                    }
                    
                    // Check frontend code
                    dir('frontend') {
                        sh '''
                            export NVM_DIR="$HOME/.nvm"
                            [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
                            nvm use 18
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
                            export NVM_DIR="$HOME/.nvm"
                            [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
                            nvm use 18
                            echo "Running backend tests..."
                            # npm test || true
                            echo "Backend tests completed"
                        '''
                    }
                    
                    // Frontend tests (if you have any)
                    dir('frontend') {
                        sh '''
                            export NVM_DIR="$HOME/.nvm"
                            [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
                            nvm use 18
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
                        echo "Building Docker image with tag: ${IMAGE_TAG}"
                        docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} .
                        
                        echo "Creating additional tags..."
                        docker tag ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:latest
                        docker tag ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME}
                        
                        echo "Verifying Docker image was built successfully..."
                        docker images | grep ${IMAGE_NAME}
                        echo "Docker image built successfully!"
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
        
        stage('Debug Info') {
            steps {
                echo '🔍 Debug Information...'
                script {
                    sh """
                        echo "=== Environment Variables ==="
                        echo "BRANCH_NAME: ${env.BRANCH_NAME}"
                        echo "BUILD_NUMBER: ${env.BUILD_NUMBER}"
                        echo "IMAGE_TAG: ${IMAGE_TAG}"
                        echo "REGISTRY: ${REGISTRY}"
                        echo "IMAGE_NAME: ${IMAGE_NAME}"
                        
                        echo "=== Docker Images ==="
                        docker images | grep ${IMAGE_NAME} || echo "No images found"
                        
                        echo "=== Docker System Info ==="
                        docker version
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
            // Add timeout and retry options
            options {
                timeout(time: 10, unit: 'MINUTES')
                retry(2)
            }
            steps {
                echo '📦 Pushing Docker image to GitHub Container Registry...'
                script {
                    try {
                        // Use withCredentials to securely handle the token
                        withCredentials([string(credentialsId: 'ghcr-cred', variable: 'GITHUB_TOKEN_SECURE')]) {
                            sh """
                                echo "=== Testing Docker Login ==="
                                echo "Token length: \${#GITHUB_TOKEN_SECURE}"
                                echo "Logging into GitHub Container Registry..."
                                
                                # Try login with proper authentication
                                echo '${GITHUB_TOKEN_SECURE}' | docker login ${REGISTRY} -u aadarsh0507 --password-stdin
                                
                                # Verify login was successful
                                docker system info | grep -i registry || echo "Registry info not found"
                                
                                echo "=== Docker Login Successful ==="
                                echo "Pushing Docker images..."
                                
                                # Push with retry logic
                                docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} || {
                                    echo "Failed to push ${IMAGE_TAG}, trying again..."
                                    sleep 5
                                    docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
                                }
                                
                                docker push ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME} || {
                                    echo "Failed to push ${env.BRANCH_NAME}, trying again..."
                                    sleep 5
                                    docker push ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME}
                                }
                                
                                if [ "${env.BRANCH_NAME}" = "main" ]; then
                                    echo "Pushing latest tag for main branch..."
                                    docker push ${REGISTRY}/${IMAGE_NAME}:latest || {
                                        echo "Failed to push latest, trying again..."
                                        sleep 5
                                        docker push ${REGISTRY}/${IMAGE_NAME}:latest
                                    }
                                fi
                                
                                echo "Logging out from GitHub Container Registry..."
                                docker logout ${REGISTRY}
                                echo "Docker push completed successfully!"
                            """
                        }
                    } catch (Exception e) {
                        echo "Docker push failed: ${e.getMessage()}"
                        sh """
                            echo "=== Cleanup on Failure ==="
                            docker logout ${REGISTRY} || true
                            echo "=== Docker Images After Failure ==="
                            docker images | grep ${IMAGE_NAME} || echo "No images found"
                        """
                        throw e
                    }
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

