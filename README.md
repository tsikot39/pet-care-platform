# Pet Care Platform - API & Dashboard

## 📖 About The Project

The Pet Care Platform is a comprehensive web application that connects pet owners with professional pet sitters and care providers. This platform serves as a marketplace where pet owners can find trusted caregivers for their beloved pets, while pet sitters can offer their services and build their business.

### What It Does

- **For Pet Owners:** Find and book reliable pet care services, manage pet profiles, track service history, and communicate with pet sitters
- **For Pet Sitters:** Create service listings, manage bookings, build client relationships, and grow their pet care business
- **For Both:** Secure authentication, real-time booking management, photo sharing, and comprehensive dashboard analytics

### Key Highlights

This full-stack application demonstrates modern web development practices with a robust Node.js backend API, MongoDB database integration, JWT authentication, and a clean frontend interface. It's designed to handle real-world pet care business operations with scalability and security in mind.

## Features

### 🔐 Authentication & User Management

- User registration and login with JWT authentication
- Role-based access control (Pet Owners and Pet Sitters)
- Profile management with role-specific fields
- Password hashing with bcrypt
- Enhanced validation with real-time feedback
- Password strength indicator
- Account deactivation and password reset functionality

### 🐕 Pet Management (For Owners)

- Create, read, update, and delete pet profiles
- **Photo upload functionality** with multiple image support
- Detailed pet information (species, breed, age, weight, gender, color, special needs)
- **Vaccination and microchip tracking**
- Medical information tracking (medications, allergies, vet info)
- Emergency contact information
- **Instant UI updates** for pet deletion without page refresh
- Pet statistics and dashboard

### 🏠 Service Listings (For Sitters)

- Create and manage service listings
- Multiple service types (dog walking, pet sitting, grooming, etc.)
- Pricing and availability management
- Location-based services
- Service image uploads
- **Enhanced error messages** with descriptive feedback
- Advanced search and filtering

### 📅 Booking System

- Pet owners can browse and book services
- Real-time availability checking
- **Full booking lifecycle management**:
  - Pending → Confirmed → In Progress → Completed
  - **Sitter approval system** with action buttons
  - **Owner cancellation** capabilities
- Automatic pricing calculation
- **Enhanced booking interface** with color-coded status
- Check-in/check-out functionality
- Service updates with photos
- **Helper functions** for easy ID selection
- Cancellation policy and refund calculation

### 📊 Statistics & Analytics

- Dashboard statistics for both owners and sitters
- Booking analytics
- Service performance metrics
- Pet care insights

### 🎨 Modern UI/UX

- **Poppins font** throughout the entire application
- **Responsive design** with proper spacing and margins
- **Enhanced visual feedback** with animations and transitions
- **Color-coded status indicators** for bookings
- **Improved form validation** with real-time error messages
- **Professional layout** with hover effects and shadows

## 🛠️ Technologies Used

### Backend Technologies

- **Runtime:** Node.js (v16+)
- **Framework:** Express.js - Fast, unopinionated web framework
- **Database:** MongoDB with Mongoose ODM - NoSQL document database
- **Authentication:** JSON Web Tokens (JWT) - Stateless authentication
- **Password Security:** bcrypt.js - Password hashing and salting
- **File Handling:** Multer - Multipart form data and file uploads
- **Validation:** Joi - Object schema validation
- **Security:** Helmet, CORS, Rate Limiting - Security middleware
- **Environment:** dotenv - Environment variable management
- **Testing:** Jest - JavaScript testing framework with comprehensive test coverage
- **API Documentation:** Swagger UI - Interactive API documentation and testing interface
- **Logging:** Winston - Professional logging with multiple transports and log levels
- **HTTP Logging:** Morgan - HTTP request logging middleware for development and production

### Frontend Technologies

- **HTML5** - Modern semantic markup with enhanced structure
- **CSS3** - Custom styling with Grid, Flexbox, and responsive design
- **Google Fonts (Poppins)** - Modern typography throughout the application
- **Vanilla JavaScript (ES6+)** - Modern JavaScript with enhanced functionality
- **Fetch API** - RESTful API communication with improved error handling
- **Real-time Validation** - Client-side form validation with instant feedback
- **Responsive Design** - Mobile-first approach with proper spacing
- **Interactive UI Elements** - Animations, transitions, and hover effects

### Development Tools

