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


problemRouter.get("/", getProblems);
problemRouter.get("/:id", getProblemById);
problemRouter.post("/",authenticateJWT, isAdmin, createProblem);
problemRouter.put("/:id",authenticateJWT, isAdmin, updateProblem);
problemRouter.delete("/:id",authenticateJWT, isAdmin, deleteProblem);

export default problemRouter;
