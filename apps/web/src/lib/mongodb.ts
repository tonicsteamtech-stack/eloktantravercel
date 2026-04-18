/**
 * 🛡️ MOCK MONGODB ADAPTER (Senior Resilience Version)
 * This file is a "thenable function" shim that satisfies multiple import patterns:
 * 1. await clientPromise (where clientPromise is default)
 * 2. await getClient() (where getClient is default)
 * 3. Named imports like { clientPromise, connectDB }
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

// This function acts as BOTH a function and a Promise (thenable)
async function getClientStub() {
  return mockClient;
}

// Make it "thenable" so 'await getClientStub' works without calling it
getClientStub.then = (onRes: any, onRej: any) => Promise.resolve(mockClient).then(onRes, onRej);
getClientStub.catch = (onRej: any) => Promise.resolve(mockClient).catch(onRej);
getClientStub.finally = (onFin: any) => Promise.resolve(mockClient).finally(onFin);

// Named exports for specific route requirements
export const clientPromise = getClientStub;
export async function connectDB() {
  return mockClient;
}

// Default export satisfies both Pattern 1 (import clientPromise) and Pattern 2 (import getClient)
export default getClientStub;
