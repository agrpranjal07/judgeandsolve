export interface JudgeTestcase {
  input: string;
  expectedOutput: string;
  testcaseId: string;
}

export interface JudgeJob {
  submissionId: string;
  code: string;
  language: "python" | "cpp" | "js";
  testcases: JudgeTestcase[];
  timeLimit: number;
  memoryLimit: number;
}

export interface JudgeResult {
  testcaseId: string;
  passed: boolean;
  runtime: number;
  memory: number;
  output: string;
  error?: string;
}
