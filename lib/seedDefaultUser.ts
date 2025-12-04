// lib/seedDefaultUser.ts

import User from "@/app/api/graphql/models/User";
import bcrypt from "bcryptjs";

export async function seedDefaultUser() {
  const adminPassword: string = process.env.ADMIN_PASSWORD ?? "secret-password";
  
  // Full permissions for SUPER_ADMIN
  const fullPermissions = {
    dashboard: { view: true },
    inventory: { view: true, addEdit: true, delete: true },
    product: { view: true, addEdit: true, delete: true },
    pointOfSale: { view: true, addEdit: true, void: true },
    transaction: { view: true, void: true, changeItem: true, refund: true },
    cashDrawer: { view: true, openClose: true, cashInOut: true },
    discount: { view: true, addEdit: true, delete: true },
    serviceCharge: { view: true, addEdit: true, delete: true },
    settings: { view: true, manageUsers: true },
  };

  // Check if admin user exists
  const existingAdmin = await User.findOne({ username: "admin" });

  if (existingAdmin) {
    // Update existing SUPER_ADMIN with full permissions if they don't have any
    if (existingAdmin.role === "SUPER_ADMIN" && !existingAdmin.permissions) {
      existingAdmin.permissions = fullPermissions;
      await existingAdmin.save();
      console.log("✅ Updated existing SUPER_ADMIN with full permissions");
    } else {
      console.log("ℹ️ Admin user already exists with proper setup");
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
