import mongoose from "mongoose";
import ShiftSchedule from "../app/api/graphql/models/ShiftSchedule";
import connectToDatabase from "./mongodb";

async function seedDefaultShiftSchedule() {
  try {
    await connectToDatabase();

    // Check if any shift schedules exist
    const count = await ShiftSchedule.countDocuments();
    
    if (count === 0) {
      // Create default shift schedule
      const defaultSchedule = await ShiftSchedule.create({
        name: "Standard Day Shift",
        shiftStartTime: "08:00",
        breakStartTime: "12:00",
        breakEndTime: "13:00",
        shiftEndTime: "17:00",
        isActive: true,
      });

      console.log("✅ Default shift schedule created:", defaultSchedule.name);
    } else {
      console.log("ℹ️  Shift schedules already exist. Skipping seed.");
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error seeding default shift schedule:", error);
    process.exit(1);
  }
}

seedDefaultShiftSchedule();
