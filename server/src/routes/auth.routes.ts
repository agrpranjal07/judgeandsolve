import express from 'express';
import { signup, login, logout, getProfile, getMe, refresh } from '../controllers/auth.controller.js';
import { authenticateJWT } from '../middleware/auth.middleware.js';
import passport from '../middleware/passport.js';
import { handleOAuthSuccess } from '../controllers/social.controller.js';

const authRouter = express.Router();

authRouter.post('/signup', signup);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/profile/:username', getProfile);
authRouter.get('/me', authenticateJWT, getMe);
authRouter.post('/refresh', refresh);

// Google OAuth
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
authRouter.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), handleOAuthSuccess);

// GitHub OAuth
authRouter.get('/github', passport.authenticate('github', { scope: ['user:email'] }));
authRouter.get('/github/callback', passport.authenticate('github', { session: false, failureRedirect: '/login' }), handleOAuthSuccess);

export default authRouter;