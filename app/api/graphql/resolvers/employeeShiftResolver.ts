import { GraphQLContext } from "../context";
import { verifyToken } from "@/lib/auth";
import User from "../models/User";
import EmployeeShift from "../models/EmployeeShift";
import ShiftSchedule from "../models/ShiftSchedule";

export const employeeShiftResolvers = {
  Query: {
    // Get current user's active shift
    myCurrentShift: async (_: unknown, __: unknown, { request }: GraphQLContext) => {
      const authToken = request.cookies.get("auth_token")?.value ?? "";
      const decodedUser = await verifyToken(authToken);
      
      if (!decodedUser) {
        throw new Error("Not authenticated");
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const shift = await EmployeeShift.findOne({
        userId: decodedUser.id,
        date: { $gte: today },
        status: "IN_PROGRESS",
      }).sort({ createdAt: -1 });

      return shift;
    },

    // Get user's shift history
    myShiftHistory: async (
      _: unknown,
      { limit = 30, offset = 0 }: { limit?: number; offset?: number },
      { request }: GraphQLContext
    ) => {
      const authToken = request.cookies.get("auth_token")?.value ?? "";
      const decodedUser = await verifyToken(authToken);
      
      if (!decodedUser) {
        throw new Error("Not authenticated");
      }

      const shifts = await EmployeeShift.find({ userId: decodedUser.id })
        .sort({ date: -1, createdAt: -1 })
        .limit(limit)
        .skip(offset);

      return shifts;
    },

    // Get all shifts (managers/admins)
    allShifts: async (
      _: unknown,
      { date, status, limit = 50, offset = 0 }: any,
      { request }: GraphQLContext
    ) => {
      const authToken = request.cookies.get("auth_token")?.value ?? "";
      const decodedUser = await verifyToken(authToken);
      
      if (!decodedUser) {
        throw new Error("Not authenticated");
      }

      const currentUser = await User.findById(decodedUser.id);
      
      // Only admins and managers can view all shifts
      if (currentUser?.role !== "SUPER_ADMIN" && currentUser?.role !== "MANAGER") {
        throw new Error("Unauthorized - Only admins and managers can view all shifts");
      }

      const query: any = {};
      
      if (date) {
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        query.date = { $gte: targetDate, $lt: nextDay };
      }
      
      if (status) {
        query.status = status;
      }

      const shifts = await EmployeeShift.find(query)
        .sort({ date: -1, createdAt: -1 })
        .limit(limit)
        .skip(offset);

      return shifts;
    },

    // Get shift by ID
    shiftById: async (
      _: unknown,
      { id }: { id: string },
      { request }: GraphQLContext
    ) => {
      const authToken = request.cookies.get("auth_token")?.value ?? "";
      const decodedUser = await verifyToken(authToken);
      
      if (!decodedUser) {
        throw new Error("Not authenticated");
      }

      const shift = await EmployeeShift.findById(id);
      
      if (!shift) {
        throw new Error("Shift not found");
      }

      const currentUser = await User.findById(decodedUser.id);
      
      // Users can only view their own shifts, admins/managers can view all
      if (
        shift.userId.toString() !== decodedUser.id &&
        currentUser?.role !== "SUPER_ADMIN" &&
        currentUser?.role !== "MANAGER"
      ) {
        throw new Error("Unauthorized");
      }

      return shift;
    },
  },

  Mutation: {
    recordShiftEvent: async (
      _: unknown,
      { input }: { input: { 
        eventType: string; 
        photo: string; 
        notes?: string;
      } },
      { request }: GraphQLContext
    ) => {
      try {
        const authToken = request.cookies.get("auth_token")?.value ?? "";
        const decodedUser = await verifyToken(authToken);
        
        if (!decodedUser) {
          throw new Error("Not authenticated");
        }

        const user = await User.findById(decodedUser.id);
        if (!user) {
          throw new Error("User not found");
        }

        // Get user's assigned shift schedule
        let shiftSchedule = null;
        if (user.shiftScheduleId) {
          shiftSchedule = await ShiftSchedule.findById(user.shiftScheduleId);
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Find or create shift for today
        let shift = await EmployeeShift.findOne({
          userId: decodedUser.id,
          date: { $gte: today },
          status: "IN_PROGRESS",
        });

        const eventTimestamp = new Date();

        // Validate event sequence - more flexible now
        if (shift) {
          const lastEvent = shift.events[shift.events.length - 1];
          
          // Only prevent duplicate SHIFT_START
          if (input.eventType === "SHIFT_START") {
            const hasShiftStart = shift.events.some((e: any) => e.eventType === "SHIFT_START");
            if (hasShiftStart) {
              throw new Error("Shift already started");
            }
          }
          
          // Prevent duplicate SHIFT_END
          if (input.eventType === "SHIFT_END") {
            const hasShiftEnd = shift.events.some((e: any) => e.eventType === "SHIFT_END");
            if (hasShiftEnd) {
              throw new Error("Shift already ended");
            }
          }

          // Prevent ending lunch break without starting it
          if (input.eventType === "LUNCH_BREAK_END") {
            const hasLunchStart = shift.events.some((e: any) => e.eventType === "LUNCH_BREAK_START");
            const hasLunchEnd = shift.events.some((e: any) => e.eventType === "LUNCH_BREAK_END");
            if (!hasLunchStart) {
              throw new Error("Must start lunch break first");
            }
            if (hasLunchEnd) {
              throw new Error("Lunch break already ended");
            }
          }

          // Prevent starting lunch break twice
          if (input.eventType === "LUNCH_BREAK_START") {
            const hasLunchStart = shift.events.some((e: any) => e.eventType === "LUNCH_BREAK_START");
            const hasLunchEnd = shift.events.some((e: any) => e.eventType === "LUNCH_BREAK_END");
            if (hasLunchStart && !hasLunchEnd) {
              throw new Error("Lunch break already started");
            }
          }
        } else {
          // Create new shift
          if (input.eventType !== "SHIFT_START") {
            throw new Error("Must start shift first");
          }

          // Use shift schedule if available, otherwise use defaults
          let scheduledStartTime = new Date(today);
          scheduledStartTime.setHours(8, 0, 0, 0); // Default 8:00 AM

          if (shiftSchedule && shiftSchedule.shiftStartTime) {
            const [hours, minutes] = shiftSchedule.shiftStartTime.split(':');
            scheduledStartTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          }

          // Calculate attendance status based on timestamp
          let attendanceStatus = "ON_TIME";
          const lateThresholdMinutes = 15;
          const minutesLate = (eventTimestamp.getTime() - scheduledStartTime.getTime()) / (1000 * 60);
          
          if (minutesLate > lateThresholdMinutes) {
            attendanceStatus = "LATE";
          }

          shift = new EmployeeShift({
            userId: decodedUser.id,
            employeeName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username,
            date: today,
            attendanceStatus: attendanceStatus,
            scheduledStartTime: scheduledStartTime,
            actualStartTime: eventTimestamp,
            events: [],
            status: "IN_PROGRESS",
          });
        }

        // Add event
        shift.events.push({
          eventType: input.eventType,
          timestamp: eventTimestamp,
          photo: input.photo,
          notes: input.notes || "",
        } as any);

        // If shift end, calculate total hours and mark as completed
        if (input.eventType === "SHIFT_END") {
          const shiftStart = shift.events.find((e: any) => e.eventType === "SHIFT_START");
          if (shiftStart) {
            let totalMinutes = (eventTimestamp.getTime() - new Date(shiftStart.timestamp).getTime()) / (1000 * 60);
            
            // Subtract lunch break time
            const lunchStart = shift.events.find((e: any) => e.eventType === "LUNCH_BREAK_START");
            const lunchEnd = shift.events.find((e: any) => e.eventType === "LUNCH_BREAK_END");
            
            if (lunchStart && lunchEnd) {
              const lunchMinutes = (new Date(lunchEnd.timestamp).getTime() - new Date(lunchStart.timestamp).getTime()) / (1000 * 60);
              totalMinutes -= lunchMinutes;
            }
            
            shift.totalHoursWorked = totalMinutes / 60;
          }
          shift.status = "COMPLETED";
        }

        await shift.save();
        return shift;
      } catch (error: any) {
        console.error("Record shift event error:", error);
        throw new Error(error.message || "Failed to record shift event");
      }
    },
  },
};
