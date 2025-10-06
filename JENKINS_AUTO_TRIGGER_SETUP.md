# Jenkins Auto-Trigger Setup Guide

## ✅ Current Jenkinsfile Configuration

Your `Jenkinsfile` already has the correct trigger configuration:

```groovy
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
```

## 🔧 Required Jenkins Plugins

Ensure these plugins are installed in your Jenkins:

1. **GitHub Integration Plugin**
2. **GitHub Branch Source Plugin** 
3. **GitHub Plugin**
4. **Pipeline Plugin**
5. **Build Trigger Badge Plugin**

## 📋 Step-by-Step Setup

### 1. Jenkins Configuration

#### A. Configure GitHub Integration
1. Go to **Jenkins Dashboard** → **Manage Jenkins** → **Configure System**
2. Find **GitHub** section
3. Add GitHub Server:
   - **Name**: `GitHub`
   - **API URL**: `https://api.github.com`
   - **Credentials**: Add your GitHub Personal Access Token
   - ✅ **Manage hooks**: Check this box
   - ✅ **Specify another hook URL**: Check this box
   - **Hook URL**: `http://YOUR_JENKINS_URL:8080/github-webhook/`

#### B. Configure Global Pipeline Libraries (Optional)
1. Go to **Manage Jenkins** → **Configure System**
2. Find **Global Pipeline Libraries**
3. Add library if needed for shared pipeline code

### 2. GitHub Repository Configuration

#### A. Add Webhook to GitHub Repository
1. Go to your repository: `https://github.com/aadarsh0507/greetings-aph`
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Configure webhook:
   - **Payload URL**: `http://YOUR_JENKINS_IP:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Select **"Just the push event"**
   - ✅ **Active**: Check this box
   - Click **Add webhook**

#### B. Verify Repository Settings
1. Go to **Settings** → **General**
2. Ensure repository is **Public** or Jenkins has access
3. Check **Actions** permissions if using GitHub Actions

### 3. Jenkins Job Configuration

#### A. Create/Update Pipeline Job
1. Go to **Jenkins Dashboard** → **New Item**
2. Enter job name: `APH-Greetings-Pipeline`
3. Select **Pipeline** → **OK**
4. Configure job:
   - **Description**: "APH Greetings - Patient Birthday Manager Pipeline"
   - **GitHub project**: `https://github.com/aadarsh0507/greetings-aph`
   - **Pipeline**: 
     - **Definition**: Pipeline script from SCM
     - **SCM**: Git
     - **Repository URL**: `https://github.com/aadarsh0507/greetings-aph.git`
     - **Credentials**: Add if private repo
     - **Branches to build**: `*/main`, `*/features`
     - **Script Path**: `Jenkinsfile`

#### B. Enable GitHub Hook Trigger
1. In job configuration, find **Build Triggers** section
2. ✅ **GitHub hook trigger for GITScm polling**: Check this box
3. ✅ **Poll SCM**: Check this box (fallback)
   - **Schedule**: `H/5 * * * *` (every 5 minutes)

### 4. Test the Setup

#### A. Test Webhook
1. Make a small change to any file in your repository
2. Commit and push the change:
   ```bash
   git add .
   git commit -m "Test auto-trigger"
   git push origin main
   ```
3. Check Jenkins dashboard - pipeline should start automatically within 1-2 minutes

#### B. Verify Pipeline Stages
Your pipeline should now automatically run these stages:
1. ✅ **Checkout** (2s)
2. ✅ **Setup Node.js** 
3. ✅ **Code Quality Check**
4. ✅ **Sonar Scan** (17s)
5. ✅ **Quality Gate** (527ms)
6. ✅ **Trivy Code Scan** (5s)
7. ✅ **Run Tests**
8. ✅ **Final Verification**
9. ✅ **Backend Docker Build** (1min 27s)
10. ✅ **Backend Image Trivy Scan** (38s)
11. ✅ **Push Backend to GHCR** (27s)
12. ✅ **Cleanup Backend Images** (6s)
13. ✅ **Docker Image URL** (1s)

## 🔍 Troubleshooting

### If Pipeline Doesn't Auto-Start:

1. **Check Webhook Delivery**:
   - Go to GitHub → Settings → Webhooks
   - Click on your webhook → Recent Deliveries
   - Check if requests are successful (200 status)

2. **Check Jenkins Logs**:
   - Go to **Manage Jenkins** → **System Log**
   - Look for GitHub webhook related errors

3. **Verify Jenkins URL**:
   - Ensure Jenkins is accessible from GitHub
   - Check firewall settings
   - Use public IP if needed

4. **Check Credentials**:
   - Verify GitHub token has correct permissions
   - Ensure Jenkins can access your repository

5. **Manual Trigger Test**:
   - Go to Jenkins job → **Build Now**
   - If manual build works, issue is with webhook setup

### Common Issues:

- **403 Forbidden**: Check GitHub token permissions
- **Connection Refused**: Check Jenkins URL and firewall
- **Hook Not Triggering**: Verify webhook URL and repository settings

## 🎯 Expected Result

After setup, every push to your repository should automatically trigger the Jenkins pipeline, and you'll see builds appearing in your Jenkins dashboard within 1-2 minutes of pushing code.

## 📊 Pipeline Status

Your pipeline is configured to:
- ✅ **Auto-trigger on push**
- ✅ **Run all quality checks**
- ✅ **Build and push Docker image**
- ✅ **Generate security reports**
- ✅ **Clean up resources**

The pipeline should complete in approximately **3-4 minutes** and push a Docker image to your GitHub Container Registry.