- **Environment:** Development and production configurations
- **Error Handling:** Comprehensive error middleware with Winston logging
- **File Organization:** Modular MVC architecture
- **API Design:** RESTful endpoints with proper HTTP methods
- **API Documentation:** Swagger/OpenAPI 3.0 with interactive testing interface
- **Testing Framework:** Jest with comprehensive unit and integration tests
- **Test Coverage:** Code coverage reporting with Istanbul
- **Logging:** Winston logger with file and console transports
- **HTTP Logging:** Morgan middleware for request/response logging

### Cloud & Deployment Ready

- **Database:** MongoDB Atlas cloud integration
- **File Storage:** Local uploads with cloud migration ready
- **Environment Configuration:** Production-ready environment variables

## Project Structure

```
pet-care-platform/
├── public/
│   ├── index.html           # Enhanced dashboard with modern UI
│   └── app.js               # Frontend JavaScript with booking management
├── src/
│   ├── __tests__/           # Unit and integration tests
│   │   ├── controllers/     # Controller test files
│   │   ├── utils/          # Utility function tests
│   │   └── setup.js        # Jest test setup configuration
│   ├── config/
│   │   ├── database.js      # MongoDB connection configuration
│   │   ├── logger.js        # Winston logger configuration
│   │   └── swagger.js       # Swagger/OpenAPI configuration
│   ├── controllers/
│   │   ├── authController.js    # Authentication logic
│   │   ├── petController.js     # Pet management with file upload
│   │   ├── serviceController.js # Service management with enhanced errors
│   │   └── bookingController.js # Booking lifecycle management
│   ├── middleware/
│   │   ├── authMiddleware.js    # Enhanced role-based access control
│   │   └── errorMiddleware.js   # Global error handling with Winston logging
│   ├── models/
│   │   ├── User.js              # User schema and model
│   │   ├── Pet.js               # Pet schema with photo support
│   │   ├── Service.js           # Service schema and model
│   │   └── Booking.js           # Booking schema with status management
│   ├── routes/
│   │   ├── authRoutes.js        # Authentication routes
│   │   ├── petRoutes.js         # Pet management routes
│   │   ├── serviceRoutes.js     # Service management routes
│   │   └── bookingRoutes.js     # Booking management routes
│   ├── utils/
│   │   ├── validation.js        # Enhanced Joi validation schemas
│   │   └── fileUpload.js        # File upload utilities
│   ├── app.js                   # Express app configuration with Swagger & Winston
│   └── server.js                # Server startup with enhanced logging
├── logs/                        # Winston log files directory
├── uploads/                     # File upload directory
├── .env                         # Environment configuration
├── .env.example                 # Environment template
├── package.json                 # Dependencies and scripts including Jest
├── jest.config.js               # Jest testing configuration
├── ENHANCEMENT_SUMMARY.md       # Summary of professional enhancements
└── README.md                    # This file
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pet-care-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and configure the following variables:

```env
# MongoDB connection string (MongoDB Atlas recommended)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pet-care-platform

# JWT Secret (use a strong, random string in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT Expiration
JWT_EXPIRES_IN=7d

# Server Port
PORT=8001

# Node Environment
NODE_ENV=development

# File Upload Settings
MAX_FILE_SIZE=5000000
UPLOAD_PATH=./uploads

# CORS Settings
CORS_ORIGIN=http://localhost:8001

# Email Settings (for future implementation)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
```

**Note:** The application is configured to run on port 8001 and uses MongoDB Atlas for cloud database hosting.

### 4. Database Setup

The application uses MongoDB Atlas (cloud database). No local MongoDB installation required.

### 5. Run the Application

**Development mode:**

```bash
node src/server.js
```

**With auto-restart (if nodemon is installed):**

```bash
npm run dev
```

**Run tests:**

```bash
npm test
```

**Run tests with coverage:**

```bash
npm run test:coverage
```

**Run tests in watch mode:**

```bash
npm run test:watch
```

The server will start on `http://localhost:8001` (or the port specified in your `.env` file).

### 6. Access the Application

- **API Health Check:** Visit `http://localhost:8001/health`
- **Dashboard:** Visit `http://localhost:8001` for the interactive testing dashboard
- **API Documentation:** Visit `http://localhost:8001/api-docs` for Swagger UI documentation
- **API Base URL:** `http://localhost:8001/api`

### 7. Testing & Documentation

- **Unit Tests:** Run `npm test` to execute the comprehensive test suite
- **Test Coverage:** Run `npm run test:coverage` to see code coverage reports
- **API Documentation:** Interactive API documentation available at `/api-docs`
- **Logs:** Application logs are stored in the `logs/` directory

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register a new user
- `POST /login` - Login user
- `GET /me` - Get current user profile
- `PUT /me` - Update user profile
- `PUT /updatePassword` - Update user password
- `POST /logout` - Logout user
- `DELETE /me` - Deactivate user account

