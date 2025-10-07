const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const { sendVerificationEmail, sendWelcomeEmail } = require('../middleware/emailService');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Google OAuth sign-in (verify Google ID token)
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { idToken, accessToken } = req.body;
    if (!idToken && !accessToken) {
      return res.status(400).json({ success: false, message: 'ID token or access token is required' });
    }

    const { OAuth2Client } = require('google-auth-library');
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let payload;
    if (idToken) {
      const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
      payload = ticket.getPayload();
    } else {
      // accessToken path: get token info and userinfo
      const tokenInfo = await client.getTokenInfo(accessToken);
      // tokenInfo contains 'email' and 'sub'
      const email = tokenInfo.email;
      const sub = tokenInfo.sub;
      // fetch additional userinfo (name, picture) via Google's userinfo endpoint
      const fetch = require('node-fetch');
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const userInfo = await userInfoRes.json();
      payload = {
        email,
        name: userInfo.name,
        picture: userInfo.picture,
        email_verified: userInfo.email_verified,
        sub
      };
    }
    const { email, name, picture, email_verified } = payload;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Google account email not found' });
    }

    // Find user by email or googleId
    let user = await User.findOne({ email });
    let emailResult = { success: false };
    if (user) {
      // update fields from Google if missing
      let changed = false;
      if (!user.googleId) { user.googleId = payload.sub; changed = true; }
      if (!user.avatar && picture) { user.avatar = picture; changed = true; }
      if (!user.isEmailVerified && email_verified) { user.isEmailVerified = true; changed = true; }
      if (!user.emailVerified && email_verified) { user.emailVerified = true; changed = true; }
      if (changed) await user.save();
    } else {
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: Math.random().toString(36).slice(-12), // random password (user can reset)
        isEmailVerified: !!email_verified,
        emailVerified: !!email_verified,
        googleId: payload.sub,
        avatar: picture || undefined
      });

      // Send welcome email for new Google signups
      try {
        emailResult = await sendWelcomeEmail(user.email, user.name);
        if (!emailResult.success) {
          console.error('Failed to send welcome email (google signup):', emailResult.error);
        }
      } catch (e) {
        console.error('Error sending welcome email (google signup):', e);
      }
    }

    // Update last login
    await user.updateLastLogin();

    // Generate app token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Google authentication successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin
      }
      ,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Google authentication failed' });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Remove any previous pending registration for same email
    await PendingUser.deleteOne({ email });

    // Generate verification token (6-digit OTP)
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create PendingUser (do not create actual User yet)
    const pending = await PendingUser.create({
      name,
      email,
      password,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    });

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Still return success but mention email issue
    }

    res.status(201).json({
      success: true,
      message: 'OTP sent. Please verify your email to complete registration.',
      pending: true,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Update last login
    await user.updateLastLogin();

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name: name || user.name, email: email || user.email },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isEmailVerified: updatedUser.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Verify email with OTP and create the user
// @route   POST /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    // Find pending user with valid verification token
    const pending = await PendingUser.findOne({
      email,
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() }
    });

    if (!pending) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code'
      });
    }

    // Create the actual user now
    const createdUser = await User.create({
      name: pending.name,
      email: pending.email,
      password: pending.password, // already hashed in PendingUser
      isEmailVerified: true
    });

    // Remove pending record
    await PendingUser.deleteOne({ _id: pending._id });

    // Send welcome email
    const emailResult = await sendWelcomeEmail(createdUser.email, createdUser.name);
    
    if (!emailResult.success) {
      console.error('Failed to send welcome email:', emailResult.error);
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        isEmailVerified: createdUser.isEmailVerified
      }
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during email verification'
    });
  }
};

// @desc    Resend verification email (by email)
// @route   POST /api/auth/resend-verification
// @access  Public
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Ensure not already registered
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(404).json({
        success: false,
        message: 'User already registered'
      });
    }

    // Find or create pending
    let pending = await PendingUser.findOne({ email });
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    if (pending) {
      pending.verificationToken = verificationToken;
      pending.verificationTokenExpiresAt = expiresAt;
      await pending.save();
    } else {
      return res.status(404).json({ success: false, message: 'No pending registration for this email' });
    }

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationToken);
    
    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully'
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during resend verification'
    });
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Request password reset (send OTP)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Do not reveal whether user exists
      return res.status(200).json({ success: true, message: 'If an account exists, an OTP has been sent' });
    }

    // Generate 6-digit OTP and set expiry (15 minutes)
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = verificationToken;
    user.verificationTokenExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    // Reuse verification email sender
    try {
      const emailResult = await sendVerificationEmail(user.email, verificationToken);
      if (!emailResult.success) {
        console.error('Failed to send reset OTP email:', emailResult.error);
      }
    } catch (e) {
      console.error('Error sending reset OTP email:', e);
    }

    return res.status(200).json({ success: true, message: 'If an account exists, an OTP has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ success: false, message: 'Server error during password reset request' });
  }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, code and new password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    // Validate OTP and expiry
    if (
      !user.verificationToken ||
      user.verificationToken !== code ||
      !user.verificationTokenExpiresAt ||
      user.verificationTokenExpiresAt.getTime() <= Date.now()
    ) {
      return res.status(400).json({ success: false, message: 'Invalid or expired code' });
    }

    // Update password and clear token
    user.password = newPassword;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: 'Server error during password reset' });
  }
};
