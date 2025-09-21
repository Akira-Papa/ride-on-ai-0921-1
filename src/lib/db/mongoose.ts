import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const globalCache = global.mongooseCache ?? { conn: null, promise: null };

export async function connectMongo(): Promise<typeof mongoose> {
  if (globalCache.conn) {
    return globalCache.conn;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (!globalCache.promise) {
    mongoose.set("strictQuery", true);
    globalCache.promise = mongoose.connect(process.env.MONGODB_URI, {
      maxIdleTimeMS: 10000,
    });
  }

  try {
    globalCache.conn = await globalCache.promise;
  } catch (error) {
    globalCache.promise = null;
    throw error;
  }

  global.mongooseCache = globalCache;
  return globalCache.conn;
}

export async function disconnectMongo(): Promise<void> {
  if (globalCache.conn) {
    await mongoose.disconnect();
    globalCache.conn = null;
    globalCache.promise = null;
    global.mongooseCache = globalCache;
  }
}
