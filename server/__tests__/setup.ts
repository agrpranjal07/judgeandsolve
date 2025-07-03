import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for database operations
jest.setTimeout(30000);

// Global cleanup to close any Redis connections
afterAll(async () => {
  try {
    // Import and close database connections if they exist
    const { sequelize } = await import('../src/config/database.js');
    await sequelize.close();
  } catch (error) {
    // Ignore errors during cleanup
    console.log('Cleanup error (ignoring):', error.message);
  }
});
