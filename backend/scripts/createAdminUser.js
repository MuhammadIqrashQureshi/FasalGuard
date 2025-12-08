/**
 * Script to create an admin user in MongoDB
 * Run this script: node backend/scripts/createAdminUser.js
 */

require('dotenv').config({ path: './backend/config.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@fasalguard.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      
      // Update password if needed
      const hashedPassword = await bcrypt.hash('Root@pass1', 10);
      existingAdmin.password = hashedPassword;
      existingAdmin.role = 'admin';
      existingAdmin.accountStatus = 'active';
      existingAdmin.isEmailVerified = true;
      existingAdmin.emailVerified = true;
      await existingAdmin.save();
      console.log('✅ Admin password updated to: Root@pass1');
      
      process.exit(0);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('Root@pass1', 10);

    // Create admin user
    const adminUser = await User.create({
      name: 'FasalGuard Admin',
      email: 'admin@fasalguard.com',
      password: hashedPassword,
      role: 'admin',
      accountStatus: 'active',
      isEmailVerified: true,
      emailVerified: true,
      createdAt: new Date(),
      lastLogin: new Date()
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@fasalguard.com');
    console.log('🔒 Password: Root@pass1');
    console.log('👤 Role:', adminUser.role);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
