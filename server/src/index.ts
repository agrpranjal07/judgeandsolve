import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import './middleware/passport.js';
import passport from 'passport';

import { sequelize } from './config/database.js';
import authRouter from './routes/auth.routes.js';
import { ApiError } from './utils/ApiError.js';
import { errorHandler } from './middleware/errorHandler.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
  { origin: process.env.CLIENT_URL, credentials: true }
));
app.use(express.json());
app.use(passport.initialize());

// API Routes
app.use('/api/v1/auth', authRouter);

// Health / Welcome
app.get('/api/v1', (req, res) => {
  res.send('Welcome to the API of JudgeAndSolve');
});

// 404 handler
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    if (process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      console.log('Database synced.');
    }
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Startup error:', err);
    process.exit(1);
  }
};
startServer();

