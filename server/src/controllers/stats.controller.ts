import { Request, Response, NextFunction } from "express";
import { Sequelize } from "sequelize";
import User from "../models/user.model.js";
import Submission from "../models/submission.model.js";
import SubmissionTestcaseResult from "../models/submission_testcase_result.model.js";
import { successResponse } from "../utils/ApiResponse.js";
import Problem from "../models/problem.model.js";
import { throwIf } from "../utils/helper.js";

const difficultyWeightCase = `
  CASE
    WHEN "problem"."difficulty" = 'Easy' THEN 1
    WHEN "problem"."difficulty" = 'Medium' THEN 2
    WHEN "problem"."difficulty" = 'Hard' THEN 3
    ELSE 0
  END
`;

export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await Submission.findAll({
      where: { verdict: "Accepted" },
      attributes: [
        "userId",
        [Sequelize.literal(`SUM(${difficultyWeightCase})`), "weightedScore"],
        [
          Sequelize.fn(
            "COUNT",
            Sequelize.fn("DISTINCT", Sequelize.col("problemId"))
          ),
          "solvedCount",
        ],
        [
          Sequelize.literal(`(
          SELECT COUNT(*)
          FROM "submissions" AS s2
          WHERE
            s2."userId" = "Submission"."userId"
        )`),
          "submissionsCount",
        ],
        [
          Sequelize.fn(
            "AVG",
            Sequelize.col("submission_testcase_results.runtime")
          ),
          "avgRuntime",
        ],
      ],
      include: [
        {
          model: Problem,
          attributes: [],
        },
        {
          model: SubmissionTestcaseResult,
          attributes: [],
        },
      ],
      group: ["userId"],
      order: [
        [Sequelize.literal('"weightedScore"'), "DESC"],
        [Sequelize.literal('"submissionsCount"'), "ASC"],
        [Sequelize.literal('"avgRuntime"'), "ASC"],
      ],
      limit: 50,
    });

    const leaderboard = await Promise.all(
      stats.map(async (row: any) => {
        const user = await User.findByPk(row.userId, {
          attributes: ["username"],
        });
        return {
          userId: row.userId,
          username: user?.username ?? "Unknown",
          weightedScore: parseFloat(row.get("weightedScore")),
          solvedCount: parseInt(row.get("solvedCount"), 10),
          submissionsCount: parseInt(row.get("submissionsCount"), 10),
          avgRuntime: parseFloat(row.get("avgRuntime")).toFixed(2),
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
