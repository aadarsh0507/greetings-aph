# GitHub Token Permissions Fix

## Current Issue
```
denied: permission_denied: write_package
```

The GitHub token in Jenkins doesn't have the required permissions to push to GitHub Container Registry.

## Solution: Update GitHub Token Permissions

### **Step 1: Create New GitHub Token**

1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name: `Jenkins-GHCR-Push`
4. Select these scopes:
   - ✅ `write:packages` (Required for pushing to GHCR)
   - ✅ `read:packages` (Required for pulling from GHCR)
   - ✅ `repo` (Required for repository access)
   - ✅ `delete:packages` (Optional, for cleanup)

### **Step 2: Update Jenkins Credentials**

1. Go to Jenkins → Manage Jenkins → Manage Credentials
2. Find your `ghcr-cred` credential
3. Click "Update"
4. Replace the password with your new token
5. Save

### **Step 3: Alternative: Make Repository Public (Quick Fix)**

If you want a quick temporary fix:

1. Go to your GitHub repository settings
2. Scroll down to "Danger Zone"
3. Click "Change repository visibility"
4. Select "Make public"
5. This allows anyone to push to your packages

## Token Scopes Required

```
write:packages  ← CRITICAL: Allows pushing to GHCR
read:packages   ← Allows pulling from GHCR
repo            ← Allows repository access
```

## Verification

After updating the token, the Jenkins pipeline should successfully push to:
- `ghcr.io/aadarsh0507/greetings-aph:features-10`
- `ghcr.io/aadarsh0507/greetings-aph:features`
- `ghcr.io/aadarsh0507/greetings-aph:latest` (if on main branch)

## Expected Success Output

```
✅ Successfully pushed ghcr.io/aadarsh0507/greetings-aph:features-10
✅ Successfully pushed ghcr.io/aadarsh0507/greetings-aph:features
🎉 Docker image successfully pushed to GitHub Packages!
```