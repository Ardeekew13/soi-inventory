import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "../schema";
import { resolvers } from "@/app/api/graphql/resolver";
import dbConnect from "@/lib/mongodb";
import { verifyToken, DecodedUser } from "@/lib/auth";
import User from "@/app/api/graphql/models/User";
import type { NextRequest } from "next/server";

export interface GraphQLContext {
  user: (DecodedUser & { permissions?: Record<string, string[]> }) | null;
  request: NextRequest;
}

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: true,
});

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
  context: async (req) => {
    const request = req as NextRequest;

    await dbConnect();

    // Extract user from cookie (same as auth resolvers)
    const authToken = request.cookies.get("auth_token")?.value ?? "";
    let user: (DecodedUser & { permissions?: Record<string, string[]> }) | null = null;

    if (authToken) {
      try {
        const decoded = verifyToken(authToken);
        if (decoded) {
          // Fetch full user data from database to get permissions
          const dbUser = await User.findById(decoded.id).select('-password').lean();
          if (dbUser && !Array.isArray(dbUser)) {
            user = {
              ...decoded,
              permissions: (dbUser as any).permissions || {},
            };
            
            console.log('=== CONTEXT USER DATA ===');
            console.log('User ID:', user.id);
            console.log('Username:', user.username);
            console.log('Role:', user.role);
            console.log('Permissions:', JSON.stringify(user.permissions, null, 2));
          }
        }
      } catch (err) {
        console.warn("Invalid or expired token:", err);
      }
    }

    return { user, request };
  },
});

export const GET = handler;
export const POST = handler;
