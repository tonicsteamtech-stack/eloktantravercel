import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/eloktantra';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB: Connected via Mongoose');
  } catch (e) {
    console.warn('MongoDB: Primary connection failed, attempting fallback');
    throw e;
  }

  return cached.conn;
}

/**
 * Satisfies the native MongoDB client requirement for auth-mock routes.
 * Using the native client from our Mongoose connection.
 */
export const clientPromise = (async () => {
    const conn = await connectDB();
    // In Mongoose 8.x, we can get the underlying MongoClient
    return conn.connection.getClient() as unknown as MongoClient;
})();

export default clientPromise;
