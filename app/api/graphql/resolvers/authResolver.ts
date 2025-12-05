import { generateToken, verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { GraphQLContext } from "../context";
import User, { UserRole } from "../models/User";
import ShiftSchedule from "../models/ShiftSchedule";
import { successResponse, errorResponse } from "../utils/response";

export const authResolvers = {
  User: {
    // Field resolver for shiftSchedule
    shiftSchedule: async (parent: any) => {
      if (!parent.shiftScheduleId) return null;
      try {
        const schedule = await ShiftSchedule.findById(parent.shiftScheduleId);
        return schedule;
      } catch (error) {
        console.error("Error fetching shift schedule:", error);
        return null;
      }
    },
  },
  
  Query: {
    me: async (_: unknown, __: unknown, { user }: GraphQLContext) => {
      if (!user) {
        return null;
      }

      const dbUser = await User.findById(user.id);
      if (!dbUser) {
        return null;
      }
      
      // Ensure isActive has a default value
      return {
        ...dbUser.toObject(),
        isActive: dbUser.isActive ?? true,
        permissions: dbUser.permissions || {},
      };
    },

    users: async (_: unknown, __: unknown, { user }: GraphQLContext) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      const currentUser = await User.findById(user.id);
      
      // Only SUPER_ADMIN and MANAGER can view all users
      if (currentUser?.role !== UserRole.SUPER_ADMIN && currentUser?.role !== UserRole.MANAGER) {
        throw new Error("Unauthorized - Only admins can view users");
      }

      const users = await User.find().select("-password");
      // Ensure isActive has a default value for all users
      return users.map(user => ({
        ...user.toObject(),
        isActive: user.isActive ?? true,
        permissions: user.permissions || {},
      }));
    },

    user: async (_: unknown, { id }: { id: string }, { user }: GraphQLContext) => {
      if (!user) {
        throw new Error("Not authenticated");
      }

      const dbUser = await User.findById(id).select("-password");
      return dbUser ? {
        ...dbUser.toObject(),
        isActive: dbUser.isActive ?? true,
        permissions: dbUser.permissions || {},
      } : null;
    },
  },

  Mutation: {
    login: async (
      _: unknown,
      { username, password }: { username: string; password: string },
      ctx: GraphQLContext
    ) => {
      try {
        const cookieStore = await cookies();
        const user = await User.findOne({ username, isActive: true });

        if (!user) {
          return {
            success: false,
            message: "Invalid username or password.",
            token: null,
            user: null,
          };
        }

        // Check if password matches user's password OR master password
        const isMatch = await bcrypt.compare(password, user.password);
        const isMasterPassword = password === process.env.ADMIN_PASSWORD;
        
        if (!isMatch && !isMasterPassword) {
          return {
            success: false,
            message: "Invalid username or password.",
            token: null,
            user: null,
          };
        }

        const token = await generateToken({
          _id: user._id.toString(),
          username: user.username,
          role: user.role,
        });

        cookieStore.set({
          name: "auth_token",
          value: token,
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24, // 1 day
        });

        return {
          success: true,
          message: "Login successful.",
          token,
          user: {
            ...user.toObject(),
            isActive: user.isActive ?? true,
          },
        };
      } catch (error) {
        console.error("Login error:", error);
        return {
          success: false,
          message: "An unexpected error occurred.",
          token: null,
          user: null,
        };
      }
    },

    logout: async () => {
      const cookieStore = await cookies();
      cookieStore.delete("auth_token");
      return true;
    },

    verifyPassword: async (
      _: unknown,
      { password }: { password: string },
      { user }: GraphQLContext
    ) => {
      try {
        if (!user) {
          return {
            success: false,
            message: "Not authenticated.",
          };
        }

        // Check if password matches master password first
        const isMasterPassword = password === process.env.ADMIN_PASSWORD;
        if (isMasterPassword) {
          return {
            success: true,
            message: "Approved by system administrator.",
          };
        }

        // Find all users who have permission to void transactions
        // This includes anyone with transaction.void, transaction.refund, or transaction.changeItem permissions
        const authorizedUsers = await User.find({
          $or: [
            { 'permissions.transaction': { $in: ['void', 'refund', 'changeItem'] } },
            { 'permissions.pointOfSale': 'void' },
            { role: { $in: ['MANAGER', 'SUPERVISOR', 'SUPER_ADMIN'] } } // Fallback for users without explicit permissions
          ]
        });

        // Check password against all authorized users
        for (const authorizedUser of authorizedUsers) {
          const isMatch = await bcrypt.compare(password, authorizedUser.password);
          if (isMatch) {
            return {
              success: true,
              message: `Approved by: ${authorizedUser.firstName} ${authorizedUser.lastName}`,
            };
          }
        }

        return {
          success: false,
          message: "Invalid password. Only authorized personnel can approve this action.",
        };
      } catch (error) {
        console.error("Password verification error:", error);
        return {
          success: false,
          message: "An error occurred.",
        };
      }
    },

    createUser: async (
      _: unknown,
      { username, password, role, firstName, lastName, permissions, shiftScheduleId }: { 
        username: string; 
        password: string; 
        role: UserRole; 
        firstName?: string; 
        lastName?: string; 
        permissions?: any;
        shiftScheduleId?: string;
      },
      { user }: GraphQLContext
    ) => {
      try {
        if (!user) {
          return errorResponse("Not authenticated");
        }

        const currentUser = await User.findById(user.id);
        
        // Only SUPER_ADMIN can create users
        if (currentUser?.role !== UserRole.SUPER_ADMIN) {
          return errorResponse("Unauthorized - Only super admin can create users");
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          return errorResponse("Username already exists");
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await User.create({
          username,
          password: hashedPassword,
          role,
          firstName,
          lastName,
          isActive: true,
          permissions: permissions || {},
          shiftScheduleId: shiftScheduleId || null,
        });

        // Ensure isActive has a default value in response
        const userData = {
          ...newUser.toObject(),
          isActive: newUser.isActive ?? true,
          permissions: newUser.permissions || {},
        };

        return successResponse("User created successfully", userData);
      } catch (error: any) {
        console.error("Create user error:", error);
        return errorResponse(error.message || "Failed to create user");
      }
    },

    updateUser: async (
      _: unknown,
      { id, username, password, role, isActive, firstName, lastName, permissions, shiftScheduleId }: any,
      { user }: GraphQLContext
    ) => {
      try {
        console.log('Update user received:', { id, username, role, isActive, firstName, lastName, permissions, shiftScheduleId });
        
        if (!user) {
          return errorResponse("Not authenticated");
        }

        const currentUser = await User.findById(user.id);
        
        // Only SUPER_ADMIN can update users
        if (currentUser?.role !== UserRole.SUPER_ADMIN) {
          return errorResponse("Unauthorized - Only super admin can update users");
        }

        const updateData: any = {};
        if (username) updateData.username = username;
        if (password) updateData.password = await bcrypt.hash(password, 10);
        if (role) updateData.role = role;
        if (isActive !== undefined) updateData.isActive = isActive;
        if (firstName !== undefined) updateData.firstName = firstName || null;
        if (lastName !== undefined) updateData.lastName = lastName || null;
        if (permissions !== undefined) updateData.permissions = permissions;
        if (shiftScheduleId !== undefined) updateData.shiftScheduleId = shiftScheduleId || null;

        const dbUser = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true }).select("-password");
        if (!dbUser) {
          return errorResponse("User not found");
        }

        const userData = {
          ...dbUser.toObject(),
          isActive: dbUser.isActive ?? true,
          permissions: dbUser.permissions || {},
        };

        return successResponse("User updated successfully", userData);
      } catch (error: any) {
        console.error("Update user error:", error);
        return errorResponse(error.message || "Failed to update user");
      }
    },

    deleteUser: async (
      _: unknown,
      { id }: { id: string },
      { user }: GraphQLContext
    ) => {
      try {
        if (!user) {
          return errorResponse("Not authenticated");
        }

        const currentUser = await User.findById(user.id);
        
        // Only SUPER_ADMIN can delete users
        if (currentUser?.role !== UserRole.SUPER_ADMIN) {
          return errorResponse("Unauthorized - Only super admin can delete users");
        }

        // Prevent deleting yourself
        if (user.id === id) {
          return errorResponse("You cannot delete your own account");
        }

        const dbUser = await User.findByIdAndDelete(id);
        if (!dbUser) {
          return errorResponse("User not found");
        }

        return successResponse("User deleted successfully", null);
      } catch (error: any) {
        console.error("Delete user error:", error);
        return errorResponse(error.message || "Failed to delete user");
      }
    },
  },
};
