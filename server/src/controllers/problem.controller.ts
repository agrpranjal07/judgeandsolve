import { Request, Response } from "express";
import Problem from "../models/problem.model.js";
import { throwIf, sendSuccess } from "../utils/helper.js";
import { ApiError } from "../utils/ApiError.js";
import { Op, Sequelize } from "sequelize";


// Create Problem (Admin only)
export const createProblem = async (req: Request, res: Response) => {
  try {
    const { title, description, difficulty, sampleInput, sampleOutput } =
      req.body;
    throwIf(
      !title || !description || !difficulty || !sampleInput || !sampleOutput,
      400,
      "All fields are required"
    );
    throwIf(
      !["Easy", "Medium", "Hard"].includes(difficulty),
      400,
      "Invalid difficulty"
    );
    const userId = (req as any).user.id;
    if (userId) {
      const problem = await Problem.create({
        title,
        description,
        difficulty,
        sampleInput,
        sampleOutput,
        createdBy: userId,
      });
      return sendSuccess(res, 201, "Problem created", problem);
    }
  } catch (err) {
    throw new ApiError(500, "Failed to create problem");
  }
};

// Get All Problems (with filtering & pagination)
export const getProblems = async (req: Request, res: Response) => {
  try {
    const { difficulty, page = 1, limit = 20 } = req.query;
    const where: any = {};
    if (
      difficulty &&
      ["Easy", "Medium", "Hard"].includes(difficulty as string)
    ) {
      where.difficulty = difficulty;
    }
    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Problem.findAndCountAll({
      where,
      offset,
      limit: Number(limit),
      order: [["createdAt", "DESC"]],
      attributes: { exclude: ["sampleInput", "sampleOutput"] },
    });
    return sendSuccess(res, 200, "Problems fetched", {
      problems: rows,
      total: count,
    });
  } catch (err) {
    throw new ApiError(500, "Failed to fetch problems");
  }
};

// Get Problem by ID
export const getProblemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByPk(id);
    throwIf(!problem, 404, "Problem not found");
    return sendSuccess(res, 200, "Problem fetched", problem);
  } catch (err) {
    throw new ApiError(500, "Failed to fetch problem");
  }
};

// Update Problem (Admin only)
export const updateProblem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, difficulty, sampleInput, sampleOutput } =
      req.body;
    const problem = await Problem.findByPk(id);
    throwIf(!problem, 404, "Problem not found");
    if (difficulty)
      throwIf(
        !["Easy", "Medium", "Hard"].includes(difficulty),
        400,
        "Invalid difficulty"
      );
    if (problem) {
      await problem.update({
        title: title ?? problem.title,
        description: description ?? problem.description,
        difficulty: difficulty ?? problem.difficulty,
        sampleInput: sampleInput ?? problem.sampleInput,
        sampleOutput: sampleOutput ?? problem.sampleOutput,
      });
      return sendSuccess(res, 200, "Problem updated", problem);
    }
  } catch (err) {
    throw new ApiError(500, "Failed to update problem");
  }
};

// Delete Problem (Admin only)
export const deleteProblem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const problem = await Problem.findByPk(id);
    throwIf(!problem, 404, "Problem not found");
    if (problem) {
      await problem.destroy();
      return sendSuccess(res, 200, "Problem deleted");
    }
  } catch (err: any) {
    throw new ApiError(500, "Failed to delete problem")
  }
};
