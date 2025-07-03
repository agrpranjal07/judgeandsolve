import express from "express";
import cors from "cors";
import { runJudgeJob } from "./judgeRunner.js";
import { JudgeJob } from "./types.js";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.post("/judge", async (req, res) => {
  try {
    const job: JudgeJob = req.body;
    
    // Validate request
    if (!job.code || !job.language || !Array.isArray(job.testcases)) {
      return res.status(400).json({ error: "Invalid job data" });
    }

    console.log(`Processing judge job for submission: ${job.submissionId}, language: ${job.language}`);
    const results = await runJudgeJob(job);
    res.json({ success: true, results });
  } catch (error: any) {
    console.error("Judge error:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Judge service running on port ${PORT}`);
});
