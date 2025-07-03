import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load appropriate env file based on NODE_ENV
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test' });
} else {
  dotenv.config();
}

const { DATABASE_URL } = process.env;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in the environment variables');
}

// Configuration for test environment
const isTestEnv = process.env.NODE_ENV === 'test';

export const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: (isTestEnv && !DATABASE_URL.includes('sslmode=require')) ? {} : {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
  pool: isTestEnv ? {
    max: 2,
    min: 0,
    acquire: 15000,
    idle: 3000,
  } : {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});
