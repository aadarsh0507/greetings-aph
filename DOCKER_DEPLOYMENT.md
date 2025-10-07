# 🐳 Docker Deployment Guide for APH-Greetings

This guide explains how to build, deploy, and publish the APH-Greetings application as a Docker image to GitHub Container Registry.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Building the Docker Image](#building-the-docker-image)
- [Running with Docker Compose](#running-with-docker-compose)
- [GitHub Container Registry Setup](#github-container-registry-setup)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

- Docker Engine 20.10+ and Docker Compose 2.0+
- GitHub account with Container Registry enabled
- MSSQL Server database (for patient data)
- WhatsApp API credentials

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/APH-Grettings.git
cd APH-Grettings
```

### 2. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp env.example .env
```

Edit `.env` with your actual credentials:

```env
# MSSQL Configuration
MSSQL_SERVER=your-server.database.windows.net
MSSQL_DATABASE=your-database
MSSQL_USER=your-username
MSSQL_PASSWORD=your-password

# WhatsApp API
WHATSAPP_API_URL=https://your-whatsapp-api.com
WHATSAPP_API_KEY=your-api-key

# JWT Secret (generate a secure random string)
JWT_SECRET=your-secure-jwt-secret-key
```

### 3. Run with Docker Compose

```bash
docker-compose up -d
```

The application will be available at:
- **Frontend & API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🏗️ Building the Docker Image

### Local Build

Build the image locally:

```bash
docker build -t aph-greetings:latest .
```

### Build for Multiple Platforms

```bash
docker buildx build --platform linux/amd64,linux/arm64 -t aph-greetings:latest .
```

### Run the Built Image

```bash
docker run -d \
  -p 5000:5000 \
  --env-file .env \
  --name aph-greetings \
  aph-greetings:latest
```

## 📦 GitHub Container Registry Setup

### Step 1: Enable GitHub Container Registry

1. Go to your GitHub repository settings
2. Navigate to **Settings** → **Actions** → **General**
3. Under "Workflow permissions", select **Read and write permissions**
4. Click **Save**

### Step 2: Automatic Publishing via GitHub Actions

The image is automatically built and published when you:

1. **Push to main/master branch**:
   ```bash
   git add .
   git commit -m "Update application"
   git push origin main
   ```

2. **Create a release tag**:
   ```bash
   git tag -a v1.0.0 -m "Release version 1.0.0"
   git push origin v1.0.0
   ```

The GitHub Actions workflow (`.github/workflows/docker-publish.yml`) will:
- Build the Docker image
- Run tests (if configured)
- Push to `ghcr.io/yourusername/aph-grettings`
- Tag with version, branch name, and `latest`

### Step 3: Pull the Published Image

The image will be available at:

```
ghcr.io/yourusername/aph-grettings:latest
```

To pull and run:

```bash
# Login to GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Pull the image
docker pull ghcr.io/yourusername/aph-grettings:latest

# Run the image
docker run -d \
  -p 5000:5000 \
  --env-file .env \
  --name aph-greetings \
  ghcr.io/yourusername/aph-grettings:latest
```

### Step 4: Make Package Public (Optional)

By default, GitHub packages are private. To make it public:

1. Go to your GitHub repository
2. Click on **Packages** in the right sidebar
3. Click on your package name (`aph-grettings`)
4. Click **Package settings**
5. Scroll down to **Danger Zone**
6. Click **Change visibility** → **Public**

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MSSQL_SERVER` | MSSQL Server hostname | `server.database.windows.net` |
| `MSSQL_DATABASE` | Database name | `PatientDB` |
| `MSSQL_USER` | Database username | `admin` |
| `MSSQL_PASSWORD` | Database password | `SecureP@ssw0rd` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://admin:pass@mongodb:27017/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `random-secure-string` |
| `WHATSAPP_API_URL` | WhatsApp API endpoint | `https://api.whatsapp.com` |
| `WHATSAPP_API_KEY` | WhatsApp API key | `your-api-key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Application port | `5000` |
| `CORS_ORIGIN` | CORS allowed origins | `*` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `JWT_EXPIRE` | JWT token expiry | `7d` |

## 🐳 Docker Compose Services

The `docker-compose.yml` file includes:

### 1. MongoDB Service
- **Container**: `aph-greetings-mongodb`
- **Port**: `27017`
- **Purpose**: Stores user accounts and application data
- **Health Check**: MongoDB ping command

### 2. Application Service
- **Container**: `aph-greetings-app`
- **Port**: `5000`
- **Purpose**: Serves both frontend and backend API
- **Health Check**: API health endpoint

## 🔍 Monitoring and Logs

### View Application Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mongodb
```

### Check Container Status

```bash
docker-compose ps
```

### Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Birthday Greeting API is running",
  "timestamp": "2025-10-01T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

## 🛠️ Troubleshooting

### Issue: Container Won't Start

**Check logs**:
```bash
docker-compose logs app
```

**Common causes**:
- Missing environment variables
- Database connection failure
- Port already in use

### Issue: Frontend Not Loading

**Verify frontend files**:
```bash
docker exec -it aph-greetings-app ls -la /app/frontend/dist
```

**Rebuild if needed**:
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Database Connection Failed

**Check MongoDB**:
```bash
docker-compose logs mongodb
docker exec -it aph-greetings-mongodb mongosh --eval "db.adminCommand('ping')"
```

**Check MSSQL connectivity**:
```bash
docker exec -it aph-greetings-app node -e "
const sql = require('mssql');
const config = {
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  options: { encrypt: true }
};
sql.connect(config).then(() => {
  console.log('Connected to MSSQL');
  process.exit(0);
}).catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
"
```

### Issue: GitHub Actions Build Fails

**Check workflow logs**:
1. Go to your repository on GitHub
2. Click **Actions** tab
3. Click on the failed workflow run
4. Review the error logs

**Common fixes**:
- Ensure repository has write permissions for packages
- Check Dockerfile syntax
- Verify all paths are correct

## 🔄 Updating the Application

### Pull Latest Changes

```bash
git pull origin main
docker-compose pull
docker-compose up -d
```

### Rebuild After Code Changes

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 🧹 Cleanup

### Stop and Remove Containers

```bash
docker-compose down
```

### Remove with Volumes

```bash
docker-compose down -v
```

### Remove Images

```bash
docker rmi ghcr.io/yourusername/aph-grettings:latest
docker rmi aph-greetings:latest
```

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)

## 🤝 Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review application logs for errors

---

**Happy Deploying! 🚀**

