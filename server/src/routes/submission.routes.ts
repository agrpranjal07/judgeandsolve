import express from "express";
import { authenticateJWT, isAdmin } from "../middleware/auth.middleware.js";
import {
  submitCode,
  listUserSubmissions,
  getSubmissionById,
  getProblemSubmissions,
  getRecentSubmissions,
} from "../controllers/submission.controller.js";

const submissionRouter = express.Router();

submissionRouter.use(authenticateJWT);

submissionRouter.post("/submissions", submitCode);
submissionRouter.get("/submissions", listUserSubmissions);
submissionRouter.get("/submissions/:id", getSubmissionById);
submissionRouter.get("/problems/:problemId/submissions", isAdmin,getProblemSubmissions);
submissionRouter.get("/recentSubmissions", getRecentSubmissions);
export default submissionRouter; 