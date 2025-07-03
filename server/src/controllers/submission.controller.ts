import { Request, Response } from "express";
import Submission from "../models/submission.model.js";
import Problem from "../models/problem.model.js";
import { throwIf, sendSuccess } from "../utils/helper.js";
import { judgeQueue } from "../judge/judgeQueue.js";
import SubmissionTestcaseResult from "../models/submission_testcase_result.model.js";
import { ApiError } from "../utils/ApiError.js";
import langMap from "../config/languageMap.js";
import { runJudgeJob } from "../judge/judgeRunner.js";
import { canPerform } from "../policies.js";

// Extend Express Request type for loadedResource
declare module 'express-serve-static-core' {
  interface Request {
    loadedResource?: any;
  }
}

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
    const allowedLanguages = Object.keys(langMap);
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
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(500, "Failed to submit code");
  }
};

// Test sample code against provided test cases
export const testSampleCode = async (req: Request, res: Response) => {
  try {
    const { problemId, code, language, testcases } = req.body;

    // Validate input
    throwIf(!problemId || !code || !language || !Array.isArray(testcases), 400, "Missing required fields");

    const normalizedLang = language.trim().toLowerCase();
    const supportedLangs = Object.keys(langMap);
    throwIf(!supportedLangs.includes(normalizedLang), 400, "Unsupported language");

    // Run judge job
    const results = await runJudgeJob({
      submissionId: "test-" + Date.now(), 
      code,
      language: normalizedLang,
      testcases: testcases.map((tc: any, idx: number) => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        testcaseId: `sample-${idx + 1}`
      })),
      timeLimit: 2,
      memoryLimit: 128
    });

    return sendSuccess(res, 200, "Sample test run completed", results);
  } catch (err) {
    console.error(err);
    throw new ApiError(500, "Failed to run test cases");
  }
};



// List all submissions of the logged-in user
export const listUserSubmissions = async (req: Request, res: Response) => {
  try {
    const userId= (req.user as any)?.id;
    if(!userId) throw new Error("User not found");
    const { limit, offset } = req.query;
    let submissions: Submission[] = [];
    if(!limit || !offset) {
    submissions = await Submission.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
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
  }
  else {
    submissions = await Submission.findAll({
      where: { userId },
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [["createdAt", "DESC"]],
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
  }

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
    return sendSuccess(res, 200, "User submissions fetched", formatted);
  } catch (err){
    throw new ApiError(500, "Failed to fetch user submissions");
  }
};

export const getUserSolvedProblems = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    throwIf(!userId, 401, "User not found");
    const listOfProblemIds = await Submission.findAll({
      where: { userId },
      attributes: ["problemId"],
      group: ["problemId"],
      raw: true,
    });
    // Extract only problem IDs from the results
    const problemIds = listOfProblemIds.map((sub: any) => sub.problemId);
    
    return sendSuccess(res, 200, "Problems fetched", problemIds);
  } catch (err) {
    throw new ApiError(500, "Failed to fetch problems");
  }
}
// View specific submission (only user or admin)
export const getSubmissionById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const submission = await Submission.findByPk(id);
    throwIf(!submission, 404, "Submission not found");
    const userId= (req.user as any)?.id;
    if(!userId) throw new ApiError(401, "User not found");
    
    const user = req.user as { id: string; usertype: string };
    const canView = canPerform(user, 'submission', submission, 'can_view');
    throwIf(!canView, 403, "Not authorized to view this submission");
    
    const testcaseResults = await SubmissionTestcaseResult.findAll({
      where: { submissionId: id },
    });
    return sendSuccess(res, 200, "Submission fetched", {
      ...submission!.toJSON(),
      testcaseResults,
    });
  } catch (err) {
    // Preserve the original error if it's an ApiError
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(500, "Failed to fetch submission");
  }
};

export const setSubmissionReviewNote = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reviewNote } = req.body;
    const userId = (req.user as any)?.id;

    throwIf(!id, 400, "Submission ID is required");
    throwIf(!reviewNote || typeof reviewNote !== "string", 400, "Review note is required");
    throwIf(!userId, 401, "User not authenticated");

    const submission = await Submission.findByPk(id);
    throwIf(!submission, 404, "Submission not found");
  if(submission){
    const user = req.user as { id: string; usertype: string };
    const canEdit = canPerform(user, 'submission', submission, 'can_edit');
    throwIf(!canEdit, 403, "Not authorized to update review");

    submission.reviewNote = reviewNote;
    await submission.save();

    return sendSuccess(res, 200, "Review note updated successfully", {
      id: submission.id,
      reviewNote: submission.reviewNote
    });
  }
  } catch (err) {
    console.error("Error setting review note:", err);
    throw new ApiError(500, "Failed to set submission review");
  }
}
// View all submissions for a problem (with proper authorization)
export const getProblemSubmissions = async (req: Request, res: Response) => {
  try {
    const { problemId } = req.params;
    const user = req.user as { id: string; usertype: string };
    
    // Build query conditions based on user permissions
    const whereConditions: any = { problemId };
    
    // If user is not Admin or Moderator, only show their own submissions
    // This filtering is still needed since authorization only determines if they can access the endpoint
    if (user.usertype !== 'Admin' && user.usertype !== 'Moderator') {
      whereConditions.userId = user.id;
    }
    
    const submissions = await Submission.findAll({
      where: whereConditions,
      order: [["createdAt", "DESC"]],
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
    return sendSuccess(res, 200, "Problem submissions fetched", formatted);
  } catch (err) {
    // Preserve the original error if it's an ApiError
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(500, "Failed to fetch problem submissions");
  }
};

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