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

testcaseRouter.use(authenticateJWT, isAdmin);

testcaseRouter.post("/problems/:problemId/testcases", addTestcase);
testcaseRouter.get("/problems/:problemId/testcases", listTestcases);
testcaseRouter.get("/problems/:problemId/testcases/public", listSampleTestcases);
testcaseRouter.put("/testcases/:id", updateTestcase);
testcaseRouter.delete("/testcases/:id", deleteTestcase);

export default testcaseRouter; 