### Pet Routes (`/api/pets`) - Owner Only

- `GET /` - Get all pets for the authenticated owner
- `POST /` - Create a new pet profile
- `GET /:id` - Get specific pet details
- `PUT /:id` - Update pet information
- `DELETE /:id` - Delete pet (soft delete)
- `DELETE /:id/photos/:photoIndex` - Delete specific pet photo
- `GET /stats` - Get pet statistics

### Service Routes (`/api/services`)

- `GET /` - Get all available services (public)
- `GET /search` - Advanced service search (public)
- `GET /:id` - Get specific service details (public)
- `GET /my/services` - Get sitter's services (sitter only)
- `POST /my` - Create new service (sitter only)
- `PUT /:id/manage` - Update service (sitter only)
- `DELETE /:id/manage` - Delete service (sitter only)
- `DELETE /:id/images/:imageIndex` - Delete service image (sitter only)
- `GET /my/stats` - Get service statistics (sitter only)

### Booking Routes (`/api/bookings`)

- `GET /` - Get all bookings for authenticated user
- `POST /` - Create new booking (owner only)
- `GET /:id` - Get specific booking details
- `PATCH /:id/status` - Update booking status
- `POST /:id/updates` - Add booking update (sitter only)
- `POST /:id/checkin` - Check in for booking (sitter only)
- `POST /:id/checkout` - Check out from booking (sitter only)
- `GET /stats` - Get booking statistics

## Request/Response Examples

### Register a New User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "owner",
  "phone": "+1234567890",
  "bio": "Pet lover and dog owner"
}
```

### Create a Pet Profile

```bash
POST /api/pets
Authorization: Bearer <jwt-token>
Content-Type: multipart/form-data

