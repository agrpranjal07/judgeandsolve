import express from 'express';
import { signup, login, logout, getProfile, getMe } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/profile/:username', getProfile);
authRouter.get('/me', authenticateJWT, getMe);

export default authRouter;