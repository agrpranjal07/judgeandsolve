import express from "express";
import { getAIReview } from "../controllers/ai.controller.js";
import { authenticateJWT } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/authorize.js";

const aiRouter = express.Router();

aiRouter.post("/review", authenticateJWT, authorize('ai_review', 'can_create'), getAIReview);

export default aiRouter;
