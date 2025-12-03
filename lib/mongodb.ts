import mongoose from "mongoose";
import { seedDefaultUser } from "./seedDefaultUser";

const MONGODB_URI =
  process.env.NODE_ENV === "development"
    ? (process.env.MONGODB_URI_DEV as string)
    : (process.env.MONGODB_URI_PROD as string);

if (!MONGODB_URI) {
  throw new Error(
    `⚠️ Please define the MONGODB_URI_${process.env.NODE_ENV} environment variable in .env.local`
  );
}

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
