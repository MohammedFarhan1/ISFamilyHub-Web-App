const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    enum: ['Farhan', 'Sheerin']
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const Admin = mongoose.model('Admin', adminSchema);

async function initializeDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Create admin users
    const admins = [
      {
        username: 'Farhan',
        password: 'Farhan8776',
        name: 'Farhan'
      },
      {
        username: 'Sheerin',
        password: 'Shafan',
        name: 'Sheerin'
      }
    ];

    for (const adminData of admins) {
      const existingAdmin = await Admin.findOne({ username: adminData.username });
      if (!existingAdmin) {
        const admin = new Admin(adminData);
        await admin.save();
        console.log(`✅ Created admin user: ${adminData.username}`);
      } else {
        console.log(`ℹ️  Admin user already exists: ${adminData.username}`);
      }
    }

    console.log('✅ Database initialization complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();