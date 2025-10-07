# 🚀 Quick Start with MongoDB Atlas

## Step 1: Set Up MongoDB Atlas (5 minutes)

1. **Open Chrome** and go to: https://www.mongodb.com/atlas
2. **Sign up** for a free account
3. **Create cluster** (choose FREE M0 Sandbox)
4. **Add database user**:
   - Username: `fasalguard-user`
   - Password: Click "Autogenerate Secure Password" (SAVE THIS PASSWORD!)
5. **Network Access**: Click "Allow access from anywhere" (0.0.0.0/0)
6. **Get connection string**: Click "Connect" → "Connect your application" → Copy the string

## Step 2: Configure Your Project

**Option A: Use the setup helper**
```bash
node setup-atlas.js
# Paste your connection string when prompted
```

**Option B: Manual setup**
1. Open `backend/config.env`
2. Replace the MONGODB_URI with your connection string:
```env
MONGODB_URI=mongodb+srv://fasalguard-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fasalguard?retryWrites=true&w=majority
```

## Step 3: Run Your Application

```bash
# Install dependencies
npm install
cd backend && npm install && cd ..

# Start backend
cd backend
npm run dev

# In another terminal, start frontend
npm start
```

## Step 4: Test Everything

1. **Backend**: Visit http://localhost:5000/api/health
2. **Frontend**: Visit http://localhost:3000
3. **Register**: Create a new account
4. **Login**: Sign in with your credentials
5. **Dashboard**: See your user information

## ✅ You're Done!

Your FasalGuard app is now running with MongoDB Atlas cloud database!

### What's Working:
- ✅ User registration and login
- ✅ Cloud database storage
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Beautiful UI with dark mode

### Next Steps:
- Check your data in MongoDB Atlas dashboard
- Customize the dashboard
- Add more features to your app

## Troubleshooting

**Connection failed?**
- Check your connection string format
- Make sure your IP is whitelisted in Atlas
- Verify username/password are correct

**Need help?**
- See detailed guide: [MONGODB_ATLAS_SETUP.md](MONGODB_ATLAS_SETUP.md)
- Check the main README.md for full documentation
