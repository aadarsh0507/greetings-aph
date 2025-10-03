# Jenkins Auto-Trigger Troubleshooting Guide

## Current Issue: Auto-Trigger Not Working

If the Jenkins pipeline is not automatically triggering on code pushes, follow these steps:

## Step 1: Verify Jenkinsfile Configuration

The current Jenkinsfile has the correct auto-trigger configuration:
```groovy
options {
    githubProjectProperty(projectUrlStr: 'https://github.com/aadarsh0507/greetings-aph')
    buildDiscarder(logRotator(numToKeepStr: '10'))
    // Auto-trigger on GitHub push events
    pipelineTriggers([
        githubPush()
    ])
    disableConcurrentBuilds()
}
```

## Step 2: Configure GitHub Webhook

### Method 1: Using GitHub Webhook (Recommended)

1. **Go to GitHub Repository**:
   - Navigate to `https://github.com/aadarsh0507/greetings-aph`
   - Click **Settings** tab
   - Click **Webhooks** in the left sidebar

2. **Add Webhook**:
   - Click **Add webhook**
   - **Payload URL**: `http://103.102.85.4:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Secret**: (leave empty)
   - **Which events**: Select "Just the push event"
   - **Active**: ✅ Checked
   - Click **Add webhook**

3. **Verify Webhook**:
   - Check webhook delivery status
   - Look for green checkmarks indicating successful delivery

### Method 2: Using Jenkins UI Configuration

1. **Go to Jenkins Job**:
   - Navigate to `http://103.102.85.4:8080/job/greetings-aph/`
   - Click **Configure**

2. **Build Triggers Section**:
   - Check **GitHub hook trigger for GITScm polling**
   - Save the configuration

## Step 3: Test Auto-Trigger

### Test 1: Manual Push
```bash
# Make a small change
echo "# Test auto-trigger" >> README.md
git add README.md
git commit -m "Test auto-trigger"
git push origin features
```

### Test 2: Check Jenkins Dashboard
- Go to Jenkins dashboard
- Look for new build starting automatically
- Check build logs for trigger information

## Step 4: Troubleshooting Common Issues

### Issue 1: Webhook Not Delivering
**Symptoms**: No builds triggered on push

**Solutions**:
1. Check webhook delivery status in GitHub
2. Verify Jenkins server is accessible from GitHub
3. Check Jenkins logs for webhook errors
4. Ensure webhook URL is correct: `http://103.102.85.4:8080/github-webhook/`

### Issue 2: Jenkins Not Receiving Webhooks
**Symptoms**: Webhook shows delivery but Jenkins doesn't start builds

**Solutions**:
1. Check Jenkins system logs
2. Verify GitHub plugin is installed
3. Check Jenkins security settings
4. Ensure webhook trigger is enabled in job configuration

### Issue 3: Build Triggers But Fails
**Symptoms**: Build starts but fails immediately

**Solutions**:
1. Check Jenkinsfile syntax
2. Verify all required plugins are installed
3. Check Jenkins system configuration
4. Review build logs for specific errors

## Step 5: Alternative Trigger Methods

### Method 1: Polling SCM
Add to Jenkinsfile:
```groovy
triggers {
    pollSCM('H/5 * * * *') // Poll every 5 minutes
}
```

### Method 2: Manual Trigger
- Go to Jenkins job page
- Click **Build Now** button
- This will trigger the pipeline manually

### Method 3: GitHub Actions Integration
Create `.github/workflows/jenkins-trigger.yml`:
```yaml
name: Trigger Jenkins Build
on:
  push:
    branches: [ main, features ]
jobs:
  trigger:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Jenkins
        run: |
          curl -X POST "http://103.102.85.4:8080/job/greetings-aph/build" \
            --user "username:api-token"
```

## Step 6: Verify Configuration

### Check Jenkins Plugins
Ensure these plugins are installed:
- ✅ GitHub Plugin
- ✅ GitHub Branch Source Plugin
- ✅ Pipeline Plugin
- ✅ GitHub Authentication Plugin

### Check Jenkins System Configuration
1. Go to Jenkins → Manage Jenkins → Configure System
2. Check GitHub configuration
3. Verify webhook endpoint is accessible

### Check Job Configuration
1. Go to job → Configure
2. Check "Build Triggers" section
3. Verify "GitHub hook trigger for GITScm polling" is checked

## Step 7: Debug Commands

### Check Webhook Delivery
```bash
# Check webhook delivery logs in GitHub
# Go to repository → Settings → Webhooks → Click on webhook → Recent Deliveries
```

### Check Jenkins Logs
```bash
# Check Jenkins system logs
# Go to Jenkins → Manage Jenkins → System Log
# Look for webhook-related entries
```

### Test Webhook Manually
```bash
# Test webhook endpoint
curl -X POST http://103.102.85.4:8080/github-webhook/ \
  -H "Content-Type: application/json" \
  -d '{"ref":"refs/heads/features"}'
```

## Quick Fixes

### Fix 1: Recreate Webhook
1. Delete existing webhook in GitHub
2. Create new webhook with correct URL
3. Test with a small push

### Fix 2: Restart Jenkins
1. Go to Jenkins → Manage Jenkins → Restart
2. Wait for restart to complete
3. Test webhook again

### Fix 3: Check Firewall
1. Ensure port 8080 is accessible
2. Check if firewall is blocking webhook requests
3. Verify Jenkins server is reachable from GitHub

## Success Indicators

When auto-trigger is working correctly:
- ✅ New builds start automatically on code push
- ✅ Build logs show "Started by GitHub push"
- ✅ Webhook delivery shows success in GitHub
- ✅ No manual intervention required

## Contact Support

If issues persist:
1. Check Jenkins system logs for detailed error messages
2. Verify GitHub webhook delivery status
3. Test manual build trigger first
4. Check Jenkins plugin versions and compatibility
