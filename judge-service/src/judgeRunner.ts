import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { JudgeJob, JudgeResult } from "./types.js";

const langConfig = {
  python: {
    runtime: "/usr/bin/python3",
    file: "main.py",
    run: (file: string) => `python3 ${file}`,
  },
  cpp: {
    compiler: "/usr/bin/g++",
    file: "main.cpp",
    executable: "main.out",
    compile: (file: string) => `g++ ${file} -o main.out`,
    run: () => `./main.out`,
  },
  js: {
    runtime: "/usr/bin/node",
    file: "main.js",
    run: (file: string) => `node ${file}`,
  },
};

export async function runJudgeJob(job: JudgeJob): Promise<JudgeResult[]> {
  const tmpDir = path.join("/tmp", `judge_${uuidv4()}`);
  await fs.mkdir(tmpDir, { recursive: true });
  const results: JudgeResult[] = [];
  const lang = langConfig[job.language];

  if (!lang) {
    throw new Error(`Unsupported language: ${job.language}`);
  }

  try {
    // Write code file
    const codePath = path.join(tmpDir, lang.file);
    await fs.writeFile(codePath, job.code);

    // For C++, compile first
    if (job.language === "cpp") {
      const cppLang = lang as typeof langConfig.cpp;
      try {
        await execPromise(
          `cd ${tmpDir} && ${cppLang.compile(cppLang.file)}`,
          job.timeLimit * 1000
        );
      } catch (e) {
        // Compilation error for all testcases
        return job.testcases.map(tc => ({
          testcaseId: tc.testcaseId,
          passed: false,
          runtime: 0,
          memory: 0,
          output: "",
          error: "Compilation Error",
        }));
      }
    }

    // Run for each testcase
    for (const tc of job.testcases) {
      const inputPath = path.join(tmpDir, "input.txt");
      await fs.writeFile(inputPath, tc.input);

      const runCmd = job.language === "cpp"
        ? `cd ${tmpDir} && timeout ${job.timeLimit}s ${langConfig.cpp.run()} < input.txt`
        : `cd ${tmpDir} && timeout ${job.timeLimit}s ${lang.run(lang.file)} < input.txt`;

      let output = "", error = "", runtime = 0, memory = 0;
      const start = Date.now();
      
      try {
        output = await execPromise(runCmd, job.timeLimit * 1000 + 1000);
        runtime = (Date.now() - start) / 1000;
      } catch (e: any) {
        error = e.message || "Runtime Error";
        runtime = (Date.now() - start) / 1000;
      }

      // Compare output (normalize whitespace)
      const normalize = (str: string) => str.replace(/\s+/g, " ").trim();
      const passed = !error && normalize(output) === normalize(tc.expectedOutput);

      results.push({
        testcaseId: tc.testcaseId,
        passed,
        runtime,
        memory, // TODO: Implement memory tracking
        output,
        error: error || undefined,
      });
    }
  } finally {
    // Cleanup
    await fs.rm(tmpDir, { recursive: true, force: true });
  }

  return results;
}

function execPromise(cmd: string, timeout: number): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout }, (err, stdout, stderr) => {
      if (err) return reject(stderr || err.message);
      resolve(stdout);
    });
  });
}
