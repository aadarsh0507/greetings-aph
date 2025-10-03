# Docker Hub Alternative Solution

## Quick Fix: Switch to Docker Hub

Since GitHub Container Registry has permission issues, we can switch to Docker Hub which is often more reliable.

## Step 1: Create Docker Hub Account

1. Go to [hub.docker.com](https://hub.docker.com)
2. Create account or login
3. Create a repository named `greetings-aph`

## Step 2: Update Jenkinsfile

Replace the GitHub Container Registry with Docker Hub:

```groovy
// Change these lines in Jenkinsfile:
REGISTRY = 'docker.io'  // Instead of 'ghcr.io'
IMAGE_NAME = 'aadarsh0507/greetings-aph'  // Your Docker Hub username/repo
```

## Step 3: Update Jenkins Credentials

1. Go to Jenkins → Manage Credentials
2. Update `ghcr-cred` with:
   - Username: Your Docker Hub username
   - Password: Your Docker Hub password or access token

## Step 4: Test the Pipeline

The pipeline will now push to:
- `docker.io/aadarsh0507/greetings-aph:features-10`
- `docker.io/aadarsh0507/greetings-aph:features`
- `docker.io/aadarsh0507/greetings-aph:latest`

## Advantages of Docker Hub

- ✅ More reliable than GitHub Container Registry
- ✅ Better permission handling
- ✅ Easier to set up
- ✅ No token scope issues

## Quick Implementation

If you want to try this now, I can update the Jenkinsfile to use Docker Hub instead of GitHub Container Registry.
