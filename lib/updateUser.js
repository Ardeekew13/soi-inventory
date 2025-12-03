const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  isActive: Boolean,
  fullName: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function updateUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/soi-inventory');
    console.log('Connected to MongoDB\n');
    
    const result = await User.findOneAndUpdate(
      { username: 'admin' },
      { 
        isActive: true,
        role: 'SUPER_ADMIN'
      },
      { new: true }
    );
    
    console.log('✅ User updated successfully:');
    console.log(`Username: ${result.username}`);
    console.log(`Role: ${result.role}`);
    console.log(`Is Active: ${result.isActive}`);
    
    await mongoose.connection.close();
    console.log('\n🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateUser();
