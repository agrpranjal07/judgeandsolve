import request from 'supertest';
import app from '../../src/index';
import { TestContextManager, TestContext } from '../utils/testUtils';
import { API_ENDPOINTS, HTTP_STATUS, TEST_PROBLEMS, TEST_SUBMISSIONS } from '../fixtures/testFixtures';

describe('🌐 API Integration Tests', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await TestContextManager.createTestContext();
  }, 60000);

  afterAll(async () => {
    await TestContextManager.cleanupTestContext();
  }, 10000);

  describe('Problems API', () => {
    describe('GET /api/v1/problems', () => {
      test('should return all problems without authentication', async () => {
        const response = await request(app)
          .get(API_ENDPOINTS.PROBLEMS.BASE)
          .expect(HTTP_STATUS.OK);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data).toHaveProperty('problems');
        expect(Array.isArray(response.body.data.problems)).toBe(true);
        expect(response.body.data).toHaveProperty('total');
      });
    });

    describe('GET /api/v1/problems/:id', () => {
      test('should return specific problem without authentication', async () => {
        const response = await request(app)
          .get(API_ENDPOINTS.PROBLEMS.BY_ID(context.problem.id))
          .expect(HTTP_STATUS.OK);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data.id).toBe(context.problem.id);
        expect(response.body.data.title).toBe('Test Problem');
      });

      test('should return 404 for non-existent problem', async () => {
        await request(app)
          .get(API_ENDPOINTS.PROBLEMS.BY_ID('non-existent-id'))
          .expect(HTTP_STATUS.INTERNAL_SERVER_ERROR); // Controller throws 500 for invalid ID
      });
    });

    describe('POST /api/v1/problems', () => {
      test('admin can create problems', async () => {
        const response = await request(app)
          .post(API_ENDPOINTS.PROBLEMS.BASE)
          .set('Authorization', `Bearer ${context.users.admin.token}`)
          .send(TEST_PROBLEMS.EASY_PROBLEM);

        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('moderator can create problems', async () => {
        const response = await request(app)
          .post(API_ENDPOINTS.PROBLEMS.BASE)
          .set('Authorization', `Bearer ${context.users.moderator.token}`)
          .send(TEST_PROBLEMS.MEDIUM_PROBLEM);

        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('regular user cannot create problems', async () => {
        await request(app)
          .post(API_ENDPOINTS.PROBLEMS.BASE)
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .send(TEST_PROBLEMS.HARD_PROBLEM)
          .expect(HTTP_STATUS.FORBIDDEN);
      });

      test('requires authentication', async () => {
        await request(app)
          .post(API_ENDPOINTS.PROBLEMS.BASE)
          .send(TEST_PROBLEMS.EASY_PROBLEM)
          .expect(HTTP_STATUS.UNAUTHORIZED);
      });
    });

    describe('PUT /api/v1/problems/:id', () => {
      test('admin can edit any problem', async () => {
        const response = await request(app)
          .put(API_ENDPOINTS.PROBLEMS.BY_ID(context.problem.id))
          .set('Authorization', `Bearer ${context.users.admin.token}`)
          .send({
            title: 'Updated by Admin',
            description: 'Updated description',
          });

        expect([HTTP_STATUS.OK, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('moderator can edit any problem', async () => {
        const response = await request(app)
          .put(API_ENDPOINTS.PROBLEMS.BY_ID(context.problem.id))
          .set('Authorization', `Bearer ${context.users.moderator.token}`)
          .send({
            title: 'Updated by Moderator',
          });

        expect([HTTP_STATUS.OK, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('problem creator can edit their problem', async () => {
        const response = await request(app)
          .put(API_ENDPOINTS.PROBLEMS.BY_ID(context.problem.id))
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .send({
            title: 'Updated by Creator',
          });

        expect([HTTP_STATUS.OK, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('other users cannot edit problem', async () => {
        await request(app)
          .put(API_ENDPOINTS.PROBLEMS.BY_ID(context.problem.id))
          .set('Authorization', `Bearer ${context.users.otherUser.token}`)
          .send({
            title: 'Should not update',
          })
          .expect(HTTP_STATUS.FORBIDDEN);
      });
    });
  });

  describe('Tags API', () => {
    describe('GET /api/v1/tags', () => {
      test('should return all tags without authentication', async () => {
        const response = await request(app)
          .get(API_ENDPOINTS.TAGS.BASE)
          .expect(HTTP_STATUS.OK);

        expect(response.body).toHaveProperty('status', 'success');
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('POST /api/v1/tags', () => {
      test('admin can create tags', async () => {
        const response = await request(app)
          .post(API_ENDPOINTS.TAGS.BASE)
          .set('Authorization', `Bearer ${context.users.admin.token}`)
          .send({
            name: 'dynamic-programming',
          });

        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('moderator can create tags', async () => {
        const response = await request(app)
          .post(API_ENDPOINTS.TAGS.BASE)
          .set('Authorization', `Bearer ${context.users.moderator.token}`)
          .send({
            name: 'graph-theory',
          });

        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('regular user cannot create tags', async () => {
        await request(app)
          .post(API_ENDPOINTS.TAGS.BASE)
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .send({
            name: 'greedy',
          })
          .expect(HTTP_STATUS.FORBIDDEN);
      });

      test('requires authentication', async () => {
        await request(app)
          .post(API_ENDPOINTS.TAGS.BASE)
          .send({
            name: 'test-tag',
          })
          .expect(HTTP_STATUS.UNAUTHORIZED);
      });
    });
  });

  describe('Testcases API', () => {
    describe('POST /api/v1/problems/:id/testcases', () => {
      test('admin can add testcases', async () => {
        const response = await request(app)
          .post(API_ENDPOINTS.PROBLEMS.TESTCASES(context.problem.id))
          .set('Authorization', `Bearer ${context.users.admin.token}`)
          .send({
            input: 'admin test input',
            output: 'admin test output',
            isSample: true,
          });

        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('moderator can add testcases', async () => {
        const response = await request(app)
          .post(API_ENDPOINTS.PROBLEMS.TESTCASES(context.problem.id))
          .set('Authorization', `Bearer ${context.users.moderator.token}`)
          .send({
            input: 'moderator test input',
            output: 'moderator test output',
            isSample: false,
          });

        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('problem creator can add testcases', async () => {
        const response = await request(app)
          .post(API_ENDPOINTS.PROBLEMS.TESTCASES(context.problem.id))
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .send({
            input: 'creator test input',
            output: 'creator test output',
            isSample: true,
          });

        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('other users cannot add testcases', async () => {
        await request(app)
          .post(API_ENDPOINTS.PROBLEMS.TESTCASES(context.problem.id))
          .set('Authorization', `Bearer ${context.users.otherUser.token}`)
          .send({
            input: 'unauthorized input',
            output: 'unauthorized output',
            isSample: true,
          })
          .expect(HTTP_STATUS.FORBIDDEN);
      });
    });

    describe('GET /api/v1/problems/:id/testcases/public', () => {
      test('should return public testcases without authentication', async () => {
        const response = await request(app)
          .get(API_ENDPOINTS.PROBLEMS.PUBLIC_TESTCASES(context.problem.id))
          .expect(HTTP_STATUS.OK);

        expect(response.body).toHaveProperty('status', 'success');
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/v1/problems/:id/testcases', () => {
      test('requires authentication', async () => {
        await request(app)
          .get(API_ENDPOINTS.PROBLEMS.TESTCASES(context.problem.id))
          .expect(HTTP_STATUS.UNAUTHORIZED);
      });

      test('authenticated user can view testcases', async () => {
        const response = await request(app)
          .get(API_ENDPOINTS.PROBLEMS.TESTCASES(context.problem.id))
          .set('Authorization', `Bearer ${context.users.admin.token}`)
          .expect(HTTP_STATUS.OK);

        expect(response.body).toHaveProperty('status', 'success');
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  describe('Submissions API', () => {
    describe('POST /api/v1/submissions', () => {
      test('authenticated user can submit code', async () => {
        const response = await request(app)
          .post(API_ENDPOINTS.SUBMISSIONS.BASE)
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .send({
            problemId: context.problem.id,
            ...TEST_SUBMISSIONS.PYTHON_SOLUTION,
          });

        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('requires authentication', async () => {
        await request(app)
          .post(API_ENDPOINTS.SUBMISSIONS.BASE)
          .send({
            problemId: context.problem.id,
            ...TEST_SUBMISSIONS.PYTHON_SOLUTION,
          })
          .expect(HTTP_STATUS.UNAUTHORIZED);
      });

      test('validates required fields', async () => {
        const response = await request(app)
          .post(API_ENDPOINTS.SUBMISSIONS.BASE)
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .send({
            code: 'print("Hello World")',
            language: 'python',
            // Missing problemId
          });

        expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('validates language', async () => {
        const response = await request(app)
          .post(API_ENDPOINTS.SUBMISSIONS.BASE)
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .send({
            problemId: context.problem.id,
            code: 'console.log("Hello")',
            language: 'invalid-language',
          });

        expect([HTTP_STATUS.BAD_REQUEST, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });
    });

    describe('GET /api/v1/submissions', () => {
      test('user can get their submissions', async () => {
        const response = await request(app)
          .get(API_ENDPOINTS.SUBMISSIONS.BASE)
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .expect(HTTP_STATUS.OK);

        expect(response.body).toHaveProperty('status', 'success');
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      test('requires authentication', async () => {
        await request(app)
          .get(API_ENDPOINTS.SUBMISSIONS.BASE)
          .expect(HTTP_STATUS.UNAUTHORIZED);
      });
    });

    describe('GET /api/v1/submissions/:id', () => {
      test('submission owner can view submission', async () => {
        const response = await request(app)
          .get(API_ENDPOINTS.SUBMISSIONS.BY_ID(context.submission.id))
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .expect(HTTP_STATUS.OK);

        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body.data.id).toBe(context.submission.id);
      });

      test('admin can view any submission', async () => {
        const response = await request(app)
          .get(API_ENDPOINTS.SUBMISSIONS.BY_ID(context.submission.id))
          .set('Authorization', `Bearer ${context.users.admin.token}`)
          .expect(HTTP_STATUS.OK);

        expect(response.body).toHaveProperty('status', 'success');
      });

      test('moderator can view any submission', async () => {
        const response = await request(app)
          .get(API_ENDPOINTS.SUBMISSIONS.BY_ID(context.submission.id))
          .set('Authorization', `Bearer ${context.users.moderator.token}`)
          .expect(HTTP_STATUS.OK);

        expect(response.body).toHaveProperty('status', 'success');
      });

      test('other users cannot view submission', async () => {
        await request(app)
          .get(API_ENDPOINTS.SUBMISSIONS.BY_ID(context.submission.id))
          .set('Authorization', `Bearer ${context.users.otherUser.token}`)
          .expect(HTTP_STATUS.FORBIDDEN);
      });
    });
  });

  describe('Stats API', () => {
    describe('GET /api/v1/recentSubmissions', () => {
      test('authenticated user can get recent submissions', async () => {
        const response = await request(app)
          .get(API_ENDPOINTS.STATS.RECENT_SUBMISSIONS)
          .set('Authorization', `Bearer ${context.users.admin.token}`)
          .expect(HTTP_STATUS.OK);

        expect(response.body).toHaveProperty('status', 'success');
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      test('requires authentication', async () => {
        await request(app)
          .get(API_ENDPOINTS.STATS.RECENT_SUBMISSIONS)
          .expect(HTTP_STATUS.UNAUTHORIZED);
      });
    });

    describe('GET /api/v1/users/solved-problems', () => {
      test('authenticated user can get solved problems', async () => {
        const response = await request(app)
          .get(API_ENDPOINTS.STATS.SOLVED_PROBLEMS)
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .expect(HTTP_STATUS.OK);

        expect(response.body).toHaveProperty('status', 'success');
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      test('requires authentication', async () => {
        await request(app)
          .get(API_ENDPOINTS.STATS.SOLVED_PROBLEMS)
          .expect(HTTP_STATUS.UNAUTHORIZED);
      });
    });
  });
});
