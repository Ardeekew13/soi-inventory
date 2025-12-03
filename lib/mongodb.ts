import mongoose from "mongoose";
import { seedDefaultUser } from "./seedDefaultUser";

// Determine which MongoDB URI to use based on environment
// Priority: VERCEL_ENV (set by Vercel) > NODE_ENV
// - main branch (production) -> MONGODB_URI_PROD
// - staging/other branches (preview) -> MONGODB_URI_DEV
// - local development -> MONGODB_URI_DEV
const isProduction = 
  process.env.VERCEL_ENV === "production" || 
  (process.env.NODE_ENV === "production" && !process.env.VERCEL_ENV);

const MONGODB_URI = isProduction
  ? (process.env.MONGODB_URI_PROD as string)
  : (process.env.MONGODB_URI_DEV as string);

const envType = isProduction ? "PROD" : "DEV";

if (!MONGODB_URI) {
  throw new Error(
    `⚠️ Please define the MONGODB_URI_${envType} environment variable`
  );
}

console.log(`🔧 Using ${envType} MongoDB: ${MONGODB_URI.split('@')[1]?.split('/')[0] || 'localhost'}`);

// Define a type for the cached object
type MongooseCache = {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Connection> | null;
};

// Attach the cache to the global object with proper typing
declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

export default async function dbConnect(): Promise<mongoose.Connection> {
  if (cached.conn) {
    console.log("✅ Reusing existing database connection");
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false })
      .then((mongooseInstance) => {
        seedDefaultUser();
        console.log("✅ New database connection created");
        return mongooseInstance.connection;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
