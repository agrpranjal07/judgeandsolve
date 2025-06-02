import express from "express";
import { authenticateJWT, isAdmin } from "../middleware/auth.middleware.js";
import {
  addTestcase,
  listTestcases,
  listSampleTestcases,
  updateTestcase,
  deleteTestcase,
} from "../controllers/testcase.controller.js";

const testcaseRouter = express.Router();


testcaseRouter.post("/problems/:problemId/testcases",authenticateJWT, isAdmin, addTestcase);
testcaseRouter.get("/problems/:problemId/testcases",authenticateJWT, listTestcases);
testcaseRouter.get("/problems/:problemId/testcases/public", listSampleTestcases);
testcaseRouter.put("/testcases/:id",authenticateJWT, isAdmin, updateTestcase);
testcaseRouter.delete("/testcases/:id",authenticateJWT, isAdmin, deleteTestcase);

export default testcaseRouter; 