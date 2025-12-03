// app/api/graphql/context.ts
import type { NextRequest } from "next/server";
import type { DecodedUser } from "@/lib/auth";

export interface GraphQLContext {
  user: DecodedUser | null;
  request: NextRequest;
}
