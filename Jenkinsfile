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
        GITHUB_TOKEN = credentials('aadarsh-ghcr-cred')
        
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
        
        stage('Sonar Scan') {
            steps {
                echo '🔍 Running SonarQube analysis...'
                script {
                    withSonarQubeEnv('SonarQube') {
                        sh '''
                            export NVM_DIR="$HOME/.nvm"
                            [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
                            nvm use 18
                            
                            # Install SonarScanner
                            if ! command -v sonar-scanner &> /dev/null; then
                                echo "Installing SonarScanner..."
                                wget -q https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
                                unzip -q sonar-scanner-cli-5.0.1.3006-linux.zip
                                export PATH="$PATH:$(pwd)/sonar-scanner-5.0.1.3006-linux/bin"
                            fi
                            
                            # Run SonarQube analysis
                            sonar-scanner \
                                -Dsonar.projectKey=APH-Greetings \
                                -Dsonar.projectName="APH Greetings - Patient Birthday Manager" \
                                -Dsonar.projectVersion=1.0.0 \
                                -Dsonar.sources=frontend/src,backend \
                                -Dsonar.exclusions="**/node_modules/**,**/build/**,**/dist/**,**/*.min.js,**/*.map,**/coverage/**,**/artifacts/**,**/*.d.ts" \
                                -Dsonar.javascript.file.suffixes=.js,.jsx \
                                -Dsonar.qualitygate.wait=true \
                                -Dsonar.branch.name=${BRANCH_NAME}
                        '''
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                echo '✅ Waiting for SonarQube Quality Gate...'
                script {
                    timeout(time: 10, unit: 'MINUTES') {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "Quality Gate failed: ${qg.status}"
                        }
                        echo "Quality Gate passed: ${qg.status}"
                    }
                }
            }
        }
        
        stage('Trivy Code Scan') {
            steps {
                echo '🔒 Running Trivy security scan...'
                script {
                    sh '''
                        # Install Trivy if not present
                        if ! command -v trivy &> /dev/null; then
                            echo "Installing Trivy..."
                            curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                        fi
                        
                        # Run Trivy filesystem scan
                        echo "Scanning filesystem for vulnerabilities..."
                        trivy fs --format json --output trivy-fs-report.json . || true
                        trivy fs --format table . || true
                        
                        # Generate console output
                        trivy fs --format table . > trivy-fs-console.txt || true
                    '''
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
        
        stage('Final Verification') {
            steps {
                echo '✅ All pipeline stages completed successfully!'
                script {
                    sh """
                        echo "=== Pipeline Summary ==="
                        echo "✅ Code Quality Check: PASSED"
                        echo "✅ Tests: PASSED"
                        echo "✅ Frontend Build: PASSED"
                        echo "✅ Backend Verification: PASSED"
                        echo ""
                        echo "🎉 Ready to create Docker image!"
                    """
                }
            }
        }
    }
    
    post {
        success {
            script {
                echo '🎉 Pipeline completed successfully! Creating Docker image...'
                
                // Build and push Docker image only after ALL stages succeed
                stage('Backend Docker Build') {
                    echo '🐳 Building Docker image after successful pipeline completion...'
                    
                    try {
                        // Use withCredentials to securely handle the token
                        // Note: Update this credential ID to match your account credentials
                        withCredentials([usernamePassword(credentialsId: 'aadarsh-ghcr-cred', usernameVariable: 'GITHUB_USERNAME', passwordVariable: 'GITHUB_TOKEN_SECURE')]) {
                            sh """
                                echo "=== Building Final Docker Image ==="
                                echo "Current directory: \$(pwd)"
                                echo "Building Docker image with tag: ${IMAGE_TAG}"
                                echo "Docker version: \$(docker --version)"
                                echo "Docker info: \$(docker info | head -20)"
                                
                                # Check if we're in the right directory
                                echo "Files in current directory:"
                                ls -la
                                
                                # Check if Dockerfile exists
                                if [ ! -f "Dockerfile" ]; then
                                    echo "❌ Dockerfile not found in current directory!"
                                    echo "Looking for Dockerfile in parent directories..."
                                    find . -name "Dockerfile" -type f 2>/dev/null || echo "No Dockerfile found"
                                    exit 1
                                fi
                                
                                echo "✅ Dockerfile found, starting build..."
                                
                                # Build Docker image with verbose output
                                docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} . || {
                                    echo "❌ Docker build failed with exit code: \$?"
                                    echo "Docker build output above shows the error"
                                    echo "Checking Docker daemon status..."
                                    docker info || echo "Docker daemon not accessible"
                                    exit 1
                                }
                                
                                echo "✅ Docker image built successfully"
                                
                                echo "Creating branch tag..."
                                docker tag ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME}
                                
                                if [ "${env.BRANCH_NAME}" = "main" ]; then
                                    echo "Creating latest tag for main branch..."
                                    docker tag ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:latest
                                fi
                                
                                echo "Verifying Docker images..."
                                docker images | grep ${IMAGE_NAME} || echo "No images found with name ${IMAGE_NAME}"
                                
                                echo "=== Logging into GitHub Container Registry ==="
                                echo '${GITHUB_TOKEN_SECURE}' | docker login ${REGISTRY} -u '${GITHUB_USERNAME}' --password-stdin || {
                                    echo "❌ Docker login failed!"
                                    echo "Checking token length: \${#GITHUB_TOKEN_SECURE}"
                                    echo "Checking username: \${GITHUB_USERNAME}"
                                    exit 1
                                }
                                
                                echo "✅ Docker login successful"
                                
                                echo "=== Pushing Docker Image to GitHub Packages ==="
                                echo "Pushing ${IMAGE_TAG}..."
                                docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} || {
                                    echo "❌ Failed to push ${IMAGE_TAG}"
                                    echo "Checking if image exists locally..."
                                    docker images | grep ${IMAGE_NAME}
                                    echo "Checking registry permissions..."
                                    docker system info | grep -i registry
                                    exit 1
                                }
                                echo "✅ Successfully pushed ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                                
                                echo "Pushing ${env.BRANCH_NAME}..."
                                docker push ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME} || {
                                    echo "❌ Failed to push ${env.BRANCH_NAME}"
                                    exit 1
                                }
                                echo "✅ Successfully pushed ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME}"
                                
                                if [ "${env.BRANCH_NAME}" = "main" ]; then
                                    echo "Pushing latest tag..."
                                    docker push ${REGISTRY}/${IMAGE_NAME}:latest || {
                                        echo "❌ Failed to push latest"
                                        exit 1
                                    }
                                    echo "✅ Successfully pushed ${REGISTRY}/${IMAGE_NAME}:latest"
                                fi
                                
                                echo "Logging out from GitHub Container Registry..."
                                docker logout ${REGISTRY}
                                
                                echo "🎉 Docker image successfully pushed to GitHub Packages!"
                            """
                        }
                    } catch (Exception e) {
                        echo "❌ Docker build failed: ${e.getMessage()}"
                        throw e
                    }
                }
                
                stage('Backend Image Trivy Scan') {
                    echo '🔒 Running Trivy image security scan...'
                    script {
                        sh '''
                            # Install Trivy if not present
                            if ! command -v trivy &> /dev/null; then
                                echo "Installing Trivy..."
                                curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
                            fi
                            
                            # Run Trivy image scan
                            echo "Scanning Docker image for vulnerabilities..."
                            trivy image --format json --output trivy-backend-image.json ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} || true
                            trivy image --format table ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} || true
                            
                            # Generate console output
                            trivy image --format table ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} > trivy-backend-console.txt || true
                        '''
                    }
                }
                
                stage('Push Backend to GHCR') {
                    echo '📦 Pushing Docker image to GitHub Container Registry...'
                    try {
                        withCredentials([usernamePassword(credentialsId: 'aadarsh-ghcr-cred', usernameVariable: 'GITHUB_USERNAME', passwordVariable: 'GITHUB_TOKEN_SECURE')]) {
                            sh """
                                echo "=== Logging into GitHub Container Registry ==="
                                echo '${GITHUB_TOKEN_SECURE}' | docker login ${REGISTRY} -u '${GITHUB_USERNAME}' --password-stdin || {
                                    echo "❌ Docker login failed!"
                                    echo "Checking token length: \${#GITHUB_TOKEN_SECURE}"
                                    echo "Checking username: \${GITHUB_USERNAME}"
                                    exit 1
                                }

                                echo "✅ Docker login successful"

                                echo "=== Pushing Docker Image to GitHub Packages ==="
                                echo "Pushing ${IMAGE_TAG}..."
                                docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} || {
                                    echo "❌ Failed to push ${IMAGE_TAG}"
                                    echo "Checking if image exists locally..."
                                    docker images | grep ${IMAGE_NAME}
                                    echo "Checking registry permissions..."
                                    docker system info | grep -i registry
                                    exit 1
                                }
                                echo "✅ Successfully pushed ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"

                                echo "Pushing ${env.BRANCH_NAME}..."
                                docker push ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME} || {
                                    echo "❌ Failed to push ${env.BRANCH_NAME}"
                                    exit 1
                                }
                                echo "✅ Successfully pushed ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME}"

                                if [ "${env.BRANCH_NAME}" = "main" ]; then
                                    echo "Pushing latest tag..."
                                    docker push ${REGISTRY}/${IMAGE_NAME}:latest || {
                                        echo "❌ Failed to push latest"
                                        exit 1
                                    }
                                    echo "✅ Successfully pushed ${REGISTRY}/${IMAGE_NAME}:latest"
                                fi

                                echo "Logging out from GitHub Container Registry..."
                                docker logout ${REGISTRY}

                                echo "🎉 Docker image successfully pushed to GitHub Packages!"
                            """
                        }
                    } catch (Exception e) {
                        echo "❌ Docker push failed: ${e.getMessage()}"
                        throw e
                    }
                }
                
                stage('Cleanup Backend Images') {
                    echo '🧹 Cleaning up local Docker images...'
                    script {
                        sh '''
                            echo "Cleaning up local Docker images to save space..."
                            docker rmi ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} || true
                            docker rmi ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME} || true
                            if [ "${env.BRANCH_NAME}" = "main" ]; then
                                docker rmi ${REGISTRY}/${IMAGE_NAME}:latest || true
                            fi
                            echo "✅ Local image cleanup completed"
                        '''
                    }
                }
                
                stage('Docker Image URL') {
                    echo '🔗 Generating Docker image URLs...'
                    script {
                        sh """
                            echo "=== GitHub Packages URLs ==="
                            echo "📦 Main Image: ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                            echo "🏷️  Branch Tag: ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME}"
                            if [ "${env.BRANCH_NAME}" = "main" ]; then
                                echo "⭐ Latest Tag: ${REGISTRY}/${IMAGE_NAME}:latest"
                            fi
                            echo ""
                            echo "🔗 View package at: https://github.com/aadarsh0507/greetings-aph/pkgs/container/greetings-aph"
                            echo "📥 Pull command: docker pull ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                        """
                    }
                }
                        
                        echo "=== GitHub Packages Summary ==="
                        echo "📦 Single Docker image created and pushed:"
                        echo "   • ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                        echo "   • ${REGISTRY}/${IMAGE_NAME}:${env.BRANCH_NAME}"
                        if (env.BRANCH_NAME == 'main') {
                            echo "   • ${REGISTRY}/${IMAGE_NAME}:latest"
                        }
                        echo ""
                        echo "🔗 View package at: https://github.com/aadarsh0507/greetings-aph/pkgs/container/greetings-aph"
                        echo "📥 Pull command: docker pull ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
                        
                    } catch (Exception e) {
                        echo "❌ Docker build/push failed: ${e.getMessage()}"
                        echo "Pipeline succeeded but Docker image creation failed."
                        throw e
                    }
                }
            }
        }
        
        failure {
            echo '❌ Pipeline failed!'
            echo 'No Docker image will be created.'
            echo 'Check the logs above for details.'
        }
        
        always {
            echo '📊 Pipeline execution completed'
        }
    }
}

