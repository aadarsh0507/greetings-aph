const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const connectDB = require('./config/database');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Logging middleware
app.use(morgan('combined'));

// CORS middleware - Allow all origins for development
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



// Import routes
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const sendWhatsAppRoutes = require('./routes/sendWhatsApp');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/send-whatsapp', sendWhatsAppRoutes);

// API Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: '🎉 APH Greetings API Server',
    status: 'Running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      sendWhatsApp: '/api/send-whatsapp'
    },
    documentation: 'See API_DOCUMENTATION.md for details'
  });
});


// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎉 APH Greetings API Server',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      users: '/api/users',
      sendWhatsApp: '/api/send-whatsapp'
    },
    documentation: 'See API_DOCUMENTATION.md for details'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Birthday Greeting API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Serve static files from frontend build (for production/Docker with single port)
// When using separate ports, frontend is served independently on port 5173
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (require('fs').existsSync(frontendDistPath) && process.env.SERVE_FRONTEND !== 'false') {
  console.log('📦 Serving frontend static files from:', frontendDistPath);
  app.use(express.static(frontendDistPath));
  
  // Handle client-side routing - serve index.html for all non-API routes
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next(); // Let API routes handle themselves
    }
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  console.log('📡 Backend API only mode - Frontend served separately');
}

// Error handling middleware
app.use(errorHandler);

// 404 handler (only for API routes now)
app.use('/api/*', notFound);

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    await connectDB();
    
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(60));
      console.log('🎉 APH GREETINGS SERVER STARTED SUCCESSFULLY! 🎉');
      console.log('='.repeat(60));
      console.log(`🚀 Server running on port: ${PORT}`);
      console.log(`🌐 Server URL: http://localhost:${PORT}`);
      console.log(`📱 API Base URL: http://localhost:${PORT}/api`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth Endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`👥 User Endpoints: http://localhost:${PORT}/api/users`);
      console.log(`📱 WhatsApp Endpoints: http://localhost:${PORT}/api/send-whatsapp`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Database: MongoDB`);
      console.log('='.repeat(60));
      console.log('✅ Server is ready to accept connections!\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;