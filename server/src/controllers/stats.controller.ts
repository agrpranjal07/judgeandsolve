import { Request, Response, NextFunction } from "express";
import { Sequelize } from "sequelize";
import User from "../models/user.model.js";
import { sequelize } from "../config/database.js";
import Submission from "../models/submission.model.js";
import { throwIf } from "../utils/helper.js";
import { successResponse } from "../utils/ApiResponse.js";

// Re-use the same CASE for difficulty weight
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
      WITH user_first_accepted_submission AS (
        SELECT
            s."userId",
            s."problemId",
            MIN(s."createdAt") AS "firstAcceptedAt",
            (
              SELECT s_inner.id
              FROM "submissions" s_inner
              WHERE 
                s_inner."userId" = s."userId" AND 
                s_inner."problemId" = s."problemId" AND 
                s_inner."verdict" = 'Accepted'
              ORDER BY s_inner."createdAt" ASC
              LIMIT 1
            ) AS "firstAcceptedSubmissionId"
        FROM "submissions" s
        WHERE s."verdict" = 'Accepted'
        GROUP BY s."userId", s."problemId"
      ),

      user_problem_weighted_score AS (
        SELECT
            ufas."userId",
            ufas."problemId",
            ufas."firstAcceptedAt",
            ufas."firstAcceptedSubmissionId",
            p."difficulty",
            ${difficultyWeightCase} AS "difficultyWeight",
            ar."createdAt" AS "firstReviewAt"
        FROM user_first_accepted_submission ufas
        JOIN "problems" p
          ON ufas."problemId" = p."id"
        LEFT JOIN "ai_reviews" ar
          ON ar."userId" = ufas."userId"
          AND ar."problemId" = ufas."problemId"
      ),

      user_overall_metrics AS (
        SELECT
            upws."userId",
            SUM(
              CASE
                WHEN upws."firstReviewAt" IS NOT NULL
                  AND upws."firstReviewAt" < upws."firstAcceptedAt"
                THEN 0
                ELSE upws."difficultyWeight"
              END
            ) AS "weightedScore",
            COUNT(upws."firstAcceptedAt") AS "solvedCount",
            SUM(str."runtime") AS "totalRuntimeForAccepted",
            COUNT(str."id") AS "totalTestcasesForAccepted",
            (
              SELECT COUNT(*)
              FROM "submissions" s_all
              WHERE s_all."userId" = upws."userId"
            ) AS "totalSubmissions"
        FROM user_problem_weighted_score upws
        LEFT JOIN "submission_testcase_results" str
          ON str."submissionId" = upws."firstAcceptedSubmissionId"
        GROUP BY upws."userId"
      )

      SELECT
        u.id AS "userId",
        u.username,
        uom."weightedScore",
        uom."solvedCount",
        uom."totalSubmissions",
        COALESCE(
          uom."totalRuntimeForAccepted" / NULLIF(uom."totalTestcasesForAccepted", 0),
          0
        ) AS "avgRuntime"
      FROM "users" u
      JOIN user_overall_metrics uom
        ON u.id = uom."userId"
      ORDER BY
        uom."weightedScore" DESC,
        uom."totalSubmissions" ASC,
        "avgRuntime" ASC
      LIMIT 50;
      `,
      { type: "SELECT" }
    );

    const leaderboard = results.map((row) => ({
      userId: row.userId,
      username: row.username ?? "Unknown",
      weightedScore: parseFloat(row.weightedScore),
      solvedCount: parseInt(row.solvedCount, 10),
      submissionsCount: parseInt(row.totalSubmissions, 10),
      avgRuntime: parseFloat(row.avgRuntime || 0).toFixed(2),
    }));

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
