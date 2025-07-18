import api from './api';

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  reviewNote: string | null;
  status: string;
  verdict: string;
  createdAt: string;
}

export interface TestcaseResult {
  testcaseId?: string;
  passed: boolean;
  runtime: number;
  memory: number;
}

export interface Problem {
  id: string;
  title: string;
}

export interface SubmissionDetail {
  submission: Submission;
  testcaseResults: TestcaseResult[];
  problem: Problem;
}

export class SubmissionService {
  async getSubmissionDetail(submissionId: string): Promise<SubmissionDetail> {
    const response = await api.get(`/submissions/${submissionId}`);
    const data = response.data.data;
    
    // The API returns submission fields directly spread in the response
    // We need to extract them properly
    const { testcaseResults, ...submissionData } = data;
    
    const submission: Submission = {
      id: submissionData.id,
      userId: submissionData.userId,
      problemId: submissionData.problemId,
      code: submissionData.code,
      language: submissionData.language,
      reviewNote: submissionData.reviewNote || null, // Safe access with fallback
      status: submissionData.status,
      verdict: submissionData.verdict,
      createdAt: submissionData.createdAt,
    };

    // For now, we'll need to fetch problem details separately
    // since the current API doesn't include problem data
    let problem: Problem = { id: submission.problemId, title: "Loading..." };
    
    try {
      const problemResponse = await api.get(`/problems/${submission.problemId}`);
      problem = {
        id: submission.problemId,
        title: problemResponse.data.data.title,
      };
    } catch (error) {
      console.warn("Failed to fetch problem details:", error);
      // Keep the default problem object
    }

    return {
      submission,
      testcaseResults: testcaseResults || [],
      problem,
    };
  }

  async saveReviewNote(submissionId: string, reviewNote: string): Promise<Submission> {
    const response = await api.post(`/submissions/review/${submissionId}`, {
      reviewNote,
    });
    return response.data.data;
  }

  // Note: Run code functionality removed as it requires test cases
  // Users should use the problem page to test code instead

  // Utility methods
  getVerdictIcon(verdict: string): string {
    if (verdict?.toLowerCase().includes("accept")) return "check-circle";
    if (verdict?.toLowerCase().includes("pending")) return "clock";
    return "x-circle";
  }

  getVerdictColor(verdict: string): string {
    if (verdict?.toLowerCase().includes("accept")) 
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300";
    if (verdict?.toLowerCase().includes("pending")) 
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300";
  }

  calculateTestCaseStats(testcaseResults: TestcaseResult[]) {
    const passed = testcaseResults.filter((t) => t.passed).length;
    const avgRuntime = testcaseResults.length
      ? Math.round(testcaseResults.reduce((a, b) => a + (b.runtime || 0), 0) / testcaseResults.length)
      : 0;
    const avgMemory = testcaseResults.length
      ? (testcaseResults.reduce((a, b) => a + (b.memory || 0), 0) / testcaseResults.length).toFixed(1)
      : "0.0";

    return { passed, total: testcaseResults.length, avgRuntime, avgMemory };
  }
}

export const submissionService = new SubmissionService();
