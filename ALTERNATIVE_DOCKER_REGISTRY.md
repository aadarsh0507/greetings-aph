# Alternative Docker Registry Setup

Since GitHub Container Registry is having authentication issues, here are alternative solutions:

## Option 1: Use Docker Hub (Recommended)

Docker Hub is easier to configure and more reliable for CI/CD.

### Steps to Switch to Docker Hub:

1. **Create Docker Hub Account**:
   - Go to https://hub.docker.com
   - Sign up for a free account
   - Create a new repository: `aadarsh0507/greetings-aph`

2. **Update Jenkinsfile**:
   ```groovy
   environment {
       // Docker Hub Registry
       REGISTRY = 'docker.io'
       IMAGE_NAME = 'aadarsh0507/greetings-aph'
       
       // Docker Hub credentials
       DOCKER_HUB_TOKEN = credentials('docker-hub-cred')
   }
   ```

3. **Configure Jenkins Credential**:
   - Go to Jenkins → Manage Credentials
   - Add new credential: `docker-hub-cred`
   - Use your Docker Hub username and access token

4. **Update Docker Login**:
   ```bash
   echo '${DOCKER_HUB_TOKEN}' | docker login ${REGISTRY} -u aadarsh0507 --password-stdin
   ```

## Option 2: Fix GitHub Container Registry

### Check Token Permissions:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Create new token with these scopes:
   - ✅ `write:packages`
   - ✅ `read:packages`
   - ✅ `repo`
   - ✅ `workflow`

### Check Repository Settings:
1. Go to repository → Settings → Actions → General
2. Set "Workflow permissions" to "Read and write permissions"
3. Check "Allow GitHub Actions to create and approve pull requests"

### Make Repository Public (Temporary):
1. Go to repository → Settings → Danger Zone
2. Change repository visibility to "Public"
3. Test the pipeline
4. Change back to private after testing

## Option 3: Use Local Registry (Development Only)

For local development, you can skip the registry push:

```groovy
stage('Push to Registry') {
    when {
        expression { 
            return env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'features'
        }
    }
    steps {
        echo 'Skipping registry push for development'
        // Comment out the push steps
    }
}
```

## Quick Fix for Current Issue

The most likely solution is to create a new GitHub Personal Access Token:

1. **Create New Token**:
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `write:packages`, `read:packages`, `repo`
   - Copy the token

2. **Update Jenkins Credential**:
   - Go to Jenkins → Manage Credentials
   - Find `ghcr-cred`
   - Update with the new token

3. **Test the Pipeline**:
   - Push a small change to trigger the pipeline
   - Check the logs for authentication success

## Verification Steps

After fixing, verify the setup:

1. **Check Docker Images**:
   ```bash
   docker images | grep greetings-aph
   ```

2. **Test Pull**:
   ```bash
   docker pull ghcr.io/aadarsh0507/greetings-aph:latest
   ```

3. **Check GitHub Packages**:
   - Go to GitHub → Your profile → Packages
   - Look for `greetings-aph` package

## Troubleshooting Commands

```bash
# Test Docker login manually
echo YOUR_TOKEN | docker login ghcr.io -u aadarsh0507 --password-stdin

# Test push manually
docker tag greetings-aph ghcr.io/aadarsh0507/greetings-aph:test
docker push ghcr.io/aadarsh0507/greetings-aph:test

# Check Docker system info
docker system info | grep -i registry
```
