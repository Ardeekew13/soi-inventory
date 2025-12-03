import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User, { UserRole } from "@/app/api/graphql/models/User";

const MONGODB_URI = process.env.MONGODB_URI_DEV || "mongodb://localhost:27017/soi-inventory";

const users = [
  {
    username: "superadmin",
    password: "SuperAdmin123!",
    role: UserRole.SUPER_ADMIN,
    fullName: "Super Administrator",
  },
  {
    username: "manager",
    password: "Manager123!",
    role: UserRole.MANAGER,
    fullName: "Store Manager",
  },
  {
    username: "cashier1",
    password: "Cashier123!",
    role: UserRole.CASHIER,
    fullName: "Cashier One",
  },
  {
    username: "cashier2",
    password: "Cashier123!",
    role: UserRole.CASHIER,
    fullName: "Cashier Two",
  },
];

async function seedUsers() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("👤 Creating users...");
    for (const userData of users) {
      // Check if user already exists
      const existingUser = await User.findOne({ username: userData.username });
      if (existingUser) {
        console.log(`⏭️  User ${userData.username} already exists, skipping...`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        username: userData.username,
        password: hashedPassword,
        role: userData.role,
        fullName: userData.fullName,
        isActive: true,
      });
      console.log(`✅ Created ${userData.role}: ${userData.username}`);
    }

    console.log("\n🎉 Seeding completed successfully!");
    console.log("\n📝 User Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Role".padEnd(15) + " | " + "Username".padEnd(15) + " | " + "Password".padEnd(20) + " | " + "Full Name");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    users.forEach((user) => {
      console.log(
        user.role.padEnd(15) + 
        " | " + 
        user.username.padEnd(15) + 
        " | " + 
        user.password.padEnd(20) +
        " | " +
        user.fullName
      );
    });
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    await mongoose.connection.close();
    console.log("🔌 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
