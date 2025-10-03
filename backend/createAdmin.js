const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const createAdmin = async () => {
  try {
    console.log('🌱 Creating admin user...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ userId: 'admin' });
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      return;
    }
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      userId: 'admin',
      password: 'admin123',
      isActive: true
    });
    
    console.log('✅ Admin user created successfully!');
    console.log('\n🔑 Admin Login Credentials:');
    console.log('   User ID: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await createAdmin();
    console.log('\n🎉 Admin creation completed successfully!');
  } catch (error) {
    console.error('💥 Admin creation failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
main();
