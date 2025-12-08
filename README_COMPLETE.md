# 🌾 FasalGuard - Crop Prediction & Climate Analysis System

A comprehensive AI-powered agricultural platform for crop prediction, weather analysis, and historical climate trends visualization.

![FasalGuard](https://img.shields.io/badge/FasalGuard-Agricultural%20AI-22c55e)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)

## 📑 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### 🎯 Core Features
- **AI Crop Prediction**: ML-powered predictions using LSTM & GRU models
- **Real-time Weather Data**: Live weather information for 6 Pakistani cities
- **Interactive Climate Analysis**: Historical trends visualization (2013-2023)
- **Admin Dashboard**: User management and feedback system
- **Email Notifications**: Automated email system for user actions
- **Responsive Design**: Modern dark theme with glassmorphism effects

### 🌍 Supported Crops
- Wheat 🌾
- Cotton 🌸
- Rice 🍚
- Maize 🌽
- Sugarcane 🎋

### 📍 Covered Cities
- Lahore
- Multan
- Faisalabad
- Bahawalpur
- Gujrat
- Sargodha

---

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.0
- **Framer Motion** (Animations)
- **Lucide React** (Icons)
- **React Router** (Navigation)

### Backend
- **Node.js** & **Express.js**
- **MongoDB Atlas** (Database)
- **JWT** (Authentication)
- **Nodemailer** (Email Service)
- **Axios** (HTTP Requests)

### Machine Learning
- **Python** with Flask
- **TensorFlow/Keras** (LSTM & GRU Models)
- **NumPy** & **Pandas**

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

1. **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
2. **Python** (v3.8 or higher) - [Download](https://www.python.org/)
3. **Git** - [Download](https://git-scm.com/)
4. **MongoDB Atlas Account** - [Sign Up](https://www.mongodb.com/cloud/atlas)
5. **OpenWeather API Key** - [Get API Key](https://openweathermap.org/api)

---

## 🚀 Installation & Setup

### Step 1: Clone the Repository

Using **Git Bash** or **Command Prompt**:
```bash
git clone https://github.com/daniyalkhawar366/FasalGuard.git
cd FasalGuard
```

### Step 2: Install Frontend Dependencies

```bash
npm install
```

**Required packages:**
- react
- react-dom
- react-router-dom
- framer-motion
- lucide-react
- axios

### Step 3: Install Backend Dependencies

```bash
cd backend
npm install
```

**Required packages:**
- express
- mongoose
- jsonwebtoken
- bcryptjs
- nodemailer
- cors
- dotenv
- axios

### Step 4: Set Up Python ML Service

```bash
cd backend/ml_service
pip install -r requirements.txt
```

**Required packages:**
- flask
- tensorflow
- numpy
- pandas
- scikit-learn

### Step 5: Configure Environment Variables

Create a `config.env` file in the `backend` folder:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fasalguard?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# OpenWeather API
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Step 6: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address (or use 0.0.0.0/0 for all IPs)
5. Get your connection string and add it to `MONGODB_URI` in `config.env`

**Detailed guide:** See `MONGODB_ATLAS_SETUP.md` in the project root

---

## 🏃 Running the Project

### Option 1: Run Everything Separately

**Terminal 1 - Frontend:**
```bash
npm start
```
Runs on `http://localhost:3000`

**Terminal 2 - Backend:**
```bash
cd backend
node server.js
```
Runs on `http://localhost:5000`

**Terminal 3 - Python ML Service:**
```bash
cd backend/ml_service
python app.py
```
Runs on `http://localhost:8000`

### Option 2: Use Batch Scripts (Windows)

**For Development:**
```bash
# Run this from the project root
start-dev.bat
```

This will automatically start all three services in separate windows.

### Option 3: Quick Start Script

```bash
npm run dev  # If configured in package.json
```

---

## 📁 Project Structure

```
FasalGuard/
├── public/                      # Static files
│   ├── index.html
│   ├── manifest.json
│   └── crop_analysis_models/   # Model analysis data
├── src/                         # React frontend
│   ├── HomePage.js             # Landing page
│   ├── CropPredictionPage.js   # Main prediction interface
│   ├── PastTrends.js           # Historical data visualization
│   ├── PredictionResults.js    # Results display
│   ├── AdminDashboard.js       # Admin panel
│   ├── FasalGuardAuth.js       # Authentication
│   ├── ContactPage.js
│   ├── Profile.js
│   └── App.js                  # Main app component
├── backend/
│   ├── server.js               # Express server entry point
│   ├── config.env              # Environment variables (create this)
│   ├── controllers/            # Request handlers
│   │   ├── authController.js
│   │   ├── weatherController.js
│   │   ├── mlPredictionController.js
│   │   └── feedbackController.js
│   ├── models/                 # MongoDB schemas
│   │   ├── User.js
│   │   ├── Prediction.js
│   │   └── Feedback.js
│   ├── routes/                 # API routes
│   │   ├── auth.js
│   │   ├── predictionRoutes.js
│   │   └── feedbackRoutes.js
│   ├── middleware/             # Custom middleware
│   │   ├── auth.js
│   │   ├── emailService.js
│   │   └── emailTemplates.js
│   ├── ml_models/              # Trained ML models (.h5 files)
│   └── ml_service/             # Python Flask service
│       ├── app.py
│       ├── model_predictor.py
│       └── requirements.txt
├── .gitignore
├── package.json
├── README.md                    # This file
├── MONGODB_ATLAS_SETUP.md      # MongoDB setup guide
└── QUICK_START_ATLAS.md        # Quick setup instructions
```

---

## 🔧 Environment Variables Explained

### MongoDB Settings
- `MONGODB_URI`: Your MongoDB Atlas connection string
  - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

### JWT Authentication
- `JWT_SECRET`: Secret key for token generation (use a strong random string)

### Email Configuration
- `EMAIL_HOST`: SMTP server (Gmail: smtp.gmail.com)
- `EMAIL_PORT`: SMTP port (587 for TLS)
- `EMAIL_USER`: Your email address
- `EMAIL_PASS`: App-specific password (not your regular password)
  - [Generate Gmail App Password](https://support.google.com/accounts/answer/185833)

### Weather API
- `OPENWEATHER_API_KEY`: Free API key from OpenWeatherMap
  - [Get Free API Key](https://home.openweathermap.org/api_keys)

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **MongoDB Connection Failed**
```
Error: MongoServerError: Authentication failed
```
**Solution:**
- Check your MongoDB Atlas credentials
- Verify IP whitelist settings
- Ensure connection string format is correct
- See `MONGODB_ATLAS_SETUP.md` for detailed steps

#### 2. **Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Change port in backend/server.js or config.env
PORT=5001
```

#### 3. **ML Service Not Starting**
```
ModuleNotFoundError: No module named 'tensorflow'
```
**Solution:**
```bash
cd backend/ml_service
pip install -r requirements.txt
# or
pip install tensorflow numpy pandas flask
```

#### 4. **Email Not Sending**
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution:**
- Use App-specific password, not your regular Gmail password
- Enable "Less secure app access" (if using older Gmail)
- Check `EMAIL_USER` and `EMAIL_PASS` in config.env

#### 5. **React App Not Loading**
```
Module not found: Can't resolve 'framer-motion'
```
**Solution:**
```bash
npm install framer-motion lucide-react
```

#### 6. **Weather Data Not Fetching**
- Verify `OPENWEATHER_API_KEY` is valid
- Check if API quota exceeded (free tier: 60 calls/min)
- Ensure backend server is running

---

## 👥 For Collaborators

### Pulling and Running the Project

1. **Clone the repository**
   ```bash
   git clone https://github.com/daniyalkhawar366/FasalGuard.git
   cd FasalGuard
   ```

2. **Install all dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ml_service && pip install -r requirements.txt
   ```

3. **Get environment variables**
   - Ask the project owner for the `config.env` file
   - Or create your own following the template above

4. **Run the project**
   ```bash
   # From project root
   start-dev.bat  # Windows
   # or manually start each service
   ```

### Using GitHub Desktop

1. **Install GitHub Desktop** - [Download](https://desktop.github.com/)

2. **Clone the repository:**
   - Open GitHub Desktop
   - Click `File` → `Clone Repository`
   - Enter: `https://github.com/daniyalkhawar366/FasalGuard`
   - Choose local path
   - Click `Clone`

3. **Making changes:**
   - Make your code changes
   - GitHub Desktop will show all modified files
   - Write a commit message
   - Click `Commit to main`
   - Click `Push origin` to upload changes

4. **Pulling updates:**
   - Click `Fetch origin` to check for updates
   - Click `Pull origin` to download changes

---

## 📝 Scripts Reference

### Frontend (Root)
```bash
npm start          # Start development server
npm run build      # Create production build
npm test           # Run tests
```

### Backend
```bash
node server.js                           # Start backend server
node scripts/createAdminUser.js         # Create admin account
```

### ML Service
```bash
python app.py                           # Start Flask ML service
```

---

## 🔐 Creating Admin Account

After setting up MongoDB, create an admin account:

```bash
cd backend/scripts
node createAdminUser.js
```

Follow the prompts to set admin credentials.

---

## 📊 Features Breakdown

### 1. Crop Prediction
- Select city and crop type
- View real-time weather data
- Get AI-powered yield predictions
- See climate-based recommendations

### 2. Past Trends Analysis
- Interactive charts for 2013-2023 data
- Compare yield and production trends
- Analyze temperature and rainfall impact
- View key climate factors

### 3. Admin Dashboard
- User management (approve/reject/delete)
- View all predictions
- Manage feedback
- System analytics

### 4. Weather Integration
- Real-time data from OpenWeatherMap API
- 7-day forecast
- Temperature, humidity, wind speed, rainfall
- City-specific climate data

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Authors

- **Daniyal Khawar** - [@daniyalkhawar366](https://github.com/daniyalkhawar366)

---

## 🆘 Support

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Read the setup guides in the project
3. Open an issue on GitHub
4. Contact the project maintainer

---

## 🎯 Quick Start Checklist

- [ ] Node.js installed
- [ ] Python installed
- [ ] Repository cloned
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Backend dependencies installed (`cd backend && npm install`)
- [ ] Python packages installed (`cd backend/ml_service && pip install -r requirements.txt`)
- [ ] `config.env` file created with all variables
- [ ] MongoDB Atlas cluster created
- [ ] OpenWeather API key obtained
- [ ] All three services running (Frontend, Backend, ML Service)
- [ ] Admin account created
- [ ] Tested login and prediction

---

**Happy Farming! 🌾🚀**
