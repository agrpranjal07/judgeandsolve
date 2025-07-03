const dotenv = require('dotenv');

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global cleanup to close any database and Redis connections
afterAll(async () => {
  try {
    // Import and close database connections if they exist
    const { sequelize } = require('../src/config/database.ts');
    await sequelize.close();
  } catch (error) {
    // Ignore errors during cleanup
    console.log('DB Cleanup error (ignoring):', error.message);
  }

  try {
    // Import and close Redis connections from judgeQueue
    const { judgeQueue, judgeWorker } = require('../src/judge/judgeQueue.ts');
    await judgeQueue.close();
    await judgeWorker.close();
  } catch (error) {
    // Ignore errors during cleanup
    console.log('Redis Cleanup error (ignoring):', error.message);
  }
});
