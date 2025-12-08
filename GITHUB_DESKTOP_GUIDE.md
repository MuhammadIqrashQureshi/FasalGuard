# 🖥️ GitHub Desktop Setup Guide for FasalGuard

This guide will help you push your FasalGuard project to GitHub and enable easy collaboration.

---

## 📥 Part 1: Installing GitHub Desktop

1. **Download GitHub Desktop**
   - Visit: https://desktop.github.com/
   - Click "Download for Windows"
   - Run the installer

2. **Sign In**
   - Open GitHub Desktop
   - Click "Sign in to GitHub.com"
   - Enter your GitHub credentials
   - Authorize GitHub Desktop

---

## 🚀 Part 2: Pushing Your Project (First Time)

### Method A: Using GitHub Desktop (Easiest)

1. **Create Repository on GitHub.com**
   - Go to https://github.com/daniyalkhawar366/FasalGuard
   - If the repo exists but is empty, skip to step 2
   - If it doesn't exist:
     - Go to https://github.com/new
     - Repository name: `FasalGuard`
     - Description: "AI-powered crop prediction and climate analysis system"
     - Choose Public or Private
     - **DO NOT** initialize with README, .gitignore, or license
     - Click "Create repository"

2. **Add Existing Repository to GitHub Desktop**
   - Open GitHub Desktop
   - Click `File` → `Add Local Repository`
   - Click `Choose...` button
   - Navigate to: `C:\Users\pc\Desktop\Uni\fasalguard_mod2\FasalGuard`
   - Click `Add Repository`

3. **If Git Repository Not Initialized**
   - GitHub Desktop will show: "This directory does not appear to be a Git repository"
   - Click `Create a repository` button
   - Or click `Initialize Git Repository`

4. **Configure Repository**
   - Name: `FasalGuard`
   - Description: "AI-powered crop prediction and climate analysis system"
   - Keep "Initialize this repository with a README" **UNCHECKED** (you already have one)
   - Git Ignore: Node
   - License: MIT (optional)
   - Click `Create Repository`

5. **Publish to GitHub**
   - You'll see all your files listed (should be ~50+ files)
   - At the bottom left, write a commit message:
     ```
     Initial commit: Complete FasalGuard application
     ```
   - Click `Commit to main`
   
6. **Push to GitHub**
   - Click `Publish repository` button at the top
   - Repository name: `FasalGuard`
   - Description: "AI-powered crop prediction and climate analysis system"
   - Uncheck "Keep this code private" if you want it public
   - Click `Publish Repository`

7. **Done! ✅**
   - Your project is now on GitHub
   - Visit: https://github.com/daniyalkhawar366/FasalGuard

---

### Method B: Using Command Line (Alternative)

If you prefer using Git commands:

```bash
# Navigate to your project
cd C:\Users\pc\Desktop\Uni\fasalguard_mod2\FasalGuard

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Complete FasalGuard application"

# Add remote
git remote add origin https://github.com/daniyalkhawar366/FasalGuard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 👥 Part 3: Collaborator Setup (For Your Friend)

### Step 1: Clone the Repository

**Using GitHub Desktop:**
1. Open GitHub Desktop
2. Click `File` → `Clone Repository`
3. Click `URL` tab
4. Enter: `https://github.com/daniyalkhawar366/FasalGuard`
5. Choose local path (e.g., `C:\Users\YourName\Projects\FasalGuard`)
6. Click `Clone`

**Using Command Line:**
```bash
cd C:\Users\YourName\Projects
git clone https://github.com/daniyalkhawar366/FasalGuard.git
cd FasalGuard
```

### Step 2: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install Python dependencies
cd ml_service
pip install -r requirements.txt
```

### Step 3: Configure Environment

1. **Get the `config.env` file from you** (project owner)
   - You need to share this file securely (email, Discord, etc.)
   - **NEVER commit this file to GitHub** (it contains secrets)

2. **Place config.env**
   - Put it in: `FasalGuard/backend/config.env`

3. **Verify `.gitignore`**
   - Ensure `config.env` is in `.gitignore` (it should be)

### Step 4: Run the Project

```bash
# Option 1: Use batch script (Windows)
start-dev.bat

# Option 2: Manual start
# Terminal 1
npm start

# Terminal 2
cd backend
node server.js

