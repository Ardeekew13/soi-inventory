// lib/seedDefaultUser.ts

import User from "@/app/api/graphql/models/User";
import bcrypt from "bcryptjs";
import { getFullPermissions } from "@/utils/permissions";

export async function seedDefaultUser() {
  const adminPassword: string = process.env.ADMIN_PASSWORD ?? "secret-password";
  
  // Get full permissions using the centralized function
  const fullPermissions = getFullPermissions();

  // Check if admin user exists
  const existingAdmin = await User.findOne({ username: "admin" });

  if (existingAdmin) {
    // Only update SUPER_ADMIN if they have NO permissions at all (empty or null)
    if (existingAdmin.role === "SUPER_ADMIN") {
      const hasNoPermissions = 
        !existingAdmin.permissions || 
        Object.keys(existingAdmin.permissions).length === 0;
      
      if (hasNoPermissions) {
        existingAdmin.permissions = fullPermissions;
        await existingAdmin.save();
        console.log("✅ Updated existing SUPER_ADMIN with full permissions");
      } else {
        console.log("ℹ️ Admin user already exists with proper setup");
      }
    }
    return;
  }

  // Create new admin user if none exists
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const newUser = await User.create({
      username: "admin",
      password: hashedPassword,
      role: "SUPER_ADMIN",
      permissions: fullPermissions,
    });

    console.log("✅ Default SUPER_ADMIN user created:", newUser.username);
  }
}
