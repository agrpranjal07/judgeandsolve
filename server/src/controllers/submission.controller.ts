import { Request, Response } from "express";
import Submission from "../models/submission.model.js";
import Problem from "../models/problem.model.js";
import { throwIf, sendSuccess } from "../utils/helper.js";

const isAdmin = (user: any) => user && user.usertype === "Admin";

// Submit code
export const submitCode = async (req: Request, res: Response) => {
  try {
    const { problemId, code, language } = req.body;
    throwIf(!problemId || !code || !language, 400, "problemId, code, and language are required");
    const problem = await Problem.findByPk(problemId);
    throwIf(!problem, 404, "Problem not found");
    const userId = (req.user as any)?.id;
    throwIf(!userId, 401, "User not found");
    const submission = await Submission.create({
      userId: userId,
      problemId,
      code,
      language,
      status: "Pending",
      verdict: "Unknown",
    });
    return sendSuccess(res, 201, "Submission created", submission);
  } catch (err) { throw err; }
};

// List all submissions of the logged-in user
export const listUserSubmissions = async (req: Request, res: Response) => {
  try {
    const userId= (req.user as any)?.id;
    if(!userId) throw new Error("User not found");
    const submissions = await Submission.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });
    return sendSuccess(res, 200, "User submissions fetched", submissions);
  } catch (err) { throw err; }
};

// View specific submission (only user or admin)
export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findByPk(id);
    throwIf(!submission, 404, "Submission not found");
    const userId= (req.user as any)?.id;
    if(!userId) throw new Error("User not found");
    throwIf(
      submission?.userId !== userId && !isAdmin(req.user),
      403,
      "Not authorized to view this submission"
    );
    return sendSuccess(res, 200, "Submission fetched", submission);
  } catch (err) { throw err; }
};

// View all submissions for a problem (Admin only)
export const getProblemSubmissions = async (req: Request, res: Response) => {
  try {
    const { problemId } = req.params;
    const submissions = await Submission.findAll({
      where: { problemId },
      order: [["createdAt", "DESC"]],
    });
    return sendSuccess(res, 200, "Problem submissions fetched", submissions);
  } catch (err) { throw err; }
}; 