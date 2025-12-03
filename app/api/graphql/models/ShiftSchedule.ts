import mongoose from "mongoose";

const shiftScheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    shiftStartTime: {
      type: String, // Format: "HH:mm" (e.g., "08:00")
      required: true,
    },
    breakStartTime: {
      type: String, // Format: "HH:mm" (e.g., "12:00")
      required: true,
    },
    breakEndTime: {
      type: String, // Format: "HH:mm" (e.g., "13:00")
      required: true,
    },
    shiftEndTime: {
      type: String, // Format: "HH:mm" (e.g., "17:00")
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
shiftScheduleSchema.index({ isActive: 1 });
shiftScheduleSchema.index({ name: 1 });

const ShiftSchedule =
  mongoose.models.ShiftSchedule || mongoose.model("ShiftSchedule", shiftScheduleSchema);

export default ShiftSchedule;
