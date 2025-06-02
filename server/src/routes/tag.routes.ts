import express from "express";
import { authenticateJWT, isAdmin } from "../middleware/auth.middleware.js";
import {
  createTag,
  getTags,
  setTags,
  removeTag,
} from "../controllers/tag.controller.js";

const tagRouter = express.Router();

tagRouter.post("/tags",authenticateJWT,isAdmin, createTag);
tagRouter.get("/tags", getTags);
tagRouter.get("/problems/:problemId/tags", getTags);
tagRouter.post("/problems/:problemId/tags",authenticateJWT,isAdmin, setTags);
tagRouter.delete("/problems/:problemId/tags/:tagId",authenticateJWT,isAdmin, removeTag);

export default tagRouter; 