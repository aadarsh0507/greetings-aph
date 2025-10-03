# Jenkins Docker Build Debug Guide

## Current Issue: Exit Code 1

The Jenkins pipeline is failing with `script returned exit code 1` during Docker build.

## Enhanced Debugging Applied ✅

I've updated the Jenkinsfile with comprehensive debugging:

### **1. Pre-Build Checks**
```bash
echo "Current directory: $(pwd)"
echo "Docker version: $(docker --version)"
echo "Files in current directory:"
ls -la

# Check if Dockerfile exists
if [ ! -f "Dockerfile" ]; then
    echo "❌ Dockerfile not found!"
    find . -name "Dockerfile" -type f
    exit 1
fi
```

### **2. Build Error Handling**
```bash
docker build -t ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG} . || {
    echo "❌ Docker build failed with exit code: $?"
    echo "Docker build output above shows the error"
    exit 1
}
```

## Common Causes and Solutions

### **Cause 1: Working Directory Issue**
**Symptoms**: "Dockerfile not found"

**Solution**:
- Jenkins might not be in the correct directory
- The enhanced logging will show current directory and files

### **Cause 2: Docker Daemon Issues**
**Symptoms**: Docker commands fail immediately

**Solution**:
- Jenkins user might not have Docker access
- Docker service might not be running

### **Cause 3: Build Context Issues**
**Symptoms**: Build fails during COPY or RUN commands

**Solution**:
- Missing files in build context
- Permission issues with files

### **Cause 4: Network Issues**
**Symptoms**: npm install or package downloads fail

**Solution**:
- Jenkins server network connectivity
- Package registry access issues

## Quick Fixes to Try

### **Fix 1: Verify Jenkins Working Directory**
The enhanced logging will show:
- Current directory path
- Files present in directory
- Whether Dockerfile exists

### **Fix 2: Check Docker Access**
The logs will show:
- Docker version
- Docker daemon status
- Whether Jenkins can run Docker commands

### **Fix 3: Test Build Manually**
If Jenkins continues to fail, test locally:
```bash
# Test the exact same build
docker build -t ghcr.io/aadarsh0507/greetings-aph:test .

# Check if it works
docker images | grep greetings-aph
```

## Expected Debug Output

With the enhanced logging, you should see:

```
=== Building Final Docker Image ===
Current directory: /var/lib/jenkins/workspace/greetings-aph_features
Docker version: Docker version 20.10.x
Files in current directory:
total 12
drwxr-xr-x 3 jenkins jenkins 4096 Oct 3 15:30 .
drwxr-xr-x 5 jenkins jenkins 4096 Oct 3 15:30 ..
-rw-r--r-- 1 jenkins jenkins 2048 Oct 3 15:30 Dockerfile
drwxr-xr-x 2 jenkins jenkins 4096 Oct 3 15:30 frontend
drwxr-xr-x 2 jenkins jenkins 4096 Oct 3 15:30 backend
✅ Dockerfile found, starting build...
```

## Next Steps

1. **Push the enhanced Jenkinsfile:**
   ```bash
   git add Jenkinsfile
   git commit -m "Enhanced Docker build debugging and error handling"
   git push origin features
   ```

2. **Check Jenkins logs** for the detailed debug output

3. **Identify the exact failure point** from the enhanced logging

4. **Apply the appropriate fix** based on the specific error shown

## Alternative Solution

If Docker build continues to fail, we can modify the approach:

### **Option 1: Use Docker Hub Instead**
- Change registry from `ghcr.io` to `docker.io`
- Often more reliable than GitHub Container Registry

### **Option 2: Skip Docker Build Temporarily**
- Comment out Docker build section
- Focus on getting pipeline stages working first
- Add Docker build back later

### **Option 3: Use Pre-built Base Image**
- Use a simpler Dockerfile
- Focus on application deployment rather than building

The enhanced debugging will tell us exactly what's failing! 🔍
