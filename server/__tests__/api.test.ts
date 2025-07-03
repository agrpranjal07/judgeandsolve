import request from 'supertest';
import { sequelize } from '../src/config/database.js';
import User from '../src/models/user.model.js';
import Problem from '../src/models/problem.model.js';
import Tag from '../src/models/tag.model.js';
import Submission from '../src/models/submission.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../src/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

describe('🧪 Core Server Tests', () => {
  let adminToken: string;
  let userToken: string;
  let moderatorToken: string;
  let testProblem: any;
  let testUser: any;

  beforeAll(async () => {
    try {
      // Test database connection
      await sequelize.authenticate();
      console.log('API Test: Database connection established successfully.');

      // Sync database
      await sequelize.sync({ force: true });
      console.log('API Test: Database synced successfully.');

      // Create test users
      const hashedPassword = await bcrypt.hash('password123', 10);

      const [admin, moderator, user] = await Promise.all([
        User.create({
          username: 'admin',
          email: 'admin@test.com',
          password: hashedPassword,
          usertype: 'Admin',
        }),
        User.create({
          username: 'moderator',
          email: 'moderator@test.com',
          password: hashedPassword,
          usertype: 'Moderator',
        }),
        User.create({
          username: 'testuser',
          email: 'user@test.com',
          password: hashedPassword,
          usertype: 'User',
        })
      ]);

      testUser = user;

      // Generate tokens
      adminToken = jwt.sign({ id: admin.id, username: admin.username, usertype: admin.usertype }, JWT_SECRET);
      moderatorToken = jwt.sign({ id: moderator.id, username: moderator.username, usertype: moderator.usertype }, JWT_SECRET);
      userToken = jwt.sign({ id: user.id, username: user.username, usertype: user.usertype }, JWT_SECRET);

      // Create test problem
      testProblem = await Problem.create({
        title: 'Test Problem',
        description: 'A test problem for testing',
        difficulty: 'Easy',
        sampleInput: '5',
        sampleOutput: '5',
        createdBy: user.id,
      });

      console.log('API Test: Test data created successfully.');
    } catch (error) {
      console.error('API Test: Error setting up test environment:', error);
      throw error;
    }
  }, 60000);

  afterAll(async () => {
    try {
      await sequelize.close();
      console.log('API Test: Database connection closed successfully.');
    } catch (error) {
      console.error('API Test: Error closing database connection:', error);
    }
  }, 10000);

  describe('🏠 Basic API Tests', () => {
    test('GET /api/v1 - should return welcome message', async () => {
      const response = await request(app)
        .get('/api/v1')
        .expect(200);

      expect(response.text).toContain('Welcome to the API of JudgeAndSolve');
    });

    test('404 for non-existent routes', async () => {
      await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);
    });
  });

  describe('🔐 Authentication Tests', () => {
    test('GET /api/v1/auth/me - should return user data with valid token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.usertype).toBe('Admin');
    });

    test('GET /api/v1/auth/me - should return 401 without token', async () => {
      await request(app)
        .get('/api/v1/auth/me')
        .expect(401);
    });

    test('GET /api/v1/auth/me - should return 401 with invalid token', async () => {
      await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('🏷️ Tag Management Tests', () => {
    test('POST /api/v1/tags - admin can create tags', async () => {
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'algorithms',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('algorithms');
    });

    test('POST /api/v1/tags - moderator can create tags', async () => {
      const response = await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          name: 'data-structures',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('data-structures');
    });

    test('POST /api/v1/tags - user cannot create tags', async () => {
      await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'forbidden-tag',
        })
        .expect(403);
    });

    test('GET /api/v1/tags - should return all tags', async () => {
      const response = await request(app)
        .get('/api/v1/tags')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('📝 Problem Management Tests', () => {
    test('POST /api/v1/problems - admin can create problems', async () => {
      const response = await request(app)
        .post('/api/v1/problems')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Admin Problem',
          description: 'Created by admin',
          difficulty: 'Medium',
          sampleInput: '10',
          sampleOutput: '10',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Admin Problem');
    });

    test('POST /api/v1/problems - moderator can create problems', async () => {
      const response = await request(app)
        .post('/api/v1/problems')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          title: 'Moderator Problem',
          description: 'Created by moderator',
          difficulty: 'Hard',
          sampleInput: '20',
          sampleOutput: '20',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Moderator Problem');
    });

    test('POST /api/v1/problems - user cannot create problems', async () => {
      await request(app)
        .post('/api/v1/problems')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'User Problem',
          description: 'Should not work',
          difficulty: 'Easy',
          sampleInput: '5',
          sampleOutput: '5',
        })
        .expect(403);
    });

    test('GET /api/v1/problems - should return all problems', async () => {
      const response = await request(app)
        .get('/api/v1/problems')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('GET /api/v1/problems/:id - should return specific problem', async () => {
      const response = await request(app)
        .get(`/api/v1/problems/${testProblem.id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testProblem.id);
      expect(response.body.data.title).toBe('Test Problem');
    });

    test('PUT /api/v1/problems/:id - admin can edit any problem', async () => {
      const response = await request(app)
        .put(`/api/v1/problems/${testProblem.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated by Admin',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated by Admin');
    });

    test('PUT /api/v1/problems/:id - problem creator can edit their problem', async () => {
      const response = await request(app)
        .put(`/api/v1/problems/${testProblem.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Updated by Creator',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated by Creator');
    });
  });

  describe('🧪 Testcase Management Tests', () => {
    test('POST /api/v1/problems/:id/testcases - admin can add testcases', async () => {
      const response = await request(app)
        .post(`/api/v1/problems/${testProblem.id}/testcases`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          input: 'test input',
          expectedOutput: 'test output',
          isPublic: true,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.input).toBe('test input');
    });

    test('POST /api/v1/problems/:id/testcases - problem creator can add testcases', async () => {
      const response = await request(app)
        .post(`/api/v1/problems/${testProblem.id}/testcases`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          input: 'creator input',
          expectedOutput: 'creator output',
          isPublic: false,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.input).toBe('creator input');
    });

    test('GET /api/v1/problems/:id/testcases/public - should return public testcases', async () => {
      const response = await request(app)
        .get(`/api/v1/problems/${testProblem.id}/testcases/public`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('📤 Submission Tests', () => {
    test('POST /api/v1/submissions - authenticated user can submit', async () => {
      const response = await request(app)
        .post('/api/v1/submissions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          problemId: testProblem.id,
          code: 'print("Hello World")',
          language: 'python',
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBe(testUser.id);
      expect(response.body.data.problemId).toBe(testProblem.id);
    });

    test('POST /api/v1/submissions - requires authentication', async () => {
      await request(app)
        .post('/api/v1/submissions')
        .send({
          problemId: testProblem.id,
          code: 'print("Hello World")',
          language: 'python',
        })
        .expect(401);
    });

    test('POST /api/v1/submissions - validates required fields', async () => {
      await request(app)
        .post('/api/v1/submissions')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          code: 'print("Hello World")',
          language: 'python',
        })
        .expect(400);
    });

    test('GET /api/v1/submissions - user can get their submissions', async () => {
      const response = await request(app)
        .get('/api/v1/submissions')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('🛡️ Authorization Policy Tests', () => {
    test('Admin can access all resources', async () => {
      // Admin can view any problem
      await request(app)
        .get(`/api/v1/problems/${testProblem.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // Admin can edit any problem
      await request(app)
        .put(`/api/v1/problems/${testProblem.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ title: 'Admin Edit' })
        .expect(200);
    });

    test('Moderator has elevated permissions', async () => {
      // Moderator can create problems
      await request(app)
        .post('/api/v1/problems')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({
          title: 'Moderator Test',
          description: 'Test',
          difficulty: 'Easy',
          sampleInput: '1',
          sampleOutput: '1',
        })
        .expect(201);

      // Moderator can create tags
      await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${moderatorToken}`)
        .send({ name: 'moderator-tag' })
        .expect(201);
    });

    test('Regular user has limited permissions', async () => {
      // User cannot create problems
      await request(app)
        .post('/api/v1/problems')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'User Problem',
          description: 'Should fail',
          difficulty: 'Easy',
          sampleInput: '1',
          sampleOutput: '1',
        })
        .expect(403);

      // User cannot create tags
      await request(app)
        .post('/api/v1/tags')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'user-tag' })
        .expect(403);
    });
  });

  describe('🚫 Error Handling Tests', () => {
    test('Should handle non-existent resources', async () => {
      await request(app)
        .get('/api/v1/problems/non-existent-id')
        .expect(404);
    });

    test('Should validate input data', async () => {
      // Missing required fields
      await request(app)
        .post('/api/v1/problems')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          description: 'Missing title',
        })
        .expect(400);
    });

    test('Should handle authorization errors gracefully', async () => {
      // Unauthorized access
      await request(app)
        .post('/api/v1/problems')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Test',
          description: 'Test',
          difficulty: 'Easy',
          sampleInput: '1',
          sampleOutput: '1',
        })
        .expect(403);
    });
  });
});
