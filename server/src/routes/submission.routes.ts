import express from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  submitCode,
  listUserSubmissions,
  getSubmissionById,
  getProblemSubmissions,
  getRecentSubmissions,
  getUserSolvedProblems,
  testSampleCode,
  setSubmissionReviewNote,
} from "../controllers/submission.controller.js";

const submissionRouter = express.Router();

submissionRouter.use(authenticateJWT);

submissionRouter.post("/submissions", submitCode);
submissionRouter.get("/submissions", listUserSubmissions);
submissionRouter.get("/submissions/:id", getSubmissionById);
submissionRouter.post("/submissions/review/:id", setSubmissionReviewNote);
submissionRouter.get("/problems/:problemId/submissions", getProblemSubmissions);
submissionRouter.post("/submissions/testcases", testSampleCode);
submissionRouter.get("/recentSubmissions", getRecentSubmissions);
submissionRouter.get("/users/solved-problems", getUserSolvedProblems);
export default submissionRouter; 