// __tests__/judgeQueue.test.ts

import { Queue, Worker } from 'bullmq';
import { sequelize } from '../src/config/database';
import Submission from '../src/models/submission.model';
import Testcase from '../src/models/testcase.model';
import SubmissionTestcaseResult from '../src/models/submission_testcase_result.model';
import { judgeQueue, judgeWorker } from '../src/judge/judgeQueue';
import User from '../src/models/user.model';
import Problem from '../src/models/problem.model';

jest.setTimeout(36_000); // allow up to 36s for Docker-based judging

describe('🔨 judgeQueue.ts integration', () => {
  let queue: Queue;
  let worker: Worker;
  let submissionId: string;

  beforeAll(async () => {
    // 1) Use the real queue/worker
    queue = judgeQueue;
    worker = judgeWorker;

    // 2) (Re)create tables
    await sequelize.sync({ force: true });

    const user = await User.create({
      username: 'testuser',
      email: 'testuser@localhost.com',
      password: 'password',
      usertype: 'User',
    });

    const problem = await Problem.create({
      title: 'Test Problem',
      description: 'This is a test problem',
      difficulty: 'Easy',
      sampleInput: 'foo',
      sampleOutput: 'foo',
      createdBy: user.id,
    })

    const sub = await Submission.create({
      userId: user.id,
      problemId: problem.id,
      code: 'print(input())',
      language: 'python',
      status: 'Pending',
      verdict: 'Unknown',
    });

    
    submissionId = sub.id;

    await Testcase.bulkCreate([
      {  problemId: problem.id, input: 'foo',  output: 'foo', isSample: false },
      {  problemId: problem.id, input: 'bar',  output: 'bar', isSample: false },
    ]);
  });

  afterAll(async () => {
    // teardown: close worker, queue, DB
    await worker.close();
    await queue.close();
    await sequelize.close();
  });

  test('should pick up the job, judge it, and record results', (done) => {
    // Listen for completion or failure
    worker.on('completed', async (job) => {
      try {
        // 1) submission status + verdict
        const updated = await Submission.findByPk(submissionId);
        expect(updated).toBeTruthy();
        expect(updated!.status).toBe('Completed');
        expect(updated!.verdict).toBe('Accepted'); // both inputs echo => Accepted

        // 2) two testcase results
        const results = await SubmissionTestcaseResult.findAll({ where: { submissionId } });
        expect(results.length).toBe(2);
        for (const r of results) {
          expect(r.passed).toBe(true);
          expect(typeof r.runtime).toBe('number');
          expect(typeof r.memory).toBe('number');
        }

        done();
      } catch (err) {
        done(err as Error);
      }
    });

    worker.on('failed', (_job, err) => done(err));

    // Enqueue the job
    queue.add('judge', {
      submissionId,
      code: 'print(input())',
      language: 'python',
      timeLimit: 2,
      memoryLimit: 256,
    });
  });
});
