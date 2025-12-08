# FasalGuard Feedback & Query Management System

## 📋 Overview

The feedback system allows users to submit queries via the Contact page, which are then stored in the database and displayed in the Admin Dashboard. Admins can view queries, reply to them (which sends an email to the user), and manage the status (pending/done).

---

## 🏗️ Architecture

### Backend Components

#### 1. **Feedback Model** (`backend/models/Feedback.js`)
- **Fields:**
  - `name` (String, required): User's name
  - `email` (String, required): User's email
  - `message` (String, required): User's query/feedback message
  - `status` (String, enum: ['pending', 'done'], default: 'pending'): Query status
  - `reply` (String, nullable): Admin's response
  - `repliedAt` (Date, nullable): Timestamp of reply
  - `repliedBy` (ObjectId, ref: 'User', nullable): Admin who replied
  - `createdAt` (Date): Submission timestamp
  - `updatedAt` (Date): Last update timestamp

#### 2. **Feedback Controller** (`backend/controllers/feedbackController.js`)
- **Functions:**
  - `getAllFeedback()`: Fetch all feedback queries (sorted by newest first)
  - `getFeedbackById()`: Get single feedback by ID
  - `replyToFeedback()`: Send reply email and update feedback status to 'done'
  - `updateFeedbackStatus()`: Manually change status (pending/done)
  - `deleteFeedback()`: Delete feedback entry (optional cleanup)

#### 3. **Feedback Routes** (`backend/routes/feedbackRoutes.js`)
- All routes require authentication (protected by JWT middleware)
- **Endpoints:**
  - `GET /api/feedback` - Get all feedback
  - `GET /api/feedback/:id` - Get specific feedback
  - `POST /api/feedback/:id/reply` - Reply to feedback (auto-updates status to 'done')
  - `PATCH /api/feedback/:id/status` - Update status manually
  - `DELETE /api/feedback/:id` - Delete feedback (optional)

#### 4. **Contact Controller Update** (`backend/controllers/contactController.js`)
- **Enhanced to:**
  1. Save feedback to database (new)
  2. Send email notification to admin (existing)
  3. Return feedback ID in response

#### 5. **Server Configuration** (`backend/server.js`)
- Added feedback routes: `app.use('/api/feedback', feedbackRoutes);`

---

### Frontend Components

#### 1. **Admin Dashboard** (`src/AdminDashboard.js`)

**New State Variables:**
```javascript
const [feedbackList, setFeedbackList] = useState([]);
const [selectedFeedback, setSelectedFeedback] = useState(null);
const [replyMessage, setReplyMessage] = useState('');
const [replyLoading, setReplyLoading] = useState(false);
```

**New Functions:**
- `fetchFeedback()`: Load all feedback from API
- `handleReplyFeedback(feedbackId)`: Send reply and email user
- `handleUpdateStatus(feedbackId, newStatus)`: Change status (pending/done)

**New Tab:**
- Added `'queries'` to tab navigation
- Renders feedback table with:
  - User name, email, message preview
  - Submission date
  - Status dropdown (pending/done)
  - Actions: Reply, View

**Reply/View Modal:**
- Full message display
- Reply textarea
- Send reply button (triggers email)
- Shows existing reply if already responded

---

## 🚀 Usage Guide

### For Users (Contact Form)
1. Go to Contact page
2. Fill in name, email, and message
3. Submit form
4. Query is saved to database + email sent to admin

### For Admins (Admin Dashboard)

#### Viewing Queries
1. Login as admin
2. Click **"Queries"** tab
3. View all user queries in table format
4. Pending queries shown at top

#### Replying to Query
1. Click **"Reply"** button on any query
2. Modal opens with full details
3. Type your response in the textarea
4. Click **"Send Reply"**
5. Email automatically sent to user
6. Status automatically changes to "done"
7. Reply stored in database

#### Changing Status Manually
1. Use the dropdown in Status column
2. Select "Pending" or "Done"
3. Status updates immediately

#### Viewing Full Details
1. Click **"View"** button
2. See complete message
3. View reply history (if any)

---

## 📧 Email Template

When admin replies, user receives a formatted HTML email with:
- **Subject:** "Response to Your Query - FasalGuard"
- **Content:**
  - User's original query
  - Admin's response
  - Submission date
  - FasalGuard branding

---

## 🔒 Security

- All feedback routes protected by JWT authentication
- Only authenticated admins can access queries
- Email validation on feedback submission
- XSS protection through input sanitization

---

## 📊 Database Schema

```javascript
{
  name: "John Doe",
  email: "john@example.com",
  message: "How do I predict crops?",
  status: "pending", // or "done"
  reply: null, // or "You can use the crop prediction page..."
  repliedAt: null, // or Date object
  repliedBy: null, // or ObjectId referencing User
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-15T10:30:00.000Z"
}
```

---

## 🧪 Testing Steps

### 1. Submit Test Feedback
```bash
# Start backend
cd backend
npm start

# Start frontend (in new terminal)
cd ..
npm start
```

1. Navigate to Contact page
2. Fill form and submit
3. Check database: `db.feedbacks.find()`
4. Verify email received at `daniyalkhawar41@gmail.com`

### 2. View in Admin Dashboard
1. Login as admin (admin@fasalguard.com / Root@pass1)
2. Click "Queries" tab
3. Verify query appears in table
4. Check status shows "pending"

### 3. Reply to Query
1. Click "Reply" button
2. Enter response message
3. Click "Send Reply"
4. Verify:
   - Success alert appears
   - Status changes to "done"
   - Email sent to user
   - Reply stored in database

### 4. Status Management
1. Use dropdown to change status
2. Verify immediate update
3. Refresh page and check persistence

---

## 🐛 Troubleshooting

### Feedback Not Saving
- Check MongoDB connection
- Verify Feedback model imported in contactController
- Check browser console for errors

### Email Not Sending
- Verify nodemailer configuration in `backend/middleware/emailConfig.js`
- Check EMAIL credentials in `backend/config.env`
- Test transporter connection

### Queries Tab Empty
- Check JWT token in localStorage
- Verify API endpoint `/api/feedback` accessible
- Check network tab in browser DevTools

### Reply Not Working
- Ensure replyMessage not empty
- Check authentication token
- Verify feedback ID is correct
- Check backend logs for errors

---

## 📁 File Structure

```
FasalGuard/
├── backend/
│   ├── models/
│   │   └── Feedback.js (NEW)
│   ├── controllers/
│   │   ├── contactController.js (MODIFIED)
│   │   └── feedbackController.js (NEW)
│   ├── routes/
│   │   └── feedbackRoutes.js (NEW)
│   └── server.js (MODIFIED)
├── src/
│   └── AdminDashboard.js (MODIFIED)
└── FEEDBACK_SYSTEM_GUIDE.md (THIS FILE)
```

---

## 🎨 UI Design Features

### Queries Tab
- Glass-morphism card design
- Responsive table layout
- Color-coded status badges
- Hover effects on rows
- Action buttons with icons

### Reply Modal
- Full-screen overlay with backdrop blur
- Scrollable content area
- Syntax-highlighted code blocks
- Loading states on buttons
- Success/error feedback

---

## 🔮 Future Enhancements

- [ ] Add query categories/tags
- [ ] Implement search/filter functionality
- [ ] Add attachments support
- [ ] Export queries to CSV
- [ ] Analytics dashboard for query trends
- [ ] Auto-responses for common queries
- [ ] Priority levels (low/medium/high)
- [ ] Assign queries to specific admins

---

## 📞 Support

For issues or questions, contact the development team or refer to the main README.md.

---

**Last Updated:** January 2024  
**Version:** 1.0.0
