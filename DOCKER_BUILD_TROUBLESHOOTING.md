# Docker Build/Push Troubleshooting Guide

## Current Issue: Exit Code 1

The Jenkins pipeline shows: `Docker build/push failed: script returned exit code 1`

## Enhanced Jenkinsfile Applied ✅

I've updated the Jenkinsfile with:
- ✅ **Better error handling** for each step
- ✅ **Detailed debugging output** to identify exact failure point
- ✅ **Step-by-step verification** of Docker build, login, and push
- ✅ **Clear error messages** with specific failure reasons

## Common Causes and Solutions

### **Cause 1: GitHub Token Permissions**
**Symptoms**: `denied: permission_denied: write_package`

**Solution**:
1. **Update GitHub Token:**
   - Go to: `https://github.com/settings/tokens`
   - Create new token with scopes: `write:packages`, `read:packages`, `repo`
   - Update Jenkins credential `ghcr-cred`

### **Cause 2: Docker Daemon Issues**
**Symptoms**: Docker commands fail immediately

**Solution**:
1. **Check Docker Service:**
   - Ensure Docker is running on Jenkins server
   - Verify Docker daemon is accessible

### **Cause 3: Registry Authentication**
**Symptoms**: Login fails or push denied

**Solution**:
1. **Verify Credentials:**
   - Check Jenkins credential configuration
   - Ensure username and token are correct
   - Test login manually

### **Cause 4: Network/Connectivity**
**Symptoms**: Timeout or connection errors

**Solution**:
1. **Check Network:**
   - Verify Jenkins server can reach `ghcr.io`
   - Check firewall settings
   - Test DNS resolution

## Testing Steps

### **Step 1: Test Docker Build Locally**
```bash
# Test if Docker build works
docker build -t test-image .

# Check if image was created
docker images | grep test-image
```

### **Step 2: Test GitHub Login**
```bash
# Test GitHub Container Registry login
echo YOUR_TOKEN | docker login ghcr.io -u YOUR_USERNAME --password-stdin

# Test push (if login works)
docker tag test-image ghcr.io/aadarsh0507/greetings-aph:test
docker push ghcr.io/aadarsh0507/greetings-aph:test
```

### **Step 3: Check Jenkins Logs**
The enhanced Jenkinsfile will now show exactly where the failure occurs:
- ✅ **Docker build step** - Shows if build fails
- ✅ **Login step** - Shows if authentication fails  
- ✅ **Push step** - Shows if push fails
- ✅ **Detailed error messages** for each failure

## Quick Fixes to Try

### **Fix 1: Update GitHub Token (Most Likely)**
1. **Create New Token:**
   - Go to: `https://github.com/settings/tokens`
   - Select scopes: `write:packages`, `read:packages`, `repo`
   - Copy the token

2. **Update Jenkins:**
   - Go to Jenkins → Manage Credentials
   - Update `ghcr-cred` with new token

### **Fix 2: Make Repository Public (Quick Test)**
1. **Temporary Public:**
   - Go to repository settings → Danger Zone
   - Change to "Public"
   - Test pipeline
   - Change back to private

### **Fix 3: Check Jenkins Docker Setup**
1. **Verify Docker:**
   - Ensure Docker is installed on Jenkins server
   - Check if Jenkins user can run Docker commands
   - Verify Docker daemon is running

## Expected Success Output

After fixes, you should see:
```
✅ Docker image built successfully
✅ Docker login successful
✅ Successfully pushed ghcr.io/aadarsh0507/greetings-aph:features-X
✅ Successfully pushed ghcr.io/aadarsh0507/greetings-aph:features
🎉 Docker image successfully pushed to GitHub Packages!
```

## Next Steps

1. **Push the updated Jenkinsfile:**
   ```bash
   git add Jenkinsfile
   git commit -m "Enhanced Docker build error handling and debugging"
   git push origin features
   ```

2. **Watch Jenkins logs** for detailed error information

3. **Apply the appropriate fix** based on the specific error shown

The enhanced Jenkinsfile will now tell us exactly what's failing! 🔍
