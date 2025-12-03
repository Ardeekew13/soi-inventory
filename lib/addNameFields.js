const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  isActive: Boolean,
  firstName: String,
  lastName: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function addNameFields() {
  try {
    await mongoose.connect('mongodb://localhost:27017/soi-inventory');
    console.log('Connected to MongoDB\n');
    
    // Update all users to have firstName and lastName fields
    const result = await User.updateMany(
      { firstName: { $exists: false } },
      { 
        $set: { 
          firstName: null,
          lastName: null
        } 
      }
    );
    
    console.log('✅ Updated users:', result.modifiedCount);
    
    // Show all users
    const users = await User.find();
    console.log('\nUsers in database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    users.forEach(user => {
      console.log(`Username: ${user.username}`);
      console.log(`Role: ${user.role}`);
      console.log(`First Name: ${user.firstName}`);
      console.log(`Last Name: ${user.lastName}`);
      console.log(`Is Active: ${user.isActive}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
    
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addNameFields();
