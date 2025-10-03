const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/birthday-greeting-app';
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const clearUsers = async () => {
  try {
    console.log('🗑️  Clearing users collection...');
    
    // Drop the entire users collection to remove old indexes
    await User.collection.drop();
    console.log('✅ Users collection dropped successfully');
    
    // Recreate the admin user
    const adminUser = await User.create({
      name: 'Admin User',
      userId: 'admin',
      password: 'admin123',
      isActive: true
    });
    
    console.log('✅ Admin user recreated successfully!');
    console.log('\n🔑 Admin Login Credentials:');
    console.log('   User ID: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    if (error.code === 26) {
      console.log('ℹ️  Users collection does not exist, creating admin user...');
      // Collection doesn't exist, just create admin user
      const adminUser = await User.create({
        name: 'Admin User',
        userId: 'admin',
        password: 'admin123',
        isActive: true
      });
      console.log('✅ Admin user created successfully!');
    } else {
      console.error('❌ Error clearing users:', error.message);
      throw error;
    }
  }
};

const main = async () => {
  try {
    await connectDB();
    await clearUsers();
    console.log('\n🎉 Users collection cleared and admin recreated!');
  } catch (error) {
    console.error('💥 Operation failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
main();
