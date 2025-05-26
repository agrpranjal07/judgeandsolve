import { exec } from "child_process";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

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

const langConfig = {
  python: {
    image: "python:3.11",
    file: "main.py",
    run: (file: string) => `python ${file}`,
  },
  cpp: {
    image: "gcc:13",
    file: "main.cpp",
    compile: (file: string) => `g++ ${file} -o main.out`,
    run: () => `./main.out`,
  },
  js: {
    image: "node:20",
    file: "main.js",
    run: (file: string) => `node ${file}`,
  },
};

export async function runJudgeJob(job: JudgeJob): Promise<JudgeResult[]> {
  const tmpDir = path.join(process.cwd(), `tmp/judge_${uuidv4()}`);
  await fs.mkdir(tmpDir, { recursive: true });
  const results: JudgeResult[] = [];
  const lang = langConfig[job.language];
  if (!lang) {
    throw new Error(`Unsupported language: ${job.language}`);
  }

  // Write code file
  const codePath = path.join(tmpDir, lang.file);
  await fs.writeFile(codePath, job.code);

  // For C++, compile first
  if (job.language === "cpp") {
    const cppLang = lang as typeof langConfig.cpp;
    const compileCmd = `docker run --rm -v ${tmpDir}:/app -w /app ${cppLang.image} ${cppLang.compile(cppLang.file)}`;
    console.log("Compiling command:", compileCmd);
    try {
      await execPromise(compileCmd, job.timeLimit * 1000);
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

    const runCmd =
        job.language === "cpp"
            ? `docker run --rm -v ${tmpDir}:/app -w /app --memory=${job.memoryLimit}m --cpus=1 ${lang.image} sh -c "timeout ${job.timeLimit}s ${langConfig.cpp.run()} < input.txt"`
            : `docker run --rm -v ${tmpDir}:/app -w /app --memory=${job.memoryLimit}m --cpus=1 ${lang.image} sh -c "timeout ${job.timeLimit}s ${lang.run(lang.file)} < input.txt"`;

    let output = "", error = "", runtime = 0, memory = 0;
    const start = Date.now();
    try {
      output = await execPromise(runCmd, job.timeLimit * 1000);
      runtime = (Date.now() - start) / 1000;
      // TODO: Parse memory usage if needed
    } catch (e: any) {
      error = e.message || "Runtime Error";
    }
    // Compare output (trimmed)
    const normalize = (str: string) => str.replace(/\s/g, "");
const passed = !error && normalize(output) === normalize(tc.expectedOutput);
    results.push({
      testcaseId: tc.testcaseId,
      passed,
      runtime,
      memory,
      output,
      error: error || undefined,
    });
  }
  // Cleanup
  await fs.rm(tmpDir, { recursive: true, force: true });
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