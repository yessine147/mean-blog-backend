# MEAN Stack Collaborative Blog Platform

A modern, real-time collaborative blog platform built with the MEAN stack, featuring microservices architecture, real-time notifications, and role-based access control.

## 🏗️ Architecture Overview

This project follows a **microservices architecture** with separate services for different concerns:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Service  │    │ Article Service │    │Notification Svc │
│   (Port 3001)   │    │   (Port 3002)   │    │   (Port 3003)   │
│                 │    │                 │    │                 │
│ • Authentication│    │ • Articles CRUD │    │ • Real-time     │
│ • User Management│    │ • Comments      │    │ • Notifications │
│ • JWT Tokens    │    │ • Search        │    │ • Socket.IO     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Databases     │
                    │                 │
                    │ • MongoDB       │
                    │ • Redis         │
                    └─────────────────┘
```

## 🛠️ Technology Stack

### Backend Services
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - Primary database
- **Redis** - Caching and pub/sub
- **Socket.IO** - Real-time communication
- **JWT** - Authentication tokens
- **Zod** - Schema validation
- **Swagger** - API documentation

### Frontend (Angular)
- **Angular 17** - Frontend framework
- **Angular Material** - UI components
- **RxJS** - Reactive programming
- **SCSS** - Styling
- **Socket.IO Client** - Real-time features

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for development)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd mean-blog-backend
```

### 2. Environment Setup
Create environment files for each service:

```bash
# Copy example files
cp user-service/.env.example user-service/.env
cp article-service/.env.example article-service/.env
cp notification-service/.env.example notification-service/.env
```

Update the `.env` files with your actual values:
- Change `your-super-secret-jwt-key-here` to a strong secret
- Change `your-service-api-key-here` to a secure API key

### 3. Run with Docker Compose
```bash
# Start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 4. Access the Services
- **User Service API**: http://localhost:3001
- **Article Service API**: http://localhost:3002
- **Notification Service API**: http://localhost:3003
- **Swagger Documentation**: 
  - http://localhost:3001/docs (User Service)
  - http://localhost:3002/docs (Article Service)
  - http://localhost:3003/docs (Notification Service)

## 📁 Project Structure

```
mean-blog-backend/
├── user-service/              # Authentication & User Management
│   ├── src/
│   │   ├── config/           # Environment & Database config
│   │   ├── modules/user/     # User routes, models, services
│   │   ├── middlewares/      # Auth & error handling
│   │   └── utils/           # JWT, password utilities
│   ├── Dockerfile
│   └── package.json
├── article-service/           # Articles & Comments Management
│   ├── src/
│   │   ├── config/
│   │   ├── modules/
│   │   │   ├── article/     # Article CRUD operations
│   │   │   └── comment/     # Comment system with nesting
│   │   ├── middlewares/     # Auth & role-based access
│   │   └── utils/           # Notification client
│   ├── Dockerfile
│   └── package.json
├── notification-service/      # Real-time Notifications
│   ├── src/
│   │   ├── config/
│   │   ├── modules/
│   │   │   ├── notifications/ # Notification CRUD
│   │   │   ├── events/       # Event handling
│   │   │   └── gateway/      # Socket.IO gateway
│   │   └── middlewares/
│   ├── Dockerfile
│   └── package.json
└── docker-compose.yml        # Multi-service orchestration
```

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full access to all resources
- **Editor**: Can edit/delete any article
- **Author**: Can create/edit/delete own articles
- **Reader**: Can only read and comment

### JWT Token System
- **Access Token**: Short-lived (7 hours) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal
- **Service API Key**: For inter-service communication

## 🔄 Real-time Features

### Socket.IO Integration
- **Article Rooms**: Users viewing the same article get real-time updates
- **User Rooms**: Personal notifications and updates
- **Comment Updates**: New comments appear instantly
- **Notification System**: Real-time notification delivery

### Redis Pub/Sub
- **Event Broadcasting**: Comment events across services
- **User Tracking**: Online user management
- **Scalability**: Horizontal scaling support

## 📊 API Documentation

Each service provides comprehensive Swagger documentation:

### User Service Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh tokens
- `GET /api/auth/profile` - Get user profile

### Article Service Endpoints
- `GET /api/articles` - List articles with search
- `POST /api/articles` - Create article
- `GET /api/articles/:id` - Get article details
- `PUT /api/articles/:id` - Update article
- `DELETE /api/articles/:id` - Delete article
- `POST /api/articles/:id/comments` - Add comment
- `DELETE /api/comments/:id` - Delete comment

### Notification Service Endpoints
- `GET /api/notifications` - Get user notifications
- `PATCH /api/notifications/:id/read` - Mark as read
- `PATCH /api/notifications/mark-all-read` - Mark all as read
- `POST /api/notifications/service/create` - Service-to-service notifications

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: API abuse prevention
- **CORS Configuration**: Cross-origin request control
- **Helmet**: Security headers
- **Input Validation**: Zod schema validation
- **Role-based Access**: Granular permissions

## 🚀 Development

### Running Individual Services
```bash
# User Service
cd user-service && npm run dev

# Article Service
cd article-service && npm run dev

# Notification Service
cd notification-service && npm run dev
```

### Database Setup
MongoDB and Redis are automatically configured via Docker Compose:
- **MongoDB**: Port 27017
- **Redis**: Port 6379

### Environment Variables

#### User Service
```env
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://localhost:27017/mean-blog-users
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=*
ACCESS_TOKEN_EXPIRES_IN=7h
REFRESH_TOKEN_EXPIRES_IN=7d
```

#### Article Service
```env
NODE_ENV=development
PORT=3002
MONGO_URI=mongodb://localhost:27017/mean-blog-articles
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=*
NOTIFICATION_SERVICE_URL=http://localhost:3003
SERVICE_API_KEY=your-service-api-key
```

#### Notification Service
```env
NODE_ENV=development
PORT=3003
MONGO_URI=mongodb://localhost:27017/mean-blog-notifications
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=*
SERVICE_API_KEY=your-service-api-key
```

## 🧪 Testing

### API Testing
Use the Swagger UI at each service's `/docs` endpoint for interactive testing.

### Load Testing
```bash
# Example with curl
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📈 Monitoring & Logging

- **Health Checks**: `/health` endpoint on each service
- **Structured Logging**: Morgan for HTTP request logging
- **Error Handling**: Centralized error middleware
- **Real-time Monitoring**: Socket.IO connection tracking

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3001-3003, 27017, and 6379 are available
2. **Docker Issues**: Run `docker-compose down && docker-compose up --build`
3. **Database Connection**: Check MongoDB and Redis are running
4. **Environment Variables**: Verify all required env vars are set

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development docker-compose up
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the API documentation at `/docs` endpoints
- Review the logs: `docker-compose logs [service-name]`
- Open an issue in the repository

---

**Built with ❤️ using the MEAN stack and modern microservices architecture**