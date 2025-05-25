import express from "express";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import {
  createTag,
  getTags,
  setTags,
  removeTag,
} from "../controllers/tag.controller.js";

const tagRouter = express.Router();

tagRouter.use(authenticateJWT);

tagRouter.post("/tags", createTag);
tagRouter.get("/tags", getTags);
tagRouter.get("/problems/:problemId/tags", getTags);
tagRouter.post("/problems/:problemId/tags", setTags);
tagRouter.delete("/problems/:problemId/tags/:tagId", removeTag);

export default tagRouter; 