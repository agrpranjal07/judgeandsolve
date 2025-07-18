import api from './api';

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  sampleInput: string;
  sampleOutput: string;
  createdBy: string;
  tags: string[];
}

export interface TestCase {
  id: string;
  problemId: string;
  input: string;
  output: string;
}

export interface TestResult {
  testcaseId: string;
  passed: boolean;
  output: string;
}

export interface SubmissionResult {
  status: string;
  verdict: string;
  results: {
    testcaseId: string;
    passed: boolean;
    runtime: number;
    memory?: number;
  }[];
}

export interface PastSubmission {
  id: string;
  problemTitle: string;
  problemId: string;
  language: string;
  verdict: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | "RUNTIME_ERROR" | "COMPILATION_ERROR";
  createdAt: string;
  runtime: number;
  memory: number;
}

export interface AIReview {
  reviewText: string;
  rating: number;
}

export class ProblemService {
  async getProblem(problemId: string): Promise<Problem> {
    const [problemRes, , tagsRes] = await Promise.all([
      api.get(`/problems/${problemId}`),
      api.get(`/problems/${problemId}/testcases/public`),
      api.get(`/problems/${problemId}/tags`),
    ]);

    const problemData = problemRes.data.data;
    const creatorId = problemData.createdBy;
    
    try {
      const creatorRes = await api.get(`/auth/profile/${creatorId}`);
      if (creatorRes.data.data) {
        problemData.createdBy = creatorRes.data.data.username || "Unknown";
      } else {
        problemData.createdBy = "Unknown";
      }
    } catch {
      problemData.createdBy = "Unknown";
    }

    return {
      ...problemData,
      tags: tagsRes.data.data.map((tag: { id: string; name: string }) => tag.name),
    };
  }

  async getPublicTestCases(problemId: string): Promise<TestCase[]> {
    const response = await api.get(`/problems/${problemId}/testcases/public`);
    
    if (response.data.data.length === 0) {
      return [];
    }

    return response.data.data
      .filter((tc: unknown) => (tc as { isSample: boolean }).isSample)
      .map((tc: unknown) => ({
        id: (tc as { id: string }).id,
        problemId: (tc as { problemId: string }).problemId,
        input: (tc as { input: string }).input,
        output: (tc as { output: string }).output,
      }));
  }

  async getPastSubmissions(problemId: string): Promise<PastSubmission[]> {
    const response = await api.get(`/problems/${problemId}/submissions`);
    return response.data.data || [];
  }

  async testCode(params: {
    problemId: string;
    language: string;
    code: string;
    testcases: Array<{ input: string; expectedOutput: string }>;
  }): Promise<TestResult[]> {
    const response = await api.post("/submissions/testcases", params);
    
    if (response.data.data.length === 0) {
      return [];
    }

    return response.data.data.map((tc: unknown) => ({
      testcaseId: (tc as { testcaseId: string }).testcaseId,
      passed: (tc as { passed: boolean }).passed,
      output: (tc as { output: string }).output,
    }));
  }

  async submitCode(params: {
    problemId: string;
    language: string;
    code: string;
  }): Promise<{ id: string }> {
    const response = await api.post("/submissions", params);
    return response.data.data;
  }

  async getSubmissionStatus(submissionId: string): Promise<SubmissionResult & { testcaseResults: { testcaseId: string; passed: boolean; runtime: number; memory?: number }[] }> {
    const response = await api.get(`/submissions/${submissionId}`);
    const submission = response.data.data;
    
    return {
      status: submission.status,
      verdict: submission.verdict,
      results: submission.testcaseResults,
      testcaseResults: submission.testcaseResults,
    };
  }

  async getAIReview(params: {
    problemId: string;
    code: string;
    language: string;
  }): Promise<AIReview> {
    const response = await api.post("/ai/review", params);
    return response.data.data;
  }
}

export const problemService = new ProblemService();
