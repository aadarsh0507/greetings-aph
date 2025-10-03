# Jenkins Auto-Trigger Setup Guide

This guide helps you configure Jenkins to automatically run the pipeline when code is pushed to GitHub.

## Prerequisites

1. Jenkins server with the following plugins installed:
   - GitHub Plugin
   - GitHub Branch Source Plugin
   - Pipeline Plugin
   - Docker Pipeline Plugin

## Step 1: Configure GitHub Webhook

1. Go to your GitHub repository: `https://github.com/aadarsh0507/greetings-aph`
2. Click on **Settings** tab
3. Click on **Webhooks** in the left sidebar
4. Click **Add webhook**
5. Fill in the webhook details:
   - **Payload URL**: `http://your-jenkins-server:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Secret**: (leave empty or add a secret if configured in Jenkins)
   - **Which events**: Select "Just the push event"
6. Click **Add webhook**

## Step 2: Configure Jenkins Job

### Option A: Using Jenkins UI (Recommended)

1. Go to your Jenkins dashboard
2. Click on your job: `greetings-aph`
3. Click **Configure**
4. In the **Build Triggers** section:
   - Check **GitHub hook trigger for GITScm polling**
5. In the **Pipeline** section:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/aadarsh0507/greetings-aph.git`
   - **Branch Specifier**: `*/main` and `*/features`
   - **Script Path**: `Jenkinsfile`
6. Click **Save**

### Option B: Using Pipeline Script (Current Setup)

The current `Jenkinsfile` already includes auto-trigger configuration:
```groovy
options {
    githubProjectProperty(projectUrlStr: 'https://github.com/aadarsh0507/greetings-aph')
    buildDiscarder(logRotator(numToKeepStr: '10'))
    // Auto-trigger on GitHub push events
    pipelineTriggers([
        githubPush()
    ])
}
```

## Step 3: Verify Node.js Installation

The updated Jenkinsfile now includes Node.js setup:
- Installs Node.js 18 using nvm
- Sets up npm environment for all build steps
- No manual Node.js installation required on Jenkins server

## Step 4: Test Auto-Trigger

1. Make a small change to any file in your repository
2. Commit and push the changes:
   ```bash
   git add .
   git commit -m "Test auto-trigger"
   git push origin main
   ```
3. Check Jenkins dashboard - a new build should start automatically

## Troubleshooting

### Webhook Not Triggering
- Check GitHub webhook delivery status in repository settings
- Verify Jenkins server is accessible from GitHub
- Check Jenkins logs for webhook delivery errors

### Node.js Issues
- The pipeline now auto-installs Node.js 18 using nvm
- All npm commands are wrapped with proper nvm environment setup
- No manual Node.js installation needed on Jenkins server

### Build Failures
- Check Jenkins console output for specific error messages
- Verify Docker is installed and running on Jenkins server
- Ensure GitHub Container Registry credentials are properly configured

## Manual Build Trigger

If auto-trigger isn't working, you can still trigger builds manually:
1. Go to Jenkins job page
2. Click **Build Now**

## Security Considerations

- Use HTTPS for webhook URLs in production
- Configure proper authentication for Jenkins access
- Set up proper firewall rules for Jenkins server
- Use secrets for sensitive credentials

## Support

If you encounter issues:
1. Check Jenkins system logs
2. Verify GitHub webhook delivery status
3. Test manual build trigger first
4. Check Node.js and Docker installation on Jenkins server
