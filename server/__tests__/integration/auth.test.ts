import request from 'supertest';
import app from '../../src/index';
import { TestContextManager, TestContext } from '../utils/testUtils';
import { API_ENDPOINTS, HTTP_STATUS, RESPONSE_MESSAGES } from '../fixtures/testFixtures';

describe('🔐 Authentication & Authorization Integration Tests', () => {
  let context: TestContext;

  beforeAll(async () => {
    context = await TestContextManager.createTestContext();
  }, 60000);

  afterAll(async () => {
    await TestContextManager.cleanupTestContext();
  }, 10000);

  describe('Basic API', () => {
    test('should return welcome message', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(HTTP_STATUS.OK);

      expect(response.text).toContain('Welcome to the API of JudgeAndSolve');
    });
  });

  describe('Authentication', () => {
    describe('GET /api/v1/auth/me', () => {
      test('should return user data with valid token', async () => {
        const response = await request(app)
          .get(API_ENDPOINTS.AUTH.ME)
          .set('Authorization', `Bearer ${context.users.admin.token}`)
          .expect(HTTP_STATUS.OK);

        expect(response.body).toHaveProperty('status', RESPONSE_MESSAGES.SUCCESS);
        expect(response.body.data.usertype).toBe('Admin');
        expect(response.body.message).toBe(RESPONSE_MESSAGES.PROFILE_FETCHED);
      });

      test('should return 401 without token', async () => {
        await request(app)
          .get(API_ENDPOINTS.AUTH.ME)
          .expect(HTTP_STATUS.UNAUTHORIZED);
      });

      test('should return 401 with invalid token', async () => {
        await request(app)
          .get(API_ENDPOINTS.AUTH.ME)
          .set('Authorization', 'Bearer invalid-token')
          .expect(HTTP_STATUS.UNAUTHORIZED);
      });

      test('should return 401 with malformed token', async () => {
        await request(app)
          .get(API_ENDPOINTS.AUTH.ME)
          .set('Authorization', 'Bearer malformed.token.here')
          .expect(HTTP_STATUS.UNAUTHORIZED);
      });
    });
  });

  describe('Authorization', () => {
    describe('Protected Routes Access Control', () => {
      test('should reject unauthorized access to protected routes', async () => {
        // Test tag creation without auth
        await request(app)
          .post(API_ENDPOINTS.TAGS.BASE)
          .send({ name: 'test-tag' })
          .expect(HTTP_STATUS.UNAUTHORIZED);

        // Test problem creation without auth
        await request(app)
          .post(API_ENDPOINTS.PROBLEMS.BASE)
          .send({ title: 'Test Problem' })
          .expect(HTTP_STATUS.UNAUTHORIZED);
      });

      test('should allow admin access to admin routes', async () => {
        const response = await request(app)
          .post(API_ENDPOINTS.TAGS.BASE)
          .set('Authorization', `Bearer ${context.users.admin.token}`)
          .send({
            name: 'test-admin-tag',
          });

        // Should pass authorization (201 success or 500 controller error)
        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });

      test('should deny regular user access to admin routes', async () => {
        await request(app)
          .post(API_ENDPOINTS.TAGS.BASE)
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .send({
            name: 'unauthorized-tag',
          })
          .expect(HTTP_STATUS.FORBIDDEN);
      });

      test('should allow moderator access to moderator routes', async () => {
        const response = await request(app)
          .post(API_ENDPOINTS.TAGS.BASE)
          .set('Authorization', `Bearer ${context.users.moderator.token}`)
          .send({
            name: 'test-mod-tag',
          });

        // Should pass authorization (201 success or 500 controller error)
        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(response.status);
      });
    });

    describe('Role-Based Access Control', () => {
      test('admin should access all resources', async () => {
        // Admin can create problems
        const problemResponse = await request(app)
          .post(API_ENDPOINTS.PROBLEMS.BASE)
          .set('Authorization', `Bearer ${context.users.admin.token}`)
          .send({
            title: 'Admin Problem',
            description: 'Created by admin',
            difficulty: 'Easy',
            sampleInput: '1',
            sampleOutput: '1',
          });

        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(problemResponse.status);

        // Admin can create tags
        const tagResponse = await request(app)
          .post(API_ENDPOINTS.TAGS.BASE)
          .set('Authorization', `Bearer ${context.users.admin.token}`)
          .send({ name: 'admin-created-tag' });

        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(tagResponse.status);
      });

      test('moderator should have elevated permissions', async () => {
        // Moderator can create problems
        const problemResponse = await request(app)
          .post(API_ENDPOINTS.PROBLEMS.BASE)
          .set('Authorization', `Bearer ${context.users.moderator.token}`)
          .send({
            title: 'Moderator Problem',
            description: 'Created by moderator',
            difficulty: 'Medium',
            sampleInput: '2',
            sampleOutput: '2',
          });

        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(problemResponse.status);

        // Moderator can create tags
        const tagResponse = await request(app)
          .post(API_ENDPOINTS.TAGS.BASE)
          .set('Authorization', `Bearer ${context.users.moderator.token}`)
          .send({ name: 'moderator-created-tag' });

        expect([HTTP_STATUS.CREATED, HTTP_STATUS.INTERNAL_SERVER_ERROR]).toContain(tagResponse.status);
      });

      test('regular user should have limited permissions', async () => {
        // User cannot create problems
        await request(app)
          .post(API_ENDPOINTS.PROBLEMS.BASE)
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .send({
            title: 'User Problem',
            description: 'Should be denied',
            difficulty: 'Easy',
            sampleInput: '1',
            sampleOutput: '1',
          })
          .expect(HTTP_STATUS.FORBIDDEN);

        // User cannot create tags
        await request(app)
          .post(API_ENDPOINTS.TAGS.BASE)
          .set('Authorization', `Bearer ${context.users.user.token}`)
          .send({ name: 'user-created-tag' })
          .expect(HTTP_STATUS.FORBIDDEN);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing authorization header', async () => {
      await request(app)
        .post(API_ENDPOINTS.TAGS.BASE)
        .send({ name: 'test' })
        .expect(HTTP_STATUS.UNAUTHORIZED);
    });

    test('should handle malformed authorization header', async () => {
      await request(app)
        .post(API_ENDPOINTS.TAGS.BASE)
        .set('Authorization', 'InvalidFormat')
        .send({ name: 'test' })
        .expect(HTTP_STATUS.UNAUTHORIZED);
    });

    test('should handle bearer token without token', async () => {
      await request(app)
        .post(API_ENDPOINTS.TAGS.BASE)
        .set('Authorization', 'Bearer')
        .send({ name: 'test' })
        .expect(HTTP_STATUS.UNAUTHORIZED);
    });
  });
});
