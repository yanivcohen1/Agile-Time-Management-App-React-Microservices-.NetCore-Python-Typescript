import { MongoMemoryServer } from 'mongodb-memory-server';

// Global variable to hold the server instance
declare global {
  // eslint-disable-next-line no-var
  var __MONGOSERVER__: MongoMemoryServer | undefined;
}

// Set up in-memory MongoDB server before any tests run
const setupMongo = async () => {
  const mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGO_URI = mongoUri;
  global.__MONGOSERVER__ = mongoServer;
};

// Clean up after all tests
const teardownMongo = async () => {
  if (global.__MONGOSERVER__) {
    await global.__MONGOSERVER__.stop();
  }
};

// Run setup immediately
setupMongo();

// Set up cleanup on process exit
process.on('exit', teardownMongo);
process.on('SIGINT', teardownMongo);
process.on('SIGTERM', teardownMongo);