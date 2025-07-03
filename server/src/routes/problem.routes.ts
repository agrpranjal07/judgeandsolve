import express from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.js";
import { loadProblemData } from "../middleware/loadResource.js";
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
problemRouter.post("/", authenticateJWT, authorize('problem', 'can_edit'), createProblem);
problemRouter.put("/:id", authenticateJWT, loadProblemData, authorize('problem', 'can_edit'), updateProblem);
problemRouter.delete("/:id", authenticateJWT, loadProblemData, authorize('problem', 'can_edit'), deleteProblem);

export default problemRouter;
