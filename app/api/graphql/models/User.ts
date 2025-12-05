import mongoose from "mongoose";

export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  MANAGER = "MANAGER",
  CASHIER = "CASHIER",
}

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      enum: Object.values(UserRole),
      default: UserRole.CASHIER,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    permissions: {
      type: Object,
      default: {},
    },
    shiftScheduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShiftSchedule",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
// Note: username already has unique index from schema definition
userSchema.index({ role: 1 }); // For filtering by role
userSchema.index({ isActive: 1 }); // For active user queries
userSchema.index({ createdAt: -1 }); // For sorting by creation date

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
