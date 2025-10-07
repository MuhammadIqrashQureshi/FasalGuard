const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🌐 MongoDB Atlas Setup Helper');
console.log('=============================\n');

console.log('Please follow these steps:');
console.log('1. Go to https://www.mongodb.com/atlas');
console.log('2. Create a free account');
console.log('3. Create a new cluster (M0 Sandbox)');
console.log('4. Add a database user with read/write permissions');
console.log('5. Add your IP address to Network Access (or allow all: 0.0.0.0/0)');
console.log('6. Get your connection string\n');

rl.question('Enter your MongoDB Atlas connection string: ', (connectionString) => {
  if (!connectionString.includes('mongodb+srv://')) {
    console.log('❌ Invalid connection string format. Please make sure it starts with "mongodb+srv://"');
    rl.close();
    return;
  }

  // Add database name if not present
  if (!connectionString.includes('/fasalguard')) {
    connectionString = connectionString.replace('?', '/fasalguard?');
  }

  // Update config.env file
  const configPath = path.join(__dirname, 'backend', 'config.env');
  const configContent = `PORT=5000
# MongoDB Atlas Connection String
MONGODB_URI=${connectionString}
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random
JWT_EXPIRE=7d
NODE_ENV=development`;

  try {
    fs.writeFileSync(configPath, configContent);
    console.log('\n✅ Configuration updated successfully!');
    console.log('📁 Updated file: backend/config.env');
    console.log('\n🚀 You can now start your application:');
    console.log('   cd backend && npm run dev');
    console.log('   npm start (in another terminal)');
  } catch (error) {
    console.log('❌ Error updating configuration:', error.message);
  }

  rl.close();
});

rl.on('close', () => {
  console.log('\n📖 For detailed setup instructions, see: MONGODB_ATLAS_SETUP.md');
  process.exit(0);
});
