import axios from "axios";

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
  timeLimit: number; // seconds
  memoryLimit: number; // MB
}

export interface JudgeResult {
  testcaseId: string;
  passed: boolean;
  runtime: number;
  memory: number;
  output: string;
  error?: string;
}

const JUDGE_SERVICE_URL = process.env.JUDGE_SERVICE_URL || "http://judge-service:4001";

export async function runJudgeJob(job: JudgeJob): Promise<JudgeResult[]> {
  try {
    console.log(`Sending judge job to ${JUDGE_SERVICE_URL}/judge`);
    const response = await axios.post(`${JUDGE_SERVICE_URL}/judge`, job, {
      timeout: (job.timeLimit + 10) * 1000, // Add buffer for network latency
    });

    if (response.data.success) {
      return response.data.results;
    } else {
      throw new Error(response.data.error || "Judge service error");
    }
  } catch (error: any) {
    console.error("Failed to communicate with judge service:", error.message);
    
    // Return error results for all testcases
    return job.testcases.map(tc => ({
      testcaseId: tc.testcaseId,
      passed: false,
      runtime: 0,
      memory: 0,
      output: "",
      error: "Judge Service Error",
    }));
  }
}