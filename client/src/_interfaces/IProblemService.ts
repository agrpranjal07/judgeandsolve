import { 
  Problem, 
  TestCase, 
  TestResult, 
  SubmissionResult, 
  PastSubmission, 
  AIReview 
} from '../_services/problem.service';

export interface IProblemService {
  getProblem(problemId: string): Promise<Problem>;
  getPublicTestCases(problemId: string): Promise<TestCase[]>;
  getPastSubmissions(problemId: string): Promise<PastSubmission[]>;
  testCode(params: {
    problemId: string;
    language: string;
    code: string;
    testcases: Array<{ input: string; expectedOutput: string }>;
  }): Promise<TestResult[]>;
  submitCode(params: {
    problemId: string;
    language: string;
    code: string;
  }): Promise<{ id: string }>;
  getSubmissionStatus(submissionId: string): Promise<SubmissionResult & { 
    testcaseResults: { testcaseId: string; passed: boolean; runtime: number; memory?: number }[] 
  }>;
  getAIReview(params: {
    problemId: string;
    code: string;
    language: string;
  }): Promise<AIReview>;
}
