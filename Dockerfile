# Multi-stage Dockerfile for APH-Greetings Application
# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/package*.json ./

# Install ALL dependencies (including devDependencies needed for build)
RUN npm ci

# Copy frontend source code
COPY frontend/ ./

# Set environment variables for build
ARG VITE_API_BASE_URL=http://localhost:5000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the frontend
RUN npm run build

# Stage 2: Build Backend and Final Image
FROM node:18-alpine

WORKDIR /app

# Install production dependencies
RUN apk add --no-cache tini

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
WORKDIR /app/backend
RUN npm ci --only=production

# Copy backend source code
COPY backend/ ./

# Copy built frontend from previous stage
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist

# Install serve globally for serving frontend
RUN npm install -g serve

# Create a startup script to run both services
WORKDIR /app
RUN echo '#!/bin/sh' > start.sh && \
    echo 'set -e' >> start.sh && \
    echo '# Start backend in background' >> start.sh && \
    echo 'cd /app/backend && node server.js &' >> start.sh && \
    echo 'BACKEND_PID=$!' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Wait a moment for backend to start' >> start.sh && \
    echo 'sleep 5' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Start frontend on port 5173' >> start.sh && \
    echo 'cd /app/frontend/dist && serve -s . -l 5173 &' >> start.sh && \
    echo 'FRONTEND_PID=$!' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Function to handle shutdown' >> start.sh && \
    echo 'cleanup() {' >> start.sh && \
    echo '    echo "Shutting down services..."' >> start.sh && \
    echo '    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true' >> start.sh && \
    echo '    exit 0' >> start.sh && \
    echo '}' >> start.sh && \
    echo 'trap cleanup SIGTERM SIGINT' >> start.sh && \
    echo '' >> start.sh && \
    echo '# Wait for both processes' >> start.sh && \
    echo 'wait $BACKEND_PID $FRONTEND_PID' >> start.sh && \
    chmod +x start.sh

# Expose ports
# 5000 for backend API
# 5173 for frontend (served separately)
EXPOSE 5000 5173

# Use tini to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Start the application
CMD ["/app/start.sh"]

