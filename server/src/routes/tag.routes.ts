import express from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.js";
import {
  createTag,
  getTags,
  setTags,
  removeTag,
} from "../controllers/tag.controller.js";

const tagRouter = express.Router();

tagRouter.post("/tags", authenticateJWT, authorize('tag', 'can_edit'), createTag);
tagRouter.get("/tags", getTags);
tagRouter.get("/problems/:problemId/tags", getTags);
tagRouter.post("/problems/:problemId/tags", authenticateJWT, authorize('problem_tag', 'can_edit'), setTags);
tagRouter.delete("/problems/:problemId/tags/:tagId", authenticateJWT, authorize('problem_tag', 'can_edit'), removeTag);

export default tagRouter; 