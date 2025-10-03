# GitHub Token Permissions Fix

## Issue Identified ✅

The Jenkins pipeline is working perfectly:
- ✅ **All pipeline stages completed successfully**
- ✅ **Docker login succeeded**
- ✅ **Docker image built successfully**
- ❌ **Push failed**: `denied: permission_denied: write_package`

## Root Cause

The GitHub token doesn't have the required permissions to write packages to GitHub Container Registry.

## Solution Steps

### **Step 1: Update GitHub Token Permissions**

1. **Go to GitHub Settings:**
   - Navigate to: `https://github.com/settings/tokens`
   - Find your existing token or create a new one

2. **Required Token Scopes:**
   - ✅ `write:packages` - Write packages to GitHub Container Registry
   - ✅ `read:packages` - Read packages from GitHub Container Registry
   - ✅ `repo` - Full control of private repositories
   - ✅ `workflow` - Update GitHub Action workflows (optional)

3. **Update Jenkins Credential:**
   - Go to Jenkins → Manage Jenkins → Manage Credentials
   - Find `ghcr-cred` credential
   - Update with the new token that has proper permissions

### **Step 2: Check Repository Package Settings**

1. **Go to Repository Settings:**
   - Navigate to: `https://github.com/aadarsh0507/greetings-aph/settings`
   - Click on **Actions** → **General**

2. **Verify Workflow Permissions:**
   - Set "Workflow permissions" to "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

3. **Check Package Visibility:**
   - Go to: `https://github.com/aadarsh0507/greetings-aph/pkgs/container/greetings-aph`
   - Click **Package settings**
   - Ensure visibility is set appropriately (Public or Private with proper access)

### **Step 3: Alternative Quick Fix**

If you want to test immediately, you can temporarily make the repository public:

1. **Go to Repository Settings:**
   - Navigate to: `https://github.com/aadarsh0507/greetings-aph/settings`
   - Scroll to "Danger Zone"
   - Click "Change repository visibility"
   - Select "Make public"
   - Confirm the change

2. **Test the Pipeline:**
   - Push a small change to trigger Jenkins
   - The Docker push should now work

3. **Make Private Again:**
   - After successful test, change back to private if desired

## Expected Success Output

After fixing permissions:
```
=== Pushing Docker Image to GitHub Packages ===
Pushing features-8...
✅ Successfully pushed ghcr.io/aadarsh0507/greetings-aph:features-8
Pushing features...
✅ Successfully pushed ghcr.io/aadarsh0507/greetings-aph:features
🎉 Docker image successfully pushed to GitHub Packages!
```

## Verification Steps

1. **Check GitHub Packages:**
   - Go to: `https://github.com/aadarsh0507/greetings-aph/pkgs/container/greetings-aph`
   - You should see the new Docker image tags

2. **Test Pull Command:**
   ```bash
   docker pull ghcr.io/aadarsh0507/greetings-aph:features
   ```

## Most Likely Solution

The quickest fix is to update your GitHub token with the `write:packages` scope:

1. **Create New Token:**
   - Go to: `https://github.com/settings/tokens`
   - Click "Generate new token (classic)"
   - Select scopes: `write:packages`, `read:packages`, `repo`
   - Copy the token

2. **Update Jenkins:**
   - Go to Jenkins → Manage Credentials
   - Update `ghcr-cred` with the new token
   - Use your GitHub username as the username field

3. **Test Pipeline:**
   - Push a change to trigger Jenkins
   - The Docker push should now succeed

The pipeline is working perfectly - it just needs the proper GitHub token permissions! 🎉
