import { Queue, Worker, Job } from "bullmq";
import { runJudgeJob } from "./judgeRunner.js";
import Submission from "../models/submission.model.js";
import SubmissionTestcaseResult from "../models/submission_testcase_result.model.js";
import Testcase from "../models/testcase.model.js";

// Use REDIS_URL if available, else fallback to individual env vars
const redisUrl = process.env.REDIS_URL;
const redisOptions = redisUrl
  ? { connection: { url: redisUrl } }
  : {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
        username: process.env.REDIS_USERNAME || undefined,
        password: process.env.REDIS_PASSWORD || undefined,
      },
    };

// Define the queue for processing judge jobs
const judgeQueue = new Queue("judge", redisOptions);
import { sequelize } from "../config/database.js"; // If you want to use transactions

const judgeWorker = new Worker(
  "judge",
  async (job: Job) => {
    const { submissionId, code, language, timeLimit, memoryLimit } = job.data;
    let submission;
    const transaction = await sequelize.transaction();
    try {
      submission = await Submission.findByPk(submissionId, { transaction });
      if (!submission) throw new Error("Submission not found");

      const testcases = await Testcase.findAll({ where: { problemId: submission.problemId }, transaction });
      await submission.update({ status: "Running" }, { transaction });

      const judgeResults = await runJudgeJob({
        submissionId,
        code,
        language,
        testcases: testcases.map(tc => ({
          input: tc.input,
          expectedOutput: tc.output,
          testcaseId: tc.id,
        })),
        timeLimit: timeLimit || 2,
        memoryLimit: memoryLimit || 256,
      });
      let verdict: Submission['verdict'] = "Accepted";
      for (const res of judgeResults) {
        if (!res.passed) {
          verdict = (res.error === "Compilation Error" || res.error === "Runtime Error") ? res.error : "Wrong Answer";
          break;
        }
      }

      await SubmissionTestcaseResult.bulkCreate(
        judgeResults.map(res => ({
          submissionId,
          testcaseId: res.testcaseId,
          passed: res.passed,
          runtime: res.runtime,
          memory: res.memory,
        })),
        { transaction }
      );

      await submission.update(
        { status: "Completed", verdict },
        { transaction }
      );

      await transaction.commit();
    } catch (err) {
      console.error(`Error processing judge job for submissionId ${submissionId}:`, err);
      if (submission) {
        await submission.update({ status: "Failed" }, { transaction });
      }
      await transaction.rollback();
    }
  },
  {
    ...redisOptions,
    concurrency: 10,  // Process up to 10 jobs concurrently
    limiter: {
      max: 10,  // Max jobs per second
      duration: 1000,  // Time window in milliseconds
    }
  }
);

// Export both the queue and the worker so they can be used elsewhere
export { judgeQueue, judgeWorker };