# Terminal 3
cd backend/ml_service
python app.py
```

---

## 🔄 Part 4: Daily Workflow with GitHub Desktop

### Making Changes

1. **Make your code changes** in VS Code or any editor

2. **View Changes in GitHub Desktop**
   - GitHub Desktop automatically detects all changes
   - You'll see a list of modified files on the left
   - Click any file to see the diff (what changed)

3. **Commit Your Changes**
   - At the bottom left, write a commit message:
     - Summary (required): Brief description (e.g., "Fix weather API bug")
     - Description (optional): More details if needed
   - Click `Commit to main`

4. **Push to GitHub**
   - Click `Push origin` button at the top
   - Your changes are now on GitHub!

### Pulling Updates (Getting Your Friend's Changes)

1. **Fetch Updates**
   - Click `Fetch origin` button
   - This checks if there are new changes

2. **Pull Changes**
   - If updates are available, click `Pull origin`
   - Your local code is now updated

3. **Resolve Conflicts (if any)**
   - If you both edited the same file, you'll see conflicts
   - GitHub Desktop will show conflicted files
   - Open the file in your editor
   - Look for markers like:
     ```
     <<<<<<< HEAD
     Your changes
     =======
     Their changes
     >>>>>>> main
     ```
   - Keep the version you want or merge both
   - Save the file
   - In GitHub Desktop, mark as resolved
   - Commit the merge

---

## 📋 Part 5: Best Practices for Collaboration

### 1. **Always Pull Before Starting Work**
   ```
   Click "Fetch origin" → "Pull origin"
   ```
   This ensures you have the latest code.

### 2. **Commit Frequently**
   - Don't wait days to commit
   - Make small, logical commits
   - Each commit should represent one feature or fix

### 3. **Write Good Commit Messages**
   ✅ Good:
   - "Add weather API integration"
   - "Fix login authentication bug"
   - "Update Past Trends page UI"
   
   ❌ Bad:
   - "update"
   - "changes"
   - "asdf"

### 4. **Don't Commit Sensitive Files**
   Never commit:
   - `config.env` (has passwords)
   - `node_modules/` (too large, auto-generated)
   - `.env` files
   - Personal notes
   
   These should be in `.gitignore`

### 5. **Communicate**
   - Tell your friend when you push big changes
   - Use GitHub Issues for bugs
   - Use Pull Requests for major features

---

## 🌿 Part 6: Using Branches (Recommended)

### Why Use Branches?
- Work on features without breaking the main code
- Multiple people can work simultaneously
- Easy to review changes before merging

### Creating a Branch

**In GitHub Desktop:**
1. Click `Current Branch` dropdown at the top
2. Click `New Branch`
3. Name it (e.g., "feature-admin-dashboard", "fix-weather-bug")
4. Click `Create Branch`

**Now you can:**
- Make changes without affecting `main`
- Commit to your branch
- Push your branch
- When done, create a Pull Request to merge into `main`

### Switching Branches

1. Click `Current Branch` dropdown
2. Select the branch you want

---

## 🆘 Part 7: Common Issues & Solutions

### Issue 1: "Repository not found"
**Solution:**
- Check the URL: `https://github.com/daniyalkhawar366/FasalGuard`
- Ensure the repository is public or you have access
- Try re-signing in to GitHub Desktop

### Issue 2: "Permission denied"
**Solution:**
- Go to GitHub Desktop → File → Options → Accounts
- Sign out and sign back in
- Or use Personal Access Token

### Issue 3: "Push rejected"
**Solution:**
```bash
# Someone else pushed changes first
# Pull their changes first
Click "Pull origin" → Resolve conflicts → Push again
```

### Issue 4: "Cannot commit - no changes"
**Solution:**
- Ensure you saved your files in the editor
- Check if changes are in `.gitignore`

### Issue 5: Large files error
**Solution:**
- GitHub has a 100MB file limit
- Check if you're trying to commit large files
- Add them to `.gitignore` if not needed
- For ML models > 100MB, use Git LFS or host elsewhere

---

## 📱 Part 8: GitHub Desktop Features

### View History
- Click `History` tab to see all past commits
- See who made what changes and when

### Undo Last Commit
- Right-click on the last commit
- Select `Undo commit`
- Changes go back to uncommitted state

### Discard Changes
- Right-click on a changed file
- Select `Discard changes` (careful, can't undo!)

### View on GitHub
- Click `Repository` → `View on GitHub`
- Opens the project in your browser

### Open in VS Code
- Click `Repository` → `Open in Visual Studio Code`
- Quick way to start editing

---

## ✅ Quick Checklist for Collaborators

### First Time Setup:
- [ ] Install GitHub Desktop
- [ ] Sign in with GitHub account
- [ ] Clone the repository
- [ ] Run `npm install` in root
- [ ] Run `npm install` in backend
- [ ] Run `pip install -r requirements.txt` in ml_service
- [ ] Get `config.env` file from project owner
- [ ] Place `config.env` in `backend/` folder
- [ ] Test run all three services
- [ ] Verify you can access the app at `http://localhost:3000`

### Before Starting Work Each Day:
- [ ] Open GitHub Desktop
- [ ] Click "Fetch origin"
- [ ] Click "Pull origin" if updates available
- [ ] Start coding!

### After Making Changes:
- [ ] Save all files in your editor
- [ ] Open GitHub Desktop
- [ ] Review changed files
- [ ] Write commit message
- [ ] Click "Commit to main"
- [ ] Click "Push origin"

---

## 🎓 Learning Resources

- **GitHub Desktop Docs**: https://docs.github.com/en/desktop
- **Git Tutorial**: https://www.atlassian.com/git/tutorials
- **GitHub Guides**: https://guides.github.com/

---

## 🤝 Need Help?

If you or your friend encounter issues:
1. Check this guide's troubleshooting section
2. Google the error message
3. Ask on Stack Overflow
4. Open an issue on GitHub
5. Contact project owner

---

**Happy Collaborating! 🚀**
