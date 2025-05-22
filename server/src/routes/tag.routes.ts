// tag.routes.ts
import express from 'express';
import {
  createTag,
  getTags,
  setTags,
  removeTag,
} from '../controllers/tag.controller.js';
import { authenticateJWT, isAdmin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticateJWT, isAdmin, createTag);
router.get('/', getTags);
router.get('/:problemId', getTags);
router.post('/:problemId', authenticateJWT, isAdmin, setTags);
router.delete('/:problemId/:tagId', authenticateJWT, isAdmin, removeTag);

export default router;
