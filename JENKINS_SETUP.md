# 🔧 Jenkins Pipeline Setup Guide

This guide explains how to set up Jenkins to automatically build and push Docker images to GitHub Container Registry.

## 📋 Prerequisites

- Jenkins server installed and running
- Docker installed on Jenkins server
- GitHub account with access to Container Registry
- GitHub Personal Access Token with package write permissions

---

## 🚀 Jenkins Installation (If Not Installed)

### Windows:

1. **Download Jenkins**: https://www.jenkins.io/download/
2. **Install Jenkins WAR**: `java -jar jenkins.war`
3. **Access Jenkins**: http://localhost:8080
4. **Install suggested plugins**
5. **Create admin user**

### Docker (Recommended):

```bash
docker run -d \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  --name jenkins \
  jenkins/jenkins:lts
```

---

## 🔐 Step 1: Create GitHub Personal Access Token

1. **Go to**: https://github.com/settings/tokens
2. **Click**: "Generate new token (classic)"
3. **Token name**: `Jenkins Docker Build`
4. **Select scopes**:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `write:packages` (Upload packages to GitHub Package Registry)
   - ✅ `read:packages` (Download packages from GitHub Package Registry)
   - ✅ `delete:packages` (Delete packages from GitHub Package Registry)
5. **Click**: "Generate token"
6. **Copy the token** (you won't see it again!)

---

## 🔧 Step 2: Configure Jenkins Credentials

1. **Go to Jenkins**: http://localhost:8080
2. **Navigate**: Manage Jenkins → Manage Credentials
3. **Click**: (global) → Add Credentials
4. **Configure**:
   - **Kind**: Secret text
   - **Secret**: [Paste your GitHub token]
   - **ID**: `github-token`
   - **Description**: GitHub Container Registry Token
5. **Click**: OK

---

## 📝 Step 3: Create Jenkins Pipeline Job

1. **Click**: "New Item"
2. **Enter name**: `APH-Greetings-Docker-Build`
3. **Select**: "Pipeline"
4. **Click**: OK

### Configure Pipeline:

1. **General Tab**:
   - ✅ GitHub project: `https://github.com/aadarsh0507/greetings-aph`
   - ✅ Discard old builds: Keep last 10 builds

2. **Build Triggers**:
   - ✅ GitHub hook trigger for GITScm polling
   - ✅ Poll SCM: `H/5 * * * *` (every 5 minutes)

3. **Pipeline Section**:
   - **Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: `https://github.com/aadarsh0507/greetings-aph.git`
   - **Credentials**: Add GitHub credentials (username + token)
   - **Branch Specifier**: `*/features` or `*/main`
   - **Script Path**: `Jenkinsfile`

4. **Click**: Save

---

## 🔗 Step 4: Configure GitHub Webhook (Optional)

For automatic builds on push:

1. **Go to**: https://github.com/aadarsh0507/greetings-aph/settings/hooks
2. **Click**: "Add webhook"
3. **Payload URL**: `http://your-jenkins-url:8080/github-webhook/`
4. **Content type**: `application/json`
5. **Events**: Just the push event
6. **Click**: Add webhook

---

## 🎯 Step 5: Install Required Jenkins Plugins

1. **Go to**: Manage Jenkins → Manage Plugins
2. **Install these plugins**:
   - Docker Pipeline
   - Docker
   - GitHub Integration
   - Pipeline
   - Credentials Binding

3. **Restart Jenkins** after installation

---

## 🐳 Step 6: Configure Docker in Jenkins

### On Jenkins Server:

1. **Add Jenkins user to docker group**:
   ```bash
   sudo usermod -aG docker jenkins
   sudo systemctl restart jenkins
   ```

2. **Verify Docker access**:
   ```bash
   sudo -u jenkins docker ps
   ```

---

## 🚀 Running the Pipeline

### Manual Trigger:

1. **Go to**: Jenkins Dashboard → APH-Greetings-Docker-Build
2. **Click**: "Build Now"
3. **Monitor**: Console Output

### Automatic Trigger:

- Push code to GitHub → Webhook triggers Jenkins → Pipeline runs automatically

---

## 📊 Pipeline Stages

The Jenkinsfile includes these stages:

1. **Checkout** → Clone repository
2. **Code Quality Check** → Install dependencies and run linters
3. **Run Tests** → Execute test suites
4. **Build Docker Image** → Create multi-platform Docker image
5. **Security Scan** → Check for vulnerabilities
6. **Push to GitHub Container Registry** → Publish image
7. **Cleanup** → Remove temporary files

---

## 🔍 Environment Variables in Jenkinsfile

You can customize these in the Jenkinsfile:

| Variable | Description | Default |
|----------|-------------|---------|
| `REGISTRY` | Container registry URL | `ghcr.io` |
| `IMAGE_NAME` | Docker image name | `aadarsh0507/greetings-aph` |
| `GITHUB_TOKEN` | GitHub PAT for authentication | From credentials |
| `IMAGE_TAG` | Docker image tag | `{branch}-{build-number}` |

---

## 🎯 Expected Output

After successful pipeline execution:

```
✅ Pipeline completed successfully!
Docker image available at: ghcr.io/aadarsh0507/greetings-aph:features-42
Pull command: docker pull ghcr.io/aadarsh0507/greetings-aph:features-42
```

Images will be tagged as:
- `ghcr.io/aadarsh0507/greetings-aph:features-{build-number}`
- `ghcr.io/aadarsh0507/greetings-aph:features`
- `ghcr.io/aadarsh0507/greetings-aph:latest` (for main branch only)

---

## 🛠️ Troubleshooting

### Issue: Docker permission denied

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### Issue: GitHub token authentication failed

- Verify token has `write:packages` permission
- Check credential ID is exactly `github-token`
- Regenerate token if expired

### Issue: Build fails

- Check Jenkins console output for specific error
- Verify Dockerfile syntax
- Check all paths are correct

---

## 🔄 Workflow Comparison

| Feature | GitHub Actions | Jenkins |
|---------|---------------|---------|
| Trigger | Push to GitHub | Manual/Webhook |
| Environment | GitHub Cloud | Your Server |
| Cost | Free (public repos) | Self-hosted (free) |
| Control | Limited | Full control |
| Setup | Automatic | Manual configuration |

---

## 📚 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Jenkins Docker Pipeline](https://www.jenkins.io/doc/book/pipeline/docker/)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

---

**Happy Building! 🚀**

