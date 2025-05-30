import { Request, Response } from "express";
import Submission from "../models/submission.model.js";
import Problem from "../models/problem.model.js";
import { throwIf, sendSuccess } from "../utils/helper.js";
import { judgeQueue } from "../judge/judgeQueue.js";
import SubmissionTestcaseResult from "../models/submission_testcase_result.model.js";
import { ApiError } from "../utils/ApiError.js";
import langMap from "../config/languageMap.js";

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
    // Normalize and validate language
    const normalizedLanguage = language.trim().toLowerCase();
    const allowedLanguages = ["python", "cpp", "js"];
    throwIf(!allowedLanguages.includes(normalizedLanguage), 400, "Unsupported language");
    const submission = await Submission.create({
      userId: userId,
      problemId,
      code,
      language: normalizedLanguage,
      status: "Pending",
      verdict: "Unknown",
    });
    const result = await judgeQueue.add("judge", {
      submissionId: submission.id,
      code,
      language: normalizedLanguage
    });
    return sendSuccess(res, 201, "Submission created", submission);
  } catch (err){
    throw new ApiError(500, "Failed to submit code");
  }
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
  } catch (err){
    throw new ApiError(500, "Failed to fetch user submissions");
  }
};

// View specific submission (only user or admin)
export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findByPk(id);
    throwIf(!submission, 404, "Submission not found");
    const userId= (req.user as any)?.id;
    if(!userId) throw new ApiError(401, "User not found");
    throwIf(
      submission?.userId !== userId && !isAdmin(req.user),
      403,
      "Not authorized to view this submission"
    );
    const testcaseResults = await SubmissionTestcaseResult.findAll({
      where: { submissionId: id },
    });
    return sendSuccess(res, 200, "Submission fetched", {
      ...submission,
      testcaseResults,
    });
  } catch (err){
    throw new ApiError(500, "Failed to fetch submission");
  }
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
  } catch (err){
    throw new ApiError(500, "Failed to fetch problem submissions");
  }
};

// export recent submissions [
//   {
//     id: "sub-1",
//     problemId: "prob-1",
//     problemTitle: "Two Sum",
//     language: "Python",
//     verdict: "ACCEPTED",
//     createdAt: "2025-05-20T14:32:15.000Z",
//     runtime: 42,
//     memory: 8.2
//   },
//   {
//     id: "sub-2",
//     problemId: "prob-2",
//     problemTitle: "Binary Tree Traversal",
//     language: "JavaScript",
//     verdict: "WRONG_ANSWER",
//     createdAt: "2025-05-19T09:21:44.000Z",
//     runtime: 67,
//     memory: 12.8
//   },
//   {
//     id: "sub-3",
//     problemId: "prob-3",
//     problemTitle: "Merge Sort Implementation",
//     language: "C++",
//     verdict: "TIME_LIMIT_EXCEEDED",
//     createdAt: "2025-05-17T16:05:30.000Z",
//     runtime: 2500,
//     memory: 10.1
//   },
//   {
//     id: "sub-4",
//     problemId: "prob-4",
//     problemTitle: "Dynamic Programming Challenge",
//     language: "Java",
//     verdict: "MEMORY_LIMIT_EXCEEDED",
//     createdAt: "2025-05-15T11:47:22.000Z",
//     runtime: 156,
//     memory: 256.4
//   },
//   {
//     id: "sub-5",
//     problemId: "prob-5",
//     problemTitle: "Graph Algorithm Problem",
//     language: "Go",
//     verdict: "RUNTIME_ERROR",
//     createdAt: "2025-05-12T18:33:02.000Z",
//     runtime: 88,
//     memory: 14.7
//   }
// ];
  
export const getRecentSubmissions = async (req: Request, res: Response) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const offset = Number(req.query.offset) || 0;
    const userId = (req.user as any)?.id;
    throwIf(!userId, 401, "User not found");
    const submissions = await Submission.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      include: [
        {
          model: Problem,
          as: "problem",
          attributes: ["title"],
        },
        {
          model: SubmissionTestcaseResult,
          as: "testcaseResults",
          attributes: ["runtime", "memory"],
        },
      ],
    });

    // Transform to required format
    const formatted = submissions.map((sub: any) => {
      // Aggregate runtime and memory (sum or max, here using max)
      let runtime = null;
      let memory = null;
      if (sub.testcaseResults && sub.testcaseResults.length > 0) {
        runtime = Math.max(...sub.testcaseResults.map((t: any) => t.runtime ?? 0));
        memory = Math.max(...sub.testcaseResults.map((t: any) => t.memory ?? 0));
      }
      // Map verdict to UPPERCASE with underscores
      let verdict = (sub.verdict || "Unknown").toUpperCase().replace(/ /g, "_");
      // Map language to readable form
      let language = sub.language;
      if (langMap[sub.language]) {
        language = langMap[sub.language];
      }
      
      // Fallbacks
      return {
        id: sub.id,
        problemId: sub.problemId,
        problemTitle: sub.problem?.title || "",
        language,
        verdict,
        createdAt: sub.createdAt,
        runtime,
        memory,
      };
    });
    return sendSuccess(res, 200, "Recent submissions fetched", formatted);
  } catch (err) {
    throw new ApiError(500, "Failed to fetch recent submissions");
  }
}