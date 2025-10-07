# Birthday Greeting Backend API

A clean, modular Express.js backend API following MVC architecture for managing birthday greetings with MongoDB integration.

## 🏗️ Project Structure

```
backend/
├── config/
│   └── database.js          # Database connection configuration
├── controllers/
│   ├── userController.js    # User business logic
│   └── templateController.js # Template business logic
├── middleware/
│   ├── errorHandler.js      # Global error handling
│   └── notFound.js          # 404 handler
├── models/
│   ├── User.js              # User data model
│   └── Template.js          # Template data model
├── routes/
│   ├── users.js             # User API routes
│   └── templates.js         # Template API routes
├── scripts/
│   └── seedData.js          # Sample data seeding
├── .env                     # Environment variables
├── package.json             # Dependencies and scripts
├── server.js                # Main application entry point
└── README.md                # Documentation
```

## ✨ Features

- **MVC Architecture**: Clean separation of concerns
- **Modular Design**: Organized controllers, models, routes, and middleware
- **Database Integration**: MongoDB with Mongoose ODM
- **Security**: Helmet, CORS, Rate Limiting
- **Error Handling**: Centralized error management
- **Validation**: Input validation and sanitization
- **Sample Data**: Automated seeding functionality

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual values
   # See .env.example for all required variables
   ```
   
   **Required Environment Variables:**
   - `MONGO_URI`: MongoDB connection string
   - `MSSQL_USER`, `MSSQL_PASS`, `MSSQL_SERVER`, `MSSQL_DATABASE`: MSSQL database credentials
   - `WA_API_BASE`, `LICENSE_NUMBER`, `API_KEY`: WhatsApp API configuration
   - `JWT_SECRET`: Secret key for JWT tokens
   - `PORT`: Server port (default: 5000)

3. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

4. **Seed sample data** (optional):
   ```bash
   npm run seed
   ```

5. **Start the server**:
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Users
- `GET /api/users` - Get all users (with pagination & search)
- `GET /api/users/today` - Get users with birthday today
- `GET /api/users/tomorrow` - Get users with birthday tomorrow
- `GET /api/users/upcoming` - Get users with upcoming birthdays
- `GET /api/users/:id` - Get specific user
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Soft delete user
- `POST /api/users/bulk` - Create multiple users

### Templates
- `GET /api/templates` - Get all templates
- `GET /api/templates/category/:category` - Get templates by category
- `GET /api/templates/popular` - Get most used templates
- `GET /api/templates/:id` - Get specific template
- `POST /api/templates` - Create new template
- `PUT /api/templates/:id` - Update template
- `DELETE /api/templates/:id` - Soft delete template
- `POST /api/templates/:id/use` - Increment usage count
- `POST /api/templates/:id/generate` - Generate personalized message
- `POST /api/templates/bulk` - Create multiple templates

### System
- `GET /api/health` - Health check endpoint
- `GET /` - API information

## 🗃️ Data Models

### User Model
```javascript
{
  name: String (required, 2-50 chars),
  mobile: String (required, unique),
  dob: Date (required),
  email: String (optional),
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Template Model
```javascript
{
  name: String (required, 2-100 chars),
  message: String (required, 10-500 chars),
  category: String (enum: ['birthday', 'anniversary', 'holiday', 'custom']),
  isActive: Boolean (default: true),
  usageCount: Number (default: 0),
  lastUsed: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## 🔧 Configuration

### Environment Variables
```env
MONGO_URI=mongodb://localhost:27017/birthday-greeting-app
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-super-secret-jwt-key
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🧪 Testing API

### Using curl
```bash
# Health check
curl http://localhost:5000/api/health

# Get today's birthdays
curl http://localhost:5000/api/users/today

# Get templates
curl http://localhost:5000/api/templates

# Create a user
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","mobile":"+1234567890","dob":"1990-01-01"}'

# Create a template
curl -X POST http://localhost:5000/api/templates \
  -H "Content-Type: application/json" \
  -d '{"name":"Birthday Wish","message":"Happy Birthday {name}! 🎉"}'
```

## 📁 Architecture Details

### Controllers
- **userController.js**: Handles all user-related business logic
- **templateController.js**: Manages template operations and message generation

### Models
- **User.js**: User schema with birthday-specific static methods
- **Template.js**: Template schema with usage tracking and validation

### Routes
- **users.js**: Clean route definitions that delegate to controllers
- **templates.js**: Template routes with proper HTTP methods

### Middleware
- **errorHandler.js**: Centralized error handling with proper status codes
- **notFound.js**: 404 handler for undefined routes

### Configuration
- **database.js**: MongoDB connection management with event handling

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Data sanitization
- **Error Handling**: Secure error responses

## 🚀 Deployment

For production deployment:

1. Set `NODE_ENV=production`
2. Use MongoDB Atlas or production MongoDB
3. Configure proper CORS origins
4. Set secure environment variables
5. Use PM2 or similar process manager

## 📄 License

MIT License