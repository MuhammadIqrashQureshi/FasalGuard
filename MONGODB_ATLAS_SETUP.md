# MongoDB Atlas Setup Guide

This guide will help you set up MongoDB Atlas (cloud database) for your FasalGuard project.

## Step 1: Create MongoDB Atlas Account

1. **Go to MongoDB Atlas**: Open [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) in Chrome
2. **Sign Up**: Click "Try Free" and create an account
3. **Choose Plan**: Select the "Free" plan (M0 Sandbox)
4. **Complete Registration**: Fill in your details and verify your email

## Step 2: Create a New Cluster

1. **Create Cluster**: Click "Build a Database"
2. **Choose Template**: Select "FREE" (M0 Sandbox)
3. **Cloud Provider**: Choose your preferred provider (AWS, Google Cloud, or Azure)
4. **Region**: Select a region closest to you
5. **Cluster Name**: Keep default or name it "fasalguard-cluster"
6. **Create Cluster**: Click "Create Cluster"

## Step 3: Set Up Database Access

1. **Database Access**: In the left sidebar, click "Database Access"
2. **Add New User**: Click "Add New Database User"
3. **Authentication Method**: Select "Password"
4. **Username**: Enter `fasalguard-user` (or any username you prefer)
5. **Password**: Click "Autogenerate Secure Password" or create your own
6. **Database User Privileges**: Select "Read and write to any database"
7. **Add User**: Click "Add User"
8. **Save Password**: ⚠️ **IMPORTANT**: Copy and save the password securely!

## Step 4: Set Up Network Access

1. **Network Access**: In the left sidebar, click "Network Access"
2. **Add IP Address**: Click "Add IP Address"
3. **Allow Access**: Select "Allow access from anywhere" (0.0.0.0/0)
   - For development, this is fine
   - For production, add specific IP addresses
4. **Confirm**: Click "Confirm"

## Step 5: Get Connection String

1. **Clusters**: In the left sidebar, click "Clusters"
2. **Connect**: Click "Connect" on your cluster
3. **Connect Your Application**: Select "Connect your application"
4. **Driver**: Select "Node.js" and version "4.1 or later"
5. **Connection String**: Copy the connection string (it looks like this):
   ```
   mongodb+srv://fasalguard-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update Your Project Configuration

1. **Open**: `backend/config.env` file
2. **Replace**: Update the MONGODB_URI with your connection string:

```env
PORT=5000
# Replace this with your actual MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://fasalguard-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fasalguard?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random
JWT_EXPIRE=7d
NODE_ENV=development
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with the password you created in Step 3
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- The database name `fasalguard` will be created automatically

## Step 7: Test Your Connection

1. **Start Backend**: Run your backend server
   ```bash
   cd backend
   npm run dev
   ```

2. **Check Console**: You should see:
   ```
   ✅ Connected to MongoDB Atlas
   📊 Database: fasalguard
   ```

3. **Test API**: Visit http://localhost:5000/api/health

## Step 8: Verify in MongoDB Atlas

1. **Collections**: In MongoDB Atlas, go to "Collections"
2. **Browse Data**: You should see your `fasalguard` database
3. **Users Collection**: When you register a user, you'll see a `users` collection

## Troubleshooting

### Common Issues:

**1. Authentication Failed**
- Double-check your username and password
- Make sure there are no extra spaces in the connection string

**2. Network Access Denied**
- Ensure your IP is added to the Network Access list
- Try "Allow access from anywhere" (0.0.0.0/0) for development

**3. Connection Timeout**
- Check if your firewall is blocking the connection
- Verify the connection string format

**4. Database Not Found**
- The database will be created automatically when you first insert data
- Make sure the database name in the connection string is correct

### Connection String Format:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

## Security Best Practices

1. **Strong Password**: Use a strong, unique password for your database user
2. **IP Whitelist**: For production, whitelist specific IP addresses instead of allowing all
3. **Regular Backups**: Enable automatic backups for production
4. **Monitor Usage**: Keep an eye on your cluster usage and performance

## Free Tier Limits

- **Storage**: 512 MB
- **Connections**: 100 concurrent connections
- **Clusters**: 1 cluster
- **Perfect for**: Development and small applications

## Next Steps

Once your MongoDB Atlas is set up:

1. **Start Backend**: `cd backend && npm run dev`
2. **Start Frontend**: `npm start`
3. **Test Registration**: Create a new account
4. **Test Login**: Sign in with your credentials
5. **Check Database**: Verify data appears in MongoDB Atlas

Your FasalGuard application is now using a cloud database! 🚀
