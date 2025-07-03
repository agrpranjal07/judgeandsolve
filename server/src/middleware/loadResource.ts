import { Request, Response, NextFunction } from 'express';
import Problem from '../models/problem.model.js';
import Submission from '../models/submission.model.js';
import Testcase from '../models/testcase.model.js';

/**
 * Middleware to load problem data for testcase operations
 * This ensures that testcase policies can access problem.createdBy
 */
export const loadProblemForTestcase = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const problemId = req.params.problemId || req.body.problemId;
    if (!problemId) {
      return res.status(400).json({ error: 'Problem ID is required' });
    }

    const problem = await Problem.findByPk(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Attach problem data to request for policy evaluation
    req.body.problem = problem;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load problem data' });
  }
};

/**
 * Middleware to load submission data for submission operations
 */
export const loadSubmissionData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const submissionId = req.params.id || req.body.id;
    if (!submissionId) {
      return res.status(400).json({ error: 'Submission ID is required' });
    }

    const submission = await Submission.findByPk(submissionId);
    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    // Attach submission data to request for policy evaluation
    req.body.userId = submission.userId;
    req.loadedResource = submission;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load submission data' });
  }
};

/**
 * Middleware to load problem data for problem operations
 */
export const loadProblemData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const problemId = req.params.id || req.body.id;
    if (!problemId) {
      return res.status(400).json({ error: 'Problem ID is required' });
    }

    const problem = await Problem.findByPk(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Attach problem data to request for policy evaluation
    req.body.createdBy = problem.createdBy;
    req.loadedResource = problem;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Failed to load problem data' });
  }
};

/**
 * Middleware to load problem submissions for authorization
 * This allows policies to check if user can view submissions for a specific problem
 */
export const loadProblemSubmissions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const problemId = req.params.problemId;
    if (!problemId) {
      return res.status(400).json({ error: 'Problem ID is required' });
    }

    // For authorization purposes, we create a virtual resource that represents
    // the "problem submissions" resource with the problemId
    req.loadedResource = {
      type: 'problem_submissions',
      problemId: problemId,
      // This will be used by policies to determine access
    };

    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to load problem submissions context',
    });
  }
};

/**
 * Middleware to load problem data for testcase operations by testcase ID
 * This ensures that testcase policies can access problem.createdBy when operating on individual testcases
 */
export const loadProblemForTestcaseById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const testcaseId = req.params.id;
    if (!testcaseId) {
      return res.status(400).json({ error: 'Testcase ID is required' });
    }

    // Find the testcase and include the associated problem
    const testcase: any = await Testcase.findByPk(testcaseId, {
      include: [{ model: Problem, as: 'problem' }],
    });

    if (!testcase) {
      return res.status(404).json({ error: 'Testcase not found' });
    }

    // Attach problem data to request for policy evaluation
    req.body.problem = testcase.problem;
    req.loadedResource = testcase;
    next();
  } catch (error) {
    return res.status(500).json({
      error: 'Failed to load testcase and problem data',
    });
  }
};
