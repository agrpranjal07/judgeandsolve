import { runJudgeJob, JudgeResult, JudgeJob } from '../src/judge/judgeRunner.js';
import { v4 as uuidv4 } from 'uuid';

// Mock the `runJudgeJob` function
jest.mock('../src/judge/judgeRunner.js', () => ({
  runJudgeJob: jest.fn(),
}));

describe('Judge Job Tests', () => {
  // Mock results for all languages
  const mockedResult: JudgeResult[] = [
    {
      testcaseId: 'tc1',
      passed: true,
      runtime: 0.5,
      memory: 64,
      output: '9\n',
      error: undefined,
    },
  ];

  beforeEach(() => {
    // Reset the mock before each test to ensure no carryover state
    (runJudgeJob as jest.Mock).mockReset();
  });

  it('should run a Python judge job and return the correct result', async () => {
    // Mock the resolved value of the runJudgeJob function
    (runJudgeJob as jest.Mock).mockResolvedValue(mockedResult);

    const result = await runJudgeJob({
      submissionId: uuidv4(),
      code: `
        n = int(input())
        print(n * n)
      `.trim(),
      language: 'python',
      testcases: [
        { input: '3', expectedOutput: '9\n', testcaseId: 'tc1' },
        { input: '5', expectedOutput: '25\n', testcaseId: 'tc2' },
      ],
      timeLimit: 2,
      memoryLimit: 128,
    });

    expect(runJudgeJob).toHaveBeenCalledWith(expect.objectContaining({
      language: 'python',
      testcases: expect.arrayContaining([
        expect.objectContaining({ input: '3', expectedOutput: '9\n' }),
      ]),
    }));

    expect(result).toEqual(mockedResult);
  });

  it('should run a C++ judge job and return the correct result', async () => {
    // Mock the resolved value of the runJudgeJob function
    (runJudgeJob as jest.Mock).mockResolvedValue(mockedResult);

    const result = await runJudgeJob({
      submissionId: uuidv4(),
      code: `
        #include <iostream>
        using namespace std;

        int main() {
            int n;
            cin >> n;
            cout << n * n << endl;
            return 0;
        }
      `.trim(),
      language: 'cpp',
      testcases: [
        { input: '3', expectedOutput: '9\n', testcaseId: 'tc1' },
        { input: '5', expectedOutput: '25\n', testcaseId: 'tc2' },
      ],
      timeLimit: 2,
      memoryLimit: 128,
    });

    expect(runJudgeJob).toHaveBeenCalledWith(expect.objectContaining({
      language: 'cpp',
      testcases: expect.arrayContaining([
        expect.objectContaining({ input: '3', expectedOutput: '9\n' }),
      ]),
    }));

    expect(result).toEqual(mockedResult);
  });

  it('should run a JavaScript judge job and return the correct result', async () => {
    // Mock the resolved value of the runJudgeJob function
    (runJudgeJob as jest.Mock).mockResolvedValue(mockedResult);

    const result = await runJudgeJob({
      submissionId: uuidv4(),
      code: `
        const readline = require('readline');

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
          terminal: false
        });

        let input = [];

        rl.on('line', line => {
          input.push(line);
        });

        rl.on('close', () => {
          const n = parseInt(input[0]);
          console.log(n * n);
        });
      `.trim(),
      language: 'js',
      testcases: [
        { input: '3', expectedOutput: '9\n', testcaseId: 'tc1' },
        { input: '5', expectedOutput: '25\n', testcaseId: 'tc2' },
      ],
      timeLimit: 2,
      memoryLimit: 128,
    });

    expect(runJudgeJob).toHaveBeenCalledWith(expect.objectContaining({
      language: 'js',
      testcases: expect.arrayContaining([
        expect.objectContaining({ input: '3', expectedOutput: '9\n' }),
      ]),
    }));

    expect(result).toEqual(mockedResult);
  });
});
