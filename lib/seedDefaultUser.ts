// lib/seedDefaultUser.ts

import User from "@/app/api/graphql/models/User";
import bcrypt from "bcryptjs";

export async function seedDefaultUser() {
  const adminPassword: string = process.env.ADMIN_PASSWORD ?? "secret-password";
  const userCount = await User.countDocuments();

  if (userCount === 0) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const newUser = await User.create({
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
    });

    console.log("✅ Default admin user created:", newUser.username);
  } else {
    console.log("ℹ️ Users already exist — skipping seed");
  }
}
