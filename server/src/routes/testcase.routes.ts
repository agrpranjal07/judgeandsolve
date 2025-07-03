import express from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.js";
import { loadProblemForTestcase, loadProblemForTestcaseById } from "../middleware/loadResource.js";
import {
  addTestcase,
  listTestcases,
  listSampleTestcases,
  updateTestcase,
  deleteTestcase,
} from "../controllers/testcase.controller.js";

const testcaseRouter = express.Router();


testcaseRouter.post("/problems/:problemId/testcases", authenticateJWT, loadProblemForTestcase, authorize('testcase', 'can_edit'), addTestcase);
testcaseRouter.get("/problems/:problemId/testcases", authenticateJWT, listTestcases);
testcaseRouter.get("/problems/:problemId/testcases/public", listSampleTestcases);
testcaseRouter.put("/testcases/:id", authenticateJWT, loadProblemForTestcaseById, authorize('testcase', 'can_edit'), updateTestcase);
testcaseRouter.delete("/testcases/:id", authenticateJWT, loadProblemForTestcaseById, authorize('testcase', 'can_edit'), deleteTestcase);

export default testcaseRouter; 