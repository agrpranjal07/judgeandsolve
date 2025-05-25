import { Request, Response, NextFunction } from "express";
import { Sequelize } from "sequelize";
import User from "../models/user.model.js";
import Submission from "../models/submission.model.js";
import { successResponse } from "../utils/ApiResponse.js";
import { throwIf } from "../utils/helper.js";
import { sequelize } from "../config/database.js";

const difficultyWeightCase = `
  CASE
    WHEN p."difficulty" = 'Easy' THEN 1
    WHEN p."difficulty" = 'Medium' THEN 2
    WHEN p."difficulty" = 'Hard' THEN 3
    ELSE 0
  END
`;

export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const results: any[] = await sequelize.query(
      `
      SELECT
        s."userId",
        SUM(
          ${difficultyWeightCase}
        ) AS "weightedScore",
        COUNT(DISTINCT s."problemId") AS "solvedCount",
        COUNT(*) AS "submissionsCount",
        AVG(str."runtime") AS "avgRuntime"
      FROM "submissions" s
      JOIN "problems" p ON s."problemId" = p."id"
      LEFT JOIN "submission_testcase_results" str ON str."submissionId" = s."id"
      WHERE s."verdict" = 'Accepted'
      GROUP BY s."userId"
      ORDER BY "weightedScore" DESC, "submissionsCount" ASC, "avgRuntime" ASC
      LIMIT 50;
      `,
      {
        type: 'SELECT',
      }
    );

    const leaderboard = await Promise.all(
      results.map(async (row) => {
        const user = await User.findByPk(row.userId, {
          attributes: ["username"],
        });

        return {
          userId: row.userId,
          username: user?.username ?? "Unknown",
          weightedScore: parseFloat(row.weightedScore),
          solvedCount: parseInt(row.solvedCount, 10),
          submissionsCount: parseInt(row.submissionsCount, 10),
          avgRuntime: parseFloat(row.avgRuntime || 0).toFixed(2),
        };
      })
    );

    return successResponse(res, {
      statusCode: 200,
      message: "Leaderboard fetched",
      data: leaderboard,
    });
  } catch (err) {
    next(err);
  }
};

export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let userId = "";
    if (req.user && (req.user as any).id) {
      userId = (req.user as any).id;
    } else {
      const { username } = req.params;
      const user = await User.findOne({ where: { username } });
      throwIf(!user, 404, "User not found");
      if (user?.id) userId = user.id;
    }
    if (userId) {
      const totalSubmissions = await Submission.count({ where: { userId } });
      const totalAccepted = await Submission.count({
        where: { userId, verdict: "Accepted" },
      });
      const totalAttemptedRaw = await Submission.findAll({
        where: { userId },
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("problemId")), "problemId"],
        ],
      });
      const totalAttempted = totalAttemptedRaw.length;
      const accuracyRate =
        totalSubmissions > 0
          ? Math.round((totalAccepted / totalSubmissions) * 100)
          : 0;

      const stats = {
        totalSubmissions,
        totalAccepted,
        totalAttempted,
        accuracyRate,
      };

      return successResponse(res, {
        statusCode: 200,
        message: "User statistics fetched",
        data: stats,
      });
    }
  } catch (err) {
    next(err);
  }
};
