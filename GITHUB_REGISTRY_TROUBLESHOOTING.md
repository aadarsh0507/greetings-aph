# GitHub Container Registry Troubleshooting Guide

## Common Docker Push Errors and Solutions

### Error: Authentication Failed
**Symptoms**: 
- `Error response from daemon: unauthorized`
- `Error: authentication required`

**Solutions**:

1. **Verify GitHub Token Permissions**:
   - Go to GitHub → Settings → Developer settings → Personal access tokens
   - Ensure your token has these scopes:
     - `write:packages` (to push packages)
     - `read:packages` (to pull packages)
     - `delete:packages` (to delete packages)
     - `repo` (for repository access)

2. **Check Jenkins Credential Configuration**:
   - Go to Jenkins → Manage Jenkins → Manage Credentials
   - Verify the `ghcr-cred` credential is properly configured
   - Ensure the credential ID matches what's in the Jenkinsfile

3. **Verify Repository Permissions**:
   - Go to your repository → Settings → Actions → General
   - Ensure "Workflow permissions" allows read and write access
   - Check that the repository is public or you have proper access

### Error: Repository Not Found
**Symptoms**:
- `Error response from daemon: repository not found`
- `Error: repository does not exist`

**Solutions**:

1. **Check Repository Name**:
   - Verify the repository name in Jenkinsfile matches your actual repo
   - Current: `aadarsh0507/greetings-aph`
   - Ensure case sensitivity is correct

2. **Initialize Package Repository**:
   - Go to GitHub → Your profile → Packages
   - If the package doesn't exist, push an image first to create it
   - Or manually create the package repository

### Error: Docker Login Failed
**Symptoms**:
- `Error: Cannot perform an interactive login from a non TTY device`
- `Error: login failed`

**Solutions**:

1. **Use Non-Interactive Login**:
   ```bash
   echo $GITHUB_TOKEN | docker login ghcr.io -u aadarsh0507 --password-stdin
   ```

2. **Verify Token Format**:
   - Ensure the token doesn't have extra spaces or newlines
   - Check that the token is properly escaped in Jenkins

### Error: Push Permission Denied
**Symptoms**:
- `Error response from daemon: denied: resource not accessible`
- `Error: push access denied`

**Solutions**:

1. **Check Package Visibility**:
   - Go to GitHub → Your profile → Packages
   - Click on your package → Settings
   - Ensure visibility is set to Public or you have proper access

2. **Verify Organization Settings** (if applicable):
   - Go to organization settings → Packages
   - Check package creation and visibility policies

## Testing Docker Authentication Locally

1. **Create a Personal Access Token**:
   ```bash
   # Go to GitHub → Settings → Developer settings → Personal access tokens
   # Create token with packages:write scope
   ```

2. **Test Login**:
   ```bash
   echo YOUR_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin
   ```

3. **Test Push**:
   ```bash
   docker tag your-image ghcr.io/YOUR_USERNAME/YOUR_REPO:test
   docker push ghcr.io/YOUR_USERNAME/YOUR_REPO:test
   ```

## Jenkins-Specific Solutions

### Fix 1: Update Jenkinsfile with Better Error Handling
The updated Jenkinsfile now includes:
- Better error handling with try-catch blocks
- Detailed logging for each step
- Automatic logout on failure
- Docker image verification before push

### Fix 2: Verify Jenkins Credentials
1. Go to Jenkins → Manage Jenkins → Manage Credentials
2. Find the `ghcr-cred` credential
3. Ensure it contains a valid GitHub Personal Access Token
4. Test the credential by clicking "Test connection"

### Fix 3: Check Jenkins Environment Variables
The Jenkinsfile uses:
```groovy
environment {
    GITHUB_TOKEN = credentials('ghcr-cred')
}
```

Ensure this matches your credential ID in Jenkins.

## Quick Fixes to Try

1. **Regenerate GitHub Token**:
   - Create a new Personal Access Token with `packages:write` scope
   - Update Jenkins credential with the new token

2. **Make Repository Public** (temporary):
   - Go to repository settings → Danger Zone → Change repository visibility
   - Set to Public temporarily to test

3. **Use Docker Hub Instead** (alternative):
   - Modify Jenkinsfile to push to Docker Hub instead of GHCR
   - Often easier to configure initially

## Verification Steps

1. **Check Docker Images**:
   ```bash
   docker images | grep greetings-aph
   ```

2. **Check GitHub Packages**:
   - Go to GitHub → Your profile → Packages
   - Look for `greetings-aph` package

3. **Test Pull**:
   ```bash
   docker pull ghcr.io/aadarsh0507/greetings-aph:latest
   ```

## Contact Support

If issues persist:
1. Check GitHub Package logs in repository settings
2. Verify Jenkins system logs for detailed error messages
3. Test authentication manually using the steps above
4. Consider using Docker Hub as an alternative registry
