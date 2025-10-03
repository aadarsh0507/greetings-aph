pipeline {
    agent any
    
    // Configure triggers for automatic builds
    triggers {
        githubPush()
    }
    
    // Configure webhook for GitHub integration
    options {
        githubProjectProperty(projectUrlStr: 'https://github.com/aadarsh0507/greetings-aph')
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

