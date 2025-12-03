import { GraphQLContext } from "../context";
import { verifyToken } from "@/lib/auth";
import User from "../models/User";
import ShiftSchedule from "../models/ShiftSchedule";

export const shiftScheduleResolvers = {
  ShiftSchedule: {
    createdAt: (parent: any) => {
      return parent.createdAt ? new Date(parent.createdAt).getTime().toString() : null;
    },
    updatedAt: (parent: any) => {
      return parent.updatedAt ? new Date(parent.updatedAt).getTime().toString() : null;
    },
    isDefault: (parent: any) => {
      return parent.isDefault ?? false;
    },
  },

  Query: {
    // Get all shift schedules
    shiftSchedules: async (_: unknown, __: unknown, { request }: GraphQLContext) => {
      const authToken = request.cookies.get("auth_token")?.value ?? "";
      const decodedUser = await verifyToken(authToken);
      
      if (!decodedUser) {
        throw new Error("Not authenticated");
      }

      const schedules = await ShiftSchedule.find({ isActive: true }).sort({ name: 1 });
      return schedules;
    },

    // Get shift schedule by ID
    shiftScheduleById: async (
      _: unknown,
      { id }: { id: string },
      { request }: GraphQLContext
    ) => {
      const authToken = request.cookies.get("auth_token")?.value ?? "";
      const decodedUser = await verifyToken(authToken);
      
      if (!decodedUser) {
        throw new Error("Not authenticated");
      }

      const schedule = await ShiftSchedule.findById(id);
      
      if (!schedule) {
        throw new Error("Shift schedule not found");
      }

      return schedule;
    },
  },

  Mutation: {
    // Create shift schedule (managers/admins only)
    createShiftSchedule: async (
      _: unknown,
      { input }: { input: {
        name: string;
        shiftStartTime: string;
        breakStartTime: string;
        breakEndTime: string;
        shiftEndTime: string;
        isDefault?: boolean;
      } },
      { request }: GraphQLContext
    ) => {
      try {
        const authToken = request.cookies.get("auth_token")?.value ?? "";
        const decodedUser = await verifyToken(authToken);
        
        if (!decodedUser) {
          throw new Error("Not authenticated");
        }

        const currentUser = await User.findById(decodedUser.id);
        
        // Only admins and managers can create shift schedules
        if (currentUser?.role !== "SUPER_ADMIN" && currentUser?.role !== "MANAGER") {
          throw new Error("Unauthorized - Only admins and managers can create shift schedules");
        }

        // Validate time format (HH:mm)
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(input.shiftStartTime) || 
            !timeRegex.test(input.breakStartTime) || 
            !timeRegex.test(input.breakEndTime) || 
            !timeRegex.test(input.shiftEndTime)) {
          throw new Error("Invalid time format. Use HH:mm (e.g., 08:00)");
        }

        // If setting as default, unset all other defaults first
        if (input.isDefault === true) {
          await ShiftSchedule.updateMany(
            {},
            { $set: { isDefault: false } }
          );
        }

        const schedule = new ShiftSchedule({
          name: input.name,
          shiftStartTime: input.shiftStartTime,
          breakStartTime: input.breakStartTime,
          breakEndTime: input.breakEndTime,
          shiftEndTime: input.shiftEndTime,
          isActive: true,
          isDefault: input.isDefault || false,
        });

        await schedule.save();
        return schedule;
      } catch (error: any) {
        console.error("Create shift schedule error:", error);
        throw new Error(error.message || "Failed to create shift schedule");
      }
    },

    // Update shift schedule (managers/admins only)
    updateShiftSchedule: async (
      _: unknown,
      { input }: { input: {
        id: string;
        name?: string;
        shiftStartTime?: string;
        breakStartTime?: string;
        breakEndTime?: string;
        shiftEndTime?: string;
        isActive?: boolean;
        isDefault?: boolean;
      } },
      { request }: GraphQLContext
    ) => {
      try {
        const authToken = request.cookies.get("auth_token")?.value ?? "";
        const decodedUser = await verifyToken(authToken);
        
        if (!decodedUser) {
          throw new Error("Not authenticated");
        }

        const currentUser = await User.findById(decodedUser.id);
        
        if (currentUser?.role !== "SUPER_ADMIN" && currentUser?.role !== "MANAGER") {
          throw new Error("Unauthorized - Only admins and managers can update shift schedules");
        }

        const schedule = await ShiftSchedule.findById(input.id);
        
        if (!schedule) {
          throw new Error("Shift schedule not found");
        }

        // Validate time format if provided
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        if (input.shiftStartTime && !timeRegex.test(input.shiftStartTime)) {
          throw new Error("Invalid shift start time format. Use HH:mm");
        }
        if (input.breakStartTime && !timeRegex.test(input.breakStartTime)) {
          throw new Error("Invalid break start time format. Use HH:mm");
        }
        if (input.breakEndTime && !timeRegex.test(input.breakEndTime)) {
          throw new Error("Invalid break end time format. Use HH:mm");
        }
        if (input.shiftEndTime && !timeRegex.test(input.shiftEndTime)) {
          throw new Error("Invalid shift end time format. Use HH:mm");
        }

        // If setting as default, unset all other defaults first
        if (input.isDefault === true) {
          await ShiftSchedule.updateMany(
            { _id: { $ne: input.id } },
            { $set: { isDefault: false } }
          );
        }

        // Update fields
        if (input.name !== undefined) schedule.name = input.name;
        if (input.shiftStartTime !== undefined) schedule.shiftStartTime = input.shiftStartTime;
        if (input.breakStartTime !== undefined) schedule.breakStartTime = input.breakStartTime;
        if (input.breakEndTime !== undefined) schedule.breakEndTime = input.breakEndTime;
        if (input.shiftEndTime !== undefined) schedule.shiftEndTime = input.shiftEndTime;
        if (input.isActive !== undefined) schedule.isActive = input.isActive;
        if (input.isDefault !== undefined) schedule.isDefault = input.isDefault;

        await schedule.save();
        return schedule;
      } catch (error: any) {
        console.error("Update shift schedule error:", error);
        throw new Error(error.message || "Failed to update shift schedule");
      }
    },

    // Delete shift schedule (soft delete by setting isActive to false)
    deleteShiftSchedule: async (
      _: unknown,
      { id }: { id: string },
      { request }: GraphQLContext
    ) => {
      try {
        const authToken = request.cookies.get("auth_token")?.value ?? "";
        const decodedUser = await verifyToken(authToken);
        
        if (!decodedUser) {
          throw new Error("Not authenticated");
        }

        const currentUser = await User.findById(decodedUser.id);
        
        if (currentUser?.role !== "SUPER_ADMIN" && currentUser?.role !== "MANAGER") {
          throw new Error("Unauthorized - Only admins and managers can delete shift schedules");
        }

        const schedule = await ShiftSchedule.findById(id);
        
        if (!schedule) {
          throw new Error("Shift schedule not found");
        }

        // Check if any users are assigned to this schedule
        const usersWithSchedule = await User.countDocuments({ shiftScheduleId: id });
        
        if (usersWithSchedule > 0) {
          throw new Error(`Cannot delete schedule. ${usersWithSchedule} user(s) are assigned to this schedule.`);
        }

        // Soft delete
        schedule.isActive = false;
        await schedule.save();

        return true;
      } catch (error: any) {
        console.error("Delete shift schedule error:", error);
        throw new Error(error.message || "Failed to delete shift schedule");
      }
    },
  },
};
