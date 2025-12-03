import bcrypt from "bcryptjs";

const password = "vAoNeMx3";

async function hashPassword() {
  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("\n🔐 Password Hashing Result:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Original Password:", password);
  console.log("Hashed Password:", hashedPassword);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  console.log("Copy the hashed password above and update it in MongoDB Compass");
}

hashPassword();
