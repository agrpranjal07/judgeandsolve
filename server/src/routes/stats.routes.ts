import express from 'express';
import { getLeaderboard, getUserStats } from '../controllers/stats.controller.js';

const statsRouter = express.Router();

statsRouter.get('/leaderboard', getLeaderboard);
statsRouter.get('/user/:username', getUserStats);

export default statsRouter;