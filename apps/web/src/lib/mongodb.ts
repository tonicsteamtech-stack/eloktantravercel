/**
 * 🛡️ MOCK MONGODB ADAPTER
 * Standard Promise-based export for Next.js API stability.
 */

const mockDb = {
  collection: () => ({
    insertOne: async () => ({ acknowledged: true, insertedId: 'mock-id' }),
    findOne: async () => ({ id: 'mock-user', ownerName: 'Verified Citizen' }),
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

// Create a stable promise
const clientPromise = Promise.resolve(mockClient);

// Named exports
export { clientPromise };
export async function connectDB() {
  return mockClient;
}

// Default export is the promise (Pattern required by most routes)
export default clientPromise;