{
  "name": "Buddy",
  "species": "dog",
  "breed": "Golden Retriever",
  "age": 3,
  "weight": 30,
  "specialNeeds": "Requires daily medication",
  "photos": [file1, file2]
}
```

### Search Services

```bash
GET /api/services/search?city=Austin&serviceType=dog_walking&petType=dog&minPrice=20&maxPrice=50
```

### Create a Booking

```bash
POST /api/bookings
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "service": "service_id_here",
  "pet": "pet_id_here",
  "startDate": "2024-07-15T09:00:00.000Z",
  "endDate": "2024-07-15T17:00:00.000Z",
  "notes": "Please give medication at 2 PM",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1234567891",
    "relationship": "spouse"
  }
}
```

## Security Features

- **JWT Authentication:** Secure token-based authentication with proper expiration
- **Password Hashing:** bcrypt with salt rounds for secure password storage
- **Input Validation:** Comprehensive Joi validation schemas with detailed error messages
- **Role-based Access Control:** Enhanced middleware with context-aware error messages
- **File Upload Security:** Type validation, size limits, and secure file handling
- **CORS Protection:** Configurable cross-origin requests with proper headers
- **Rate Limiting:** Prevents API abuse and brute force attacks
- **Helmet Security:** Sets various HTTP security headers
- **Environment Variables:** Secure configuration management
- **Error Handling:** Prevents information leakage through proper error responses

## Error Handling

The API implements comprehensive error handling with enhanced user feedback:

- **Validation Errors:** Returns detailed validation error messages with field-specific feedback
- **Authentication Errors:** Clear authentication failure responses with helpful guidance
- **Authorization Errors:** Role-specific error messages (e.g., "Only sitters can create services")
- **Database Errors:** Handles MongoDB-specific errors with user-friendly messages
- **File Upload Errors:** Specific file upload error handling with size/type information
- **404 Errors:** Resource not found handling with context
- **500 Errors:** Internal server error handling with proper logging
- **Booking Errors:** Status transition validation with clear explanations
- **Real-time Validation:** Frontend validation with instant feedback
- **Context-aware Messages:** Different error messages based on user role and action

## Recent Enhancements & Features

### 🧪 Professional Development Features

- **Unit Testing:** Comprehensive Jest test suite with 80%+ code coverage
- **API Documentation:** Interactive Swagger UI documentation at `/api-docs`
- **Professional Logging:** Winston logger with structured logging and file output
- **HTTP Request Logging:** Morgan middleware for detailed request/response logging
- **Test Coverage Reports:** Istanbul coverage reporting with detailed metrics
- **Test Environment:** MongoDB Memory Server for isolated testing

### 🎨 UI/UX Improvements

- **Modern Typography**: Integrated Poppins font throughout the application
- **Responsive Design**: Enhanced spacing and margins for all screen sizes
- **Visual Feedback**: Added animations, transitions, and hover effects
- **Professional Layout**: Improved card styling with shadows and rounded corners

### 🔧 Booking System Enhancements

- **Complete Booking Lifecycle**: From pending to completed with proper status transitions
- **Sitter Approval Interface**: Action buttons for confirming/declining bookings
- **Color-coded Status**: Visual status indicators for easy identification
- **Helper Functions**: Easy pet and service ID selection with helper buttons
- **Real-time Updates**: Instant UI updates without page refresh

### 📋 Pet Management Improvements

- **Photo Upload**: Support for multiple pet photos with file validation
- **Enhanced Fields**: Added gender, color, vaccination, and microchip status
- **Instant Delete**: Immediate UI updates when deleting pets
- **Detailed Display**: Comprehensive pet information cards with all fields
- **Form Validation**: Real-time validation with descriptive error messages

### 🛠️ Technical Enhancements

- **Enhanced Error Handling**: Descriptive error messages for all API endpoints
- **Role-based Messaging**: Context-aware error messages based on user roles
- **Improved Validation**: Better Joi validation with detailed feedback
- **File Upload Security**: Comprehensive file type and size validation
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Professional Logging**: Winston integration with structured logging
- **Comprehensive Testing**: Jest test suite with mocking and coverage reporting
- **API Documentation**: Swagger/OpenAPI 3.0 documentation with interactive testing

### 🎯 Authentication Improvements

- **Password Strength Indicator**: Real-time password strength feedback
- **Field-level Validation**: Instant validation for all form fields
- **Enhanced Registration**: Improved user registration flow with better UX
- **Login Enhancements**: Better error handling and user feedback

## 🌟 Professional Portfolio Enhancements

This project has been enhanced with professional development practices to demonstrate industry-standard coding skills and best practices:

### 🧪 Testing Infrastructure

- **Jest Testing Framework:** Comprehensive unit testing with 80%+ code coverage
- **Test Organization:** Structured test files in `src/__tests__/` directory
- **MongoDB Memory Server:** Isolated testing environment with in-memory database
- **Controller Testing:** Complete coverage of authentication, pet, service, and booking controllers
- **Utility Testing:** Validation functions and helper utilities testing
- **Mocking:** Proper mocking of external dependencies and database operations
- **Coverage Reports:** Detailed coverage metrics with Istanbul integration

### 📚 API Documentation

- **Swagger UI Integration:** Interactive API documentation at `/api-docs`
- **OpenAPI 3.0 Specification:** Complete API schema documentation
- **JSDoc Comments:** Rich API documentation with request/response examples
- **Interactive Testing:** Test endpoints directly from the documentation interface
- **Schema Validation:** Comprehensive request/response schema definitions
- **Authentication Testing:** JWT token testing within documentation

### 📊 Professional Logging

- **Winston Logger:** Structured logging with multiple transports
- **Log Levels:** Configurable logging levels (error, warn, info, debug)
- **File Logging:** Persistent log files in `logs/` directory
- **HTTP Logging:** Request/response logging with Morgan middleware
- **Error Tracking:** Comprehensive error logging with stack traces
- **Production Ready:** Log rotation and performance optimization

### 🔧 Code Quality & Standards

- **Clean Architecture:** Well-organized MVC structure with separation of concerns
- **Error Handling:** Comprehensive error handling with meaningful messages
- **Input Validation:** Robust validation with Joi schemas
- **Security Best Practices:** JWT authentication, CORS, rate limiting
- **Environment Configuration:** Proper environment variable management
- **Documentation:** Comprehensive README with setup and usage instructions

### 🚀 Development Workflow

- **npm Scripts:** Organized scripts for testing, coverage, and development
- **Environment Setup:** Easy local development setup with detailed instructions
- **Test Commands:** Multiple testing options (watch, coverage, specific tests)
- **Development Tools:** Proper development and production configurations

These enhancements showcase modern full-stack development practices and make the project suitable for professional portfolios and enterprise environments.

## 🌟 Live Demo & Screenshots

> **Note:** This application is designed for cloud deployment and showcases full-stack development skills including Node.js, MongoDB, and modern web technologies.

### 🖼️ Application Screenshots

#### Dashboard Overview

![Dashboard](docs/screenshots/dashboard.png)
_Interactive dashboard showing real-time pet care management_

#### Pet Management Interface

![Pet Management](docs/screenshots/pet-management.png)
_Complete CRUD operations with photo upload functionality_

#### Booking System

![Booking System](docs/screenshots/booking-system.png)
_Full booking lifecycle with status management_

#### Authentication & Security

![Authentication](docs/screenshots/auth-system.png)
_JWT-based authentication with role-based access control_

### 🎥 Video Walkthrough

> **[Watch Demo Video](docs/demo-video.mp4)** - 3-minute walkthrough showcasing all features

### 🚀 Quick Local Setup for Testing

```bash
# Clone and setup (5 minutes)
git clone <repository-url>
cd pet-care-platform
npm install

