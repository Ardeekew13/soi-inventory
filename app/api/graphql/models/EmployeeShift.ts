import mongoose from "mongoose";

const shiftEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: ["SHIFT_START", "LUNCH_BREAK_START", "LUNCH_BREAK_END", "SHIFT_END"],
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    photo: {
      type: String, // Cloudinary URL or undefined if no photo
      required: false,
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
    timestamps: false,
  }
);

const employeeShiftSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    employeeName: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    attendanceStatus: {
      type: String,
      enum: ["ON_TIME", "LATE", "HALF_DAY", "ABSENT"],
      default: "ON_TIME",
    },
    scheduledStartTime: {
      type: Date,
    },
    actualStartTime: {
      type: Date,
    },
    events: [shiftEventSchema],
    totalHoursWorked: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["IN_PROGRESS", "COMPLETED"],
      default: "IN_PROGRESS",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
employeeShiftSchema.index({ userId: 1, date: -1 }); // User's shifts by date
employeeShiftSchema.index({ date: -1 }); // All shifts by date
employeeShiftSchema.index({ status: 1 }); // Filter by status
employeeShiftSchema.index({ userId: 1, status: 1 }); // User's active shifts

const EmployeeShift =
  mongoose.models.EmployeeShift || mongoose.model("EmployeeShift", employeeShiftSchema);

export default EmployeeShift;
