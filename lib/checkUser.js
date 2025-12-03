const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  role: String,
  isActive: Boolean,
  fullName: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function checkUser() {
  try {
    await mongoose.connect('mongodb://localhost:27017/soi-inventory');
    console.log('Connected to MongoDB\n');
    
    const users = await User.find();
    console.log('Users in database:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    users.forEach(user => {
      console.log(`ID: ${user._id}`);
      console.log(`Username: ${user.username}`);
      console.log(`Role: ${user.role}`);
      console.log(`Is Active: ${user.isActive}`);
      console.log(`Password Hash: ${user.password}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();
