import express from "express";
import { authenticateJWT, isAdmin } from "../middleware/auth.middleware.js";
import {
  createProblem,
  getProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} from "../controllers/problem.controller.js";

const problemRouter = express.Router();

// All routes require authentication
problemRouter.use(authenticateJWT);


problemRouter.get("/", getProblems);
problemRouter.get("/:id", getProblemById);
problemRouter.post("/",isAdmin, createProblem);
problemRouter.put("/:id",isAdmin, updateProblem);
problemRouter.delete("/:id",isAdmin, deleteProblem);

export default problemRouter;
