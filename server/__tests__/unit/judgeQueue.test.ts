import { judgeQueue, judgeWorker } from '../../src/judge/judgeQueue';

describe('🔧 Judge Queue Unit Tests', () => {
  afterAll(async () => {
    // Clean up Redis connections
    try {
      await judgeQueue.close();
      await judgeWorker.close();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  test('judgeQueue should be defined', () => {
    expect(judgeQueue).toBeDefined();
    expect(judgeWorker).toBeDefined();
  });

  test('judgeQueue should have correct name', () => {
    expect(judgeQueue.name).toBe('judge');
  });
});
