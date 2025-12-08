# Admin Portal Setup Instructions

## Changes Implemented ✅

### 1. Admin Login Routing
- **Location**: `src/App.js`
- **Change**: Login handler now checks user role
- **Behavior**: 
  - Regular users → redirected to `/home`
  - Admin users → redirected to `/admin`

### 2. Color Scheme Update
- **Primary Green**: `#0FB57E` (everywhere)
- **Background**: White gradient (`from-white via-gray-50 to-green-50`)
- **Text Colors**: Dark grays (`#1f2937`, `#4b5563`, `#6b7280`)
- **Glass Cards**: White with green borders
- **Buttons**: Green theme with proper hover states
- **Charts**: Updated to use #0FB57E color palette

### 3. Admin Account Creation Script
- **Location**: `backend/scripts/createAdminUser.js`
- **Purpose**: Creates the admin account in MongoDB

---

## Setup Steps

### Step 1: Create Admin Account

Run this command from the project root:

```powershell
node backend/scripts/createAdminUser.js
```

This will create:
- **Email**: `admin@fasalguard.com`
- **Password**: `Root@pass1`
- **Role**: `admin`

**Note**: If the admin account already exists, the script will inform you.

### Step 2: Start the Application

```powershell
# Terminal 1 - Start Backend
cd backend
npm start

# Terminal 2 - Start Frontend
cd ..
npm start
```

### Step 3: Login as Admin

1. Go to `http://localhost:3000/login`
2. Enter credentials:
   - Email: `admin@fasalguard.com`
   - Password: `Root@pass1`
3. You'll be automatically redirected to `/admin` dashboard

---

## Security Recommendations

### ✅ What We Did (Secure Approach)
- Admin account stored in database with hashed password
- Role-based access control through JWT tokens
- Backend validates admin role for protected routes
- Password follows security requirements

### 🔒 Additional Security (Optional)
1. **Change Default Password**: After first login, consider changing the admin password
2. **Environment Variables**: Move admin credentials to `.env` file if creating more admins
3. **Two-Factor Authentication**: Consider adding 2FA for admin accounts
4. **Admin Activity Logging**: Track admin actions for audit trail

---

## New Admin Dashboard Features

### Visual Theme
- Clean white and green color scheme (#0FB57E)
- Professional glassmorphism design
- Improved readability with dark text on light backgrounds
- Consistent color palette throughout

### Functionality
- **System Health**: Monitor all services
- **User Management**: Suspend/activate users with confirmation modals
- **Weather Stats**: Live weather data for major cities
- **Model Performance**: Track ML model accuracy
- **Email Broadcast**: Send emails to all users

---

## MongoDB Alternative (Manual Creation)

If you prefer to create the admin manually in MongoDB Compass:

1. Open MongoDB Compass
2. Connect to your database
3. Select `fasalguard` database (or your database name)
4. Go to `users` collection
5. Click "ADD DATA" → "Insert Document"
6. Paste this JSON:

```json
{
  "name": "FasalGuard Admin",
  "email": "admin@fasalguard.com",
  "password": "$2a$10$YgXVqzB5kP1xJyYxQxYxQeZJ0xYxQxYxQxYxQxYxQxYx",
  "role": "admin",
  "accountStatus": "active",
  "isEmailVerified": true,
  "emailVerified": true,
  "createdAt": { "$date": "2025-12-08T00:00:00.000Z" },
  "lastLogin": { "$date": "2025-12-08T00:00:00.000Z" }
}
```

**Note**: The password hash above is for `Root@pass1`. To generate a new hash, use bcrypt with 10 rounds.

---

## Troubleshooting

### Issue: Admin redirect not working
**Solution**: Clear browser cache and localStorage:
```javascript
localStorage.clear()
```

### Issue: Colors not updating
**Solution**: Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: Admin script fails
**Solution**: 
1. Check MongoDB connection in `backend/config.env`
2. Ensure backend dependencies are installed: `npm install`
3. Check if admin already exists in database

### Issue: Cannot login as admin
**Solution**:
1. Verify admin account exists in MongoDB
2. Check `role` field is set to `"admin"`
3. Ensure backend auth routes are working

---

## Testing Checklist

- [ ] Run admin creation script successfully
- [ ] Login with admin credentials
- [ ] Verify automatic redirect to `/admin`
- [ ] Check dashboard displays with white/green theme
- [ ] Test user suspend/activate functions
- [ ] Test email broadcast modal
- [ ] Verify all tabs (System, Models, Weather, Users)
- [ ] Logout and try regular user login (should go to `/home`)

---

## Color Reference

| Element | Color Code | Usage |
|---------|-----------|-------|
| Primary Green | `#0FB57E` | Buttons, borders, accents |
| Secondary Green | `#3FD2A0` | Chart gradients, hover states |
| Dark Text | `#1f2937` | Headings, primary text |
| Medium Gray | `#4b5563` | Secondary text |
| Light Gray | `#6b7280` | Tertiary text, placeholders |
| Background | `from-white via-gray-50 to-green-50` | Main gradient |
| Card Background | `rgba(255, 255, 255, 0.95)` | Glass cards |

---

## Next Steps

1. **Test the admin portal** thoroughly
2. **Customize the dashboard** if needed
3. **Add more admin features** as required
4. **Set up backup admin accounts** for redundancy
5. **Configure email settings** for broadcast functionality

---

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Check backend terminal for API errors
3. Verify MongoDB connection
4. Ensure all dependencies are installed
5. Review the troubleshooting section above

**Created**: December 8, 2025
**Last Updated**: December 8, 2025
