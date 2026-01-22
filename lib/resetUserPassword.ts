import "dotenv/config";
import bcrypt from "bcryptjs";
import connectDB from "./mongodb";
import User from "../app/api/graphql/models/User";

async function resetUserPassword(username: string, newPassword: string) {
  try {
    await connectDB();
    
    const user = await User.findOne({ username });
    
    if (!user) {
      console.error(`User "${username}" not found`);
      process.exit(1);
    }
    
    console.log(`Found user: ${user.username} (${user._id})`);
    console.log(`Current password hash: ${user.password}`);
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log(`New password hash: ${hashedPassword}`);
    
    user.password = hashedPassword;
    await user.save();
    
    console.log(`✅ Password updated successfully for user: ${username}`);
    
    // Test the password
    const testMatch = await bcrypt.compare(newPassword, hashedPassword);
    console.log(`Password verification test: ${testMatch ? '✅ PASS' : '❌ FAIL'}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error resetting password:", error);
    process.exit(1);
  }
}

// Get username and password from command line
const username = process.argv[2] || "admin";
const password = process.argv[3] || "admin123";

console.log(`Resetting password for user: ${username}`);
resetUserPassword(username, password);
