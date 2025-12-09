import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "../schema";
import { resolvers } from "@/app/api/graphql/resolver";
import dbConnect from "@/lib/mongodb";
import { verifyToken, DecodedUser } from "@/lib/auth";
import User from "@/app/api/graphql/models/User";
import type { NextRequest } from "next/server";
import { checkRateLimit, rateLimitConfigs, getClientIdentifier } from "@/lib/rateLimiter";
import { NextResponse } from "next/server";

export interface GraphQLContext {
  user: (DecodedUser & { permissions?: Record<string, string[]> }) | null;
  request: NextRequest;
}

const server = new ApolloServer<GraphQLContext>({
  typeDefs,
  resolvers,
  introspection: process.env.NODE_ENV === 'development', // Only allow introspection in dev
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

// Rate limiting wrapper
async function withRateLimit(request: NextRequest, handler: (req: NextRequest) => Promise<Response>) {
  const identifier = getClientIdentifier(request);
  const { allowed, remaining, resetTime } = checkRateLimit(identifier, rateLimitConfigs.api);
  
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': rateLimitConfigs.api.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(resetTime).toISOString(),
          'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }
  
  const response = await handler(request);
  
  // Add rate limit headers to successful responses
  const headers = new Headers(response.headers);
  headers.set('X-RateLimit-Limit', rateLimitConfigs.api.maxRequests.toString());
  headers.set('X-RateLimit-Remaining', remaining.toString());
  headers.set('X-RateLimit-Reset', new Date(resetTime).toISOString());
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Export as async functions for Next.js 16 compatibility with rate limiting
export async function GET(request: NextRequest) {
  return withRateLimit(request, handler);
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, handler);
}
