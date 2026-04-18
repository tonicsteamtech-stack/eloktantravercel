/**
 * MOCK MONGODB ADAPTER
 * This file is a stub to satisfy import requirements in API routes 
 * while the project transition to a real backend.
 */

// Mock DB implementation
const mockDb = {
  collection: () => ({
    insertOne: async () => ({ acknowledged: true, insertedId: 'mock-id' }),
    find: () => ({
      toArray: async () => [],
      limit: () => ({ toArray: async () => [] }),
    }),
    updateOne: async () => ({ acknowledged: true }),
    updateMany: async () => ({ acknowledged: true }),
    deleteOne: async () => ({ acknowledged: true }),
  }),
};

const mockClient = {
  db: () => mockDb,
  connect: async () => mockClient,
};

// Satisfies: import getClient from '@/lib/mongodb'
export default async function getClient() {
  console.warn('MONGODB_MOCK: Using mock client. No data will be persisted.');
  return mockClient;
}

// Satisfies: import { connectDB } from '@/lib/mongodb'
export async function connectDB() {
  console.warn('MONGODB_MOCK: connectDB() called (Mocked).');
  return true;
}

// Satisfies: import clientPromise from '@/lib/mongodb'
export const clientPromise = Promise.resolve(mockClient);
