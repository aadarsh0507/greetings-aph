# Jenkins Credential Fix - Use Your Account

## Current Issue
- Jenkins credentials `ghcr-cred` are connected to your **friend's account**
- But the pipeline is trying to push to **your account** (`aadarsh0507`)
- This causes permission mismatch

## Solution: Update Jenkins Credentials

### **Option 1: Update Existing Credential (Recommended)**

1. **Go to Jenkins Dashboard**
2. **Navigate to**: Manage Jenkins → Manage Credentials
3. **Find**: `ghcr-cred` credential
4. **Click**: "Update" or edit
5. **Change**:
   - Username: `aadarsh0507` (your GitHub username)
   - Password: Your GitHub personal access token (with `write:packages` scope)

### **Option 2: Create New Credential**

1. **Go to Jenkins Dashboard**
2. **Navigate to**: Manage Jenkins → Manage Credentials
3. **Click**: "Add Credentials"
4. **Fill in**:
   - Kind: `Username with password`
   - Scope: `Global`
   - Username: `aadarsh0507`
   - Password: Your GitHub token
   - ID: `aadarsh-ghcr-cred` (new ID)
   - Description: `Aadarsh GitHub Container Registry credentials`

5. **Update Jenkinsfile** to use new credential:
   ```groovy
   // Change line 154 in Jenkinsfile from:
   withCredentials([usernamePassword(credentialsId: 'ghcr-cred', ...)])
   
   // To:
   withCredentials([usernamePassword(credentialsId: 'aadarsh-ghcr-cred', ...)])
   ```

## Required GitHub Token Permissions

Your GitHub token needs these scopes:
- ✅ `write:packages` (Push to GHCR)
- ✅ `read:packages` (Pull from GHCR)
- ✅ `repo` (Repository access)

## Create GitHub Token

1. **Go to**: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. **Click**: "Generate new token (classic)"
3. **Name**: `Jenkins-GHCR-Push`
4. **Scopes**: Select `write:packages`, `read:packages`, `repo`
5. **Generate** and copy the token

## Expected Result

After fixing credentials, the pipeline will successfully push to:
- `ghcr.io/aadarsh0507/greetings-aph:features-10`
- `ghcr.io/aadarsh0507/greetings-aph:features`
- `ghcr.io/aadarsh0507/greetings-aph:latest`

## Verification

Check your GitHub profile packages at:
`https://github.com/aadarsh0507?tab=packages`

You should see the `greetings-aph` package with all the tags.

## Quick Fix Commands

If you want me to update the Jenkinsfile with a new credential ID:

```bash
# I can update the Jenkinsfile to use a new credential ID
# Just let me know what you want to call it
```

**Which option do you prefer?**
1. Update existing `ghcr-cred` with your account details
2. Create new credential and update Jenkinsfile