import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eloktantra';

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  const opts = {
    bufferCommands: false,
  };

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB: Connected via Mongoose');
  } catch (e) {
    console.warn('MongoDB: Connection failed, falling back to local database');
    cached.promise = mongoose.connect('mongodb://127.0.0.1:27017/eloktantra', opts);
    cached.conn = await cached.promise;
  }

  return cached.conn;
}

// clientPromise for native mongodb operations
const clientPromise = connectDB().then((m) => m.connection.getClient());

export default clientPromise;
