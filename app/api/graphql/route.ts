import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/app/api/graphql/schema";
import { resolvers } from "@/app/api/graphql/resolver";
import dbConnect from "@/lib/mongodb";
import { verifyToken, DecodedUser } from "@/lib/auth";
import type { NextRequest } from "next/server";

export interface GraphQLContext {
  user: DecodedUser | null;
  request: NextRequest;
}

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: true,
});

const handler = startServerAndCreateNextHandler<NextRequest, GraphQLContext>(server, {
  context: async (req) => {
    // ✅ 'req' here is actually the NextRequest object itself
    const request = req as NextRequest;

    await dbConnect();

    const authHeader = request.headers.get("authorization");
    let user: DecodedUser | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      try {
        user = verifyToken(token);
      } catch (err) {
        console.warn("Invalid or expired token:", err);
      }
    }

    return { user, request };
  },
});

export const GET = handler;
export const POST = handler;