# Configure environment (copy your MongoDB Atlas URL)
cp .env.example .env
# Edit .env with your MongoDB connection string

# Run the application
node src/server.js

# Access the application
# Dashboard: http://localhost:8001
# API: http://localhost:8001/api
```

### 📋 Test Accounts

For quick testing, you can register with these sample roles:

- **Pet Owner:** Test booking and pet management features
- **Pet Sitter:** Test service creation and booking management

### 🔧 Development & Testing Tools

- **Interactive API Docs:** `http://localhost:8001/api-docs` - Test all endpoints directly
- **Test Suite:** `npm test` - Run comprehensive unit tests
- **Coverage Reports:** `npm run test:coverage` - View test coverage metrics
- **Logging:** Check `logs/` directory for application logs

## Development

### Code Style

- Use consistent indentation (2 spaces)
- Follow async/await patterns
- Add comprehensive comments
- Use descriptive variable names
- Implement proper error handling

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode for development
npm run test:watch

# Run specific test file
npm test -- --testNamePattern="petController"

# Run tests silently (minimal output)
npm test -- --silent
```

### Test Coverage

The application includes comprehensive unit tests covering:

- **Controller Tests:** Authentication, Pet, Service, and Booking controllers
- **Utility Tests:** Validation functions and helper utilities
- **Integration Tests:** API endpoint testing with mock database
- **Error Handling:** Comprehensive error scenario testing
- **Security Tests:** Authentication and authorization testing

### API Documentation

The application provides interactive API documentation using Swagger UI:

- **Access:** `http://localhost:8001/api-docs`
- **Features:** Interactive API testing, request/response schemas, authentication testing
- **Coverage:** All endpoints documented with examples and schema definitions

### Logging

Professional logging is implemented using Winston:

- **Log Levels:** Error, warn, info, http, verbose, debug, silly
- **Transports:** File logging (`logs/` directory) and console output
- **HTTP Logging:** Request/response logging with Morgan middleware
- **Error Tracking:** Comprehensive error logging with stack traces

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

## Future Enhancements

### 🔮 Planned Features

- **Pet Profile Editing:** Complete edit functionality for pet profiles
- **Advanced Service Management:** Bulk service operations and templates
- **Review & Rating System:** Allow owners to review and rate sitters
- **Real-time Messaging:** In-app messaging between owners and sitters
- **Push Notifications:** Real-time booking updates and reminders
- **Payment Integration:** Stripe/PayPal payment processing with escrow
- **Email Notifications:** Automated email updates for booking status changes
- **Calendar Integration:** Google Calendar sync for sitters and owners
- **Advanced Search:** Geolocation-based service discovery with maps
- **Mobile App:** React Native mobile application
- **Photo Recognition:** AI-powered pet breed identification
- **Subscription Plans:** Premium features for frequent users
- **API Documentation:** Comprehensive Swagger/OpenAPI documentation
- **Admin Dashboard:** Administrative interface for platform management
- **Multi-language Support:** Internationalization for global users

### 🛠️ Technical Improvements

- **Enhanced Testing:** Comprehensive Jest test suite with mocking and coverage
- **Better Documentation:** Swagger/OpenAPI 3.0 with interactive testing capabilities
- **Professional Logging:** Structured logging with Winston and log rotation
- **Performance Optimization:** Database indexing and query optimization
- **Caching:** Redis caching for frequently accessed data
- **API Rate Limiting:** Advanced rate limiting with user-specific limits
- **Monitoring:** Application performance monitoring and alerting
- **Deployment:** Docker containerization and CI/CD pipeline
- **Load Balancing:** Horizontal scaling with load balancers
- **Security Auditing:** Regular security assessments and updates
