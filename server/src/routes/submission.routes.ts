import express from "express";
import { authenticateJWT, isAdmin } from "../middleware/auth.middleware.js";
import {
  submitCode,
  listUserSubmissions,
  getSubmissionById,
  getProblemSubmissions,
  getRecentSubmissions,
  getUserSolvedProblems,
  testSampleCode,
} from "../controllers/submission.controller.js";

const submissionRouter = express.Router();

submissionRouter.use(authenticateJWT);

submissionRouter.post("/submissions", submitCode);
submissionRouter.get("/submissions", listUserSubmissions);
submissionRouter.get("/submissions/:id", getSubmissionById);
submissionRouter.get("/problems/:problemId/submissions", isAdmin,getProblemSubmissions);
submissionRouter.post("/submissions/testcases",testSampleCode );
submissionRouter.get("/recentSubmissions", getRecentSubmissions);
submissionRouter.get("/users/solved-problems",getUserSolvedProblems)
export default submissionRouter; 