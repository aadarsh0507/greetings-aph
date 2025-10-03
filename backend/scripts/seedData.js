const mongoose = require('mongoose');
require('dotenv').config();

const Patient = require('../models/Patient');
const Template = require('../models/Template');
const User = require('../models/User');

// Sample patients data
const samplePatients = [
  {
    name: 'John Doe',
    mobile: '+1234567890',
    dob: new Date('1990-05-15'),
    email: 'john.doe@example.com'
  },
  {
    name: 'Jane Smith',
    mobile: '+1234567891',
    dob: new Date('1985-08-22'),
    email: 'jane.smith@example.com'
  },
  {
    name: 'Mike Johnson',
    mobile: '+1234567892',
    dob: new Date('1992-12-03'),
    email: 'mike.johnson@example.com'
  },
  {
    name: 'Sarah Wilson',
    mobile: '+1234567893',
    dob: new Date('1988-03-18'),
    email: 'sarah.wilson@example.com'
  },
  {
    name: 'David Brown',
    mobile: '+1234567894',
    dob: new Date('1995-07-25'),
    email: 'david.brown@example.com'
  },
  {
    name: 'Lisa Davis',
    mobile: '+1234567895',
    dob: new Date('1991-11-12'),
    email: 'lisa.davis@example.com'
  },
  {
    name: 'Tom Anderson',
    mobile: '+1234567896',
    dob: new Date('1987-04-08'),
    email: 'tom.anderson@example.com'
  },
  {
    name: 'Emily Taylor',
    mobile: '+1234567897',
    dob: new Date('1993-09-30'),
    email: 'emily.taylor@example.com'
  }
];

// Sample templates data
const sampleTemplates = [
  {
    name: 'Birthday Wishes',
    message: 'Happy Birthday {name}! 🎉 Wishing you a wonderful day filled with joy, laughter, and all your favorite things. May this new year bring you endless happiness and success!',
    category: 'birthday'
  },
  {
    name: 'Formal Birthday',
    message: 'Dear {name}, On your special day, we extend our warmest birthday wishes. May this year ahead be filled with prosperity, good health, and memorable moments. Happy Birthday!',
    category: 'birthday'
  },
  {
    name: 'Fun Birthday',
    message: 'Hey {name}! 🎂 Another year older, another year wiser (hopefully)! Hope your birthday is as awesome as you are. Don\'t forget to make a wish when you blow out those candles!',
    category: 'birthday'
  },
  {
    name: 'Birthday Blessings',
    message: 'Happy Birthday {name}! 🙏 May God bless you with good health, happiness, and success in all your endeavors. Wishing you many more years of joy and fulfillment.',
    category: 'birthday'
  },
  {
    name: 'Simple Birthday',
    message: 'Happy Birthday {name}! Hope you have a fantastic day celebrating another year of life. Enjoy your special day!',
    category: 'birthday'
  },
  {
    name: 'Anniversary Wishes',
    message: 'Happy Anniversary {name}! 🎊 Celebrating another year of wonderful memories and milestones. Here\'s to many more years of happiness together!',
    category: 'anniversary'
  },
  {
    name: 'Holiday Greetings',
    message: 'Season\'s Greetings {name}! 🎄 Wishing you and your loved ones a wonderful holiday season filled with peace, joy, and cherished moments.',
    category: 'holiday'
  }
];

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/birthday-greeting-app';
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Clear existing data
    await Patient.deleteMany({});
    await Template.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️  Cleared existing data');
    
    // Add some patients with today's and tomorrow's birthdays
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    // Create patients with today's birthday
    const todayPatients = [
      {
        name: 'Birthday Today Patient 1',
        mobile: '+1987654321',
        dob: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        email: 'today1@example.com',
        gender: 'Male'
      },
      {
        name: 'Birthday Today Patient 2',
        mobile: '+1987654322',
        dob: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        email: 'today2@example.com',
        gender: 'Female'
      }
    ];
    
    // Create patients with tomorrow's birthday
    const tomorrowPatients = [
      {
        name: 'Birthday Tomorrow Patient 1',
        mobile: '+1987654323',
        dob: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
        email: 'tomorrow1@example.com',
        gender: 'Male'
      },
      {
        name: 'Birthday Tomorrow Patient 2',
        mobile: '+1987654324',
        dob: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate()),
        email: 'tomorrow2@example.com',
        gender: 'Female'
      }
    ];
    
    // Add gender to sample patients
    const samplePatientsWithGender = samplePatients.map((patient, index) => ({
      ...patient,
      gender: index % 2 === 0 ? 'Male' : 'Female'
    }));
    
    // Combine all patients
    const allPatients = [...samplePatientsWithGender, ...todayPatients, ...tomorrowPatients];
    
    // Seed patients
    const createdPatients = await Patient.insertMany(allPatients);
    console.log(`👥 Created ${createdPatients.length} patients`);
    
    // Seed templates
    const createdTemplates = await Template.insertMany(sampleTemplates);
    console.log(`📝 Created ${createdTemplates.length} templates`);
    
    // Create default admin user
    const defaultUser = await User.create({
      name: 'Admin User',
      userId: 'admin',
      password: 'admin123',
      isActive: true
    });
    console.log(`👤 Created default admin user: ${defaultUser.userId}`);
    
    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Patients: ${createdPatients.length}`);
    console.log(`   - Templates: ${createdTemplates.length}`);
    console.log(`   - Users: 1 (admin)`);
    console.log(`   - Today's birthdays: ${todayPatients.length}`);
    console.log(`   - Tomorrow's birthdays: ${tomorrowPatients.length}`);
    console.log('\n🔑 Default Login Credentials:');
    console.log('   User ID: admin');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('\n🎉 Seeding process completed successfully!');
  } catch (error) {
    console.error('💥 Seeding process failed:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the seeding script
if (require.main === module) {
  main();
}

module.exports = { seedDatabase, samplePatients, sampleTemplates };
