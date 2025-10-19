import { generateToken, verifyToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { GraphQLContext } from "../context";
import User from "../models/User";

export const authResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, { request }: GraphQLContext) => {
      const authToken = request.cookies.get("auth_token")?.value ?? "";
      const decodedUser = await verifyToken(authToken);
      if (!decodedUser) {
        return null;
      }

      const user = await User.findById(decodedUser.id);
      return user;
    },
  },
  Mutation: {
    login: async (
      _: unknown,
      { username, password }: { username: string; password: string },
      ctx: GraphQLContext
    ) => {
      try {
        // 1️⃣ Connect to DB (if not already)
        // You can also do this globally in Apollo context
        // await dbConnect();

        // 2️⃣ Find user by username
        const cookieStore = await cookies();
        const user = await User.findOne({ username });

        if (!user) {
          return {
            success: false,
            message: "Invalid username or password.",
            _id: null,
            username: null,
            role: null,
          };
        }

        // 3️⃣ Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return {
            success: false,
            message: "Invalid username or password.",
            _id: null,
            username: null,
            role: null,
          };
        }

        // 4️⃣ Generate JWT
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
        // 5️⃣ Return response matching typeDefs
        return {
          success: true,
          message: "Login successful.",
          token,
          // optionally include token if you add it to typeDefs
        };
      } catch (error) {
        console.error("Login error:", error);
        return {
          success: false,
          message: "An unexpected error occurred.",
          _id: null,
          username: null,
          role: null,
        };
      }
    },

    logout: async () => {
      const cookieStore = await cookies();

      // Stateless logout — handled client-side by clearing JWT
      cookieStore.delete("auth_token");
      return true;
    },
  },
};
