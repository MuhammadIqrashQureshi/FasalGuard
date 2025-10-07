# FasalGuard - Agricultural Monitoring System

A complete authentication system for FasalGuard with React frontend and Node.js backend.

## Features

- ✅ User Registration and Login
- ✅ JWT Token Authentication
- ✅ Password Hashing with bcrypt
- ✅ MongoDB Database Integration
- ✅ Responsive UI with Dark Mode
- ✅ Protected Routes
- ✅ User Dashboard
- ✅ Form Validation
- ✅ Error Handling

## Project Structure

```
fasal-guard/
├── src/                    # React Frontend
│   ├── App.js             # Main App Component
│   ├── FasalGuardAuth.js  # Authentication Component
│   ├── Dashboard.js       # User Dashboard
│   └── ...
├── backend/               # Node.js Backend
│   ├── controllers/       # Route Controllers
│   ├── middleware/        # Authentication Middleware
│   ├── models/           # Database Models
│   ├── routes/           # API Routes
│   ├── server.js         # Express Server
│   └── package.json      # Backend Dependencies
└── package.json          # Frontend Dependencies
```

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

## Installation & Setup

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Database Setup

**Option A: MongoDB Atlas (Recommended - Cloud Database)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas) in Chrome
2. Create a free account and cluster
3. Follow the detailed guide: [MONGODB_ATLAS_SETUP.md](MONGODB_ATLAS_SETUP.md)
4. Or use the setup helper: `node setup-atlas.js`

**Option B: Local MongoDB**
```bash
# Install MongoDB locally and start service
mongod
```

### 4. Environment Configuration

**For MongoDB Atlas (Recommended):**
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fasalguard?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

**For Local MongoDB:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fasalguard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NODE_ENV=development
```

### 5. Start the Application

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/auth/register` | Register new user | Public |
| POST | `/api/auth/login` | Login user | Public |
| GET | `/api/auth/me` | Get current user | Private |
| PUT | `/api/auth/profile` | Update user profile | Private |
| POST | `/api/auth/logout` | Logout user | Private |

### Example API Usage

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Login User:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

## Usage

1. **Registration**: Create a new account with name, email, and password
2. **Login**: Sign in with your email and password
3. **Dashboard**: Access your personalized dashboard after login
4. **Logout**: Sign out from your account

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Input validation and sanitization
- CORS protection
- Error handling without sensitive data exposure

## Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development
```bash
npm start  # Starts React development server
```

## Production Deployment

1. Update environment variables for production
2. Build the frontend: `npm run build`
3. Set up MongoDB Atlas for production database
4. Deploy backend to your preferred hosting service
5. Configure CORS for your production domain

## Technologies Used

**Frontend:**
- React 19
- Lucide React (Icons)
- CSS-in-JS (Inline Styles)

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- express-validator

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details