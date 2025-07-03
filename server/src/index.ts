import "express-async-errors";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./middleware/passport.js";
import passport from "passport";

import { sequelize } from "./config/database.js";
import authRouter from "./routes/auth.routes.js";
import { ApiError } from "./utils/ApiError.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cookieParser from "cookie-parser";
import "./models/index.js";
import problemRouter from "./routes/problem.routes.js";
import testcaseRouter from './routes/testcase.routes.js';
import tagRouter from './routes/tag.routes.js';
import submissionRouter from './routes/submission.routes.js';
import statsRouter from './routes/stats.routes.js';
import aiRouter from "./routes/ai.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(passport.initialize());


// Health / Welcome
app.get("/api/v1", (req, res) => {
  res.send("Welcome to the API of JudgeAndSolve");
});

// API Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/problems", problemRouter);
app.use('/api/v1/', testcaseRouter);
app.use('/api/v1', tagRouter);
app.use('/api/v1', submissionRouter);
app.use('/api/v1/stats', statsRouter);
app.use("/api/v1/ai", aiRouter);


// 404 handler
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

// Global error handler
app.use(errorHandler);

// Export app for testing
export default app;

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");
    if (process.env.NODE_ENV === "development") {
      await sequelize.sync({ alter: true });
      console.log("Database synced.");
    }
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
