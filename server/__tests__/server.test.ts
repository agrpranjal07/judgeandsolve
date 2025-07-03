import request from 'supertest';
import { sequelize } from '../src/config/database.js';
import User from '../src/models/user.model.js';
import Problem from '../src/models/problem.model.js';
import Tag from '../src/models/tag.model.js';
import Testcase from '../src/models/testcase.model.js';
import Submission from '../src/models/submission.model.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import app from '../src/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

interface TestUser {
  id: string;
  username: string;
  email: string;
  usertype: 'Admin' | 'Moderator' | 'User';
  token: string;
}

describe('🧪 Server Integration Tests', () => {
  let adminUser: TestUser;
  let moderatorUser: TestUser;
  let regularUser: TestUser;
  let otherUser: TestUser;
  let testProblem: any;
  let testTag: any;
  let testSubmission: any;

  beforeAll(async () => {
    try {
      // Test database connection
      await sequelize.authenticate();
      console.log('Database connection established successfully.');

      // Sync database with force to ensure clean state
      await sequelize.sync({ force: true });
      console.log('Database synced successfully.');

      // Create test users
      const hashedPassword = await bcrypt.hash('password123', 10);

      const [admin, moderator, user, other] = await Promise.all([
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
          username: 'user',
          email: 'user@test.com',
          password: hashedPassword,
          usertype: 'User',
        }),
        User.create({
          username: 'other',
          email: 'other@test.com',
          password: hashedPassword,
          usertype: 'User',
        })
      ]);

      // Generate JWT tokens
      adminUser = {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        usertype: admin.usertype,
        token: jwt.sign({ id: admin.id, username: admin.username, usertype: admin.usertype }, JWT_SECRET),
      };

      moderatorUser = {
        id: moderator.id,
        username: moderator.username,
        email: moderator.email,
        usertype: moderator.usertype,
        token: jwt.sign({ id: moderator.id, username: moderator.username, usertype: moderator.usertype }, JWT_SECRET),
      };

      regularUser = {
        id: user.id,
        username: user.username,
        email: user.email,
        usertype: user.usertype,
        token: jwt.sign({ id: user.id, username: user.username, usertype: user.usertype }, JWT_SECRET),
      };

      otherUser = {
        id: other.id,
        username: other.username,
        email: other.email,
        usertype: other.usertype,
        token: jwt.sign({ id: other.id, username: other.username, usertype: other.usertype }, JWT_SECRET),
      };

      // Create test data
      testProblem = await Problem.create({
        title: 'Test Problem',
        description: 'A test problem for testing',
        difficulty: 'Easy',
        sampleInput: '5',
        sampleOutput: '5',
        createdBy: regularUser.id,
      });

      testTag = await Tag.create({
        name: 'algorithms',
      });

      testSubmission = await Submission.create({
        userId: regularUser.id,
        problemId: testProblem.id,
        code: 'print(input())',
        language: 'python',
        status: 'Completed',
        verdict: 'Accepted',
      });

      console.log('Test data created successfully.');
    } catch (error) {
      console.error('Error setting up test environment:', error);
      throw error;
    }
  }, 60000);

  afterAll(async () => {
    try {
      // Clean up database connections
      await sequelize.close();
      console.log('Database connection closed successfully.');
    } catch (error) {
      console.error('Error closing database connection:', error);
    }
  }, 10000);

  describe('🔐 Authentication Tests', () => {
    describe('GET /api/v1/auth/me', () => {
      it('should return user data for valid JWT', async () => {
        const response = await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', `Bearer ${adminUser.token}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.id).toBe(adminUser.id);
        expect(response.body.data.user.usertype).toBe('Admin');
      });

      it('should return 401 for invalid JWT', async () => {
        await request(app)
          .get('/api/v1/auth/me')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });

      it('should return 401 for missing JWT', async () => {
        await request(app)
          .get('/api/v1/auth/me')
          .expect(401);
      });
    });
  });

  describe('🏷️ Tag Management Tests', () => {
    describe('POST /api/v1/tags', () => {
      it('should allow admin to create tags', async () => {
        const response = await request(app)
          .post('/api/v1/tags')
          .set('Authorization', `Bearer ${adminUser.token}`)
          .send({
            name: 'dynamic-programming',
            description: 'Dynamic programming problems',
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('dynamic-programming');
      });

      it('should allow moderator to create tags', async () => {
        const response = await request(app)
          .post('/api/v1/tags')
          .set('Authorization', `Bearer ${moderatorUser.token}`)
          .send({
            name: 'graph-theory',
            description: 'Graph theory problems',
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.name).toBe('graph-theory');
      });

      it('should deny regular user from creating tags', async () => {
        await request(app)
          .post('/api/v1/tags')
          .set('Authorization', `Bearer ${regularUser.token}`)
          .send({
            name: 'greedy',
            description: 'Greedy problems',
          })
          .expect(403);
      });

      it('should require authentication', async () => {
        await request(app)
          .post('/api/v1/tags')
          .send({
            name: 'test-tag',
            description: 'Test description',
          })
          .expect(401);
      });
    });

    describe('GET /api/v1/tags', () => {
      it('should return all tags without authentication', async () => {
        const response = await request(app)
          .get('/api/v1/tags')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      });
    });
  });

  describe('📝 Problem Management Tests', () => {
    describe('POST /api/v1/problems', () => {
      it('should allow admin to create problems', async () => {
        const response = await request(app)
          .post('/api/v1/problems')
          .set('Authorization', `Bearer ${adminUser.token}`)
          .send({
            title: 'Admin Problem',
            description: 'A problem created by admin',
            difficulty: 'Medium',
            sampleInput: '10',
            sampleOutput: '10',
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe('Admin Problem');
        expect(response.body.data.createdBy).toBe(adminUser.id);
      });

      it('should allow moderator to create problems', async () => {
        const response = await request(app)
          .post('/api/v1/problems')
          .set('Authorization', `Bearer ${moderatorUser.token}`)
          .send({
            title: 'Moderator Problem',
            description: 'A problem created by moderator',
            difficulty: 'Hard',
            sampleInput: '20',
            sampleOutput: '20',
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe('Moderator Problem');
      });

      it('should deny regular user from creating problems', async () => {
        await request(app)
          .post('/api/v1/problems')
          .set('Authorization', `Bearer ${regularUser.token}`)
          .send({
            title: 'User Problem',
            description: 'A problem created by user',
            difficulty: 'Easy',
            sampleInput: '5',
            sampleOutput: '5',
          })
          .expect(403);
      });
    });

    describe('PUT /api/v1/problems/:id', () => {
      it('should allow admin to edit any problem', async () => {
        const response = await request(app)
          .put(`/api/v1/problems/${testProblem.id}`)
          .set('Authorization', `Bearer ${adminUser.token}`)
          .send({
            title: 'Updated by Admin',
            description: 'Updated description',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe('Updated by Admin');
      });

      it('should allow moderator to edit any problem', async () => {
        const response = await request(app)
          .put(`/api/v1/problems/${testProblem.id}`)
          .set('Authorization', `Bearer ${moderatorUser.token}`)
          .send({
            title: 'Updated by Moderator',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe('Updated by Moderator');
      });

      it('should allow problem creator to edit their problem', async () => {
        const response = await request(app)
          .put(`/api/v1/problems/${testProblem.id}`)
          .set('Authorization', `Bearer ${regularUser.token}`)
          .send({
            title: 'Updated by Creator',
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.title).toBe('Updated by Creator');
      });

      it('should deny other users from editing problem', async () => {
        await request(app)
          .put(`/api/v1/problems/${testProblem.id}`)
          .set('Authorization', `Bearer ${otherUser.token}`)
          .send({
            title: 'Should not update',
          })
          .expect(403);
      });
    });

    describe('GET /api/v1/problems', () => {
      it('should return all problems without authentication', async () => {
        const response = await request(app)
          .get('/api/v1/problems')
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/v1/problems/:id', () => {
      it('should return specific problem without authentication', async () => {
        const response = await request(app)
          .get(`/api/v1/problems/${testProblem.id}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testProblem.id);
      });

      it('should return 404 for non-existent problem', async () => {
        await request(app)
          .get('/api/v1/problems/non-existent-id')
          .expect(404);
      });
    });
  });

  describe('🧪 Testcase Management Tests', () => {
    describe('POST /api/v1/problems/:problemId/testcases', () => {
      it('should allow admin to add testcases', async () => {
        const response = await request(app)
          .post(`/api/v1/problems/${testProblem.id}/testcases`)
          .set('Authorization', `Bearer ${adminUser.token}`)
          .send({
            input: 'test input',
            expectedOutput: 'test output',
            isPublic: true,
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.input).toBe('test input');
      });

      it('should allow moderator to add testcases', async () => {
        const response = await request(app)
          .post(`/api/v1/problems/${testProblem.id}/testcases`)
          .set('Authorization', `Bearer ${moderatorUser.token}`)
          .send({
            input: 'moderator input',
            expectedOutput: 'moderator output',
            isPublic: false,
          })
          .expect(201);

        expect(response.body.success).toBe(true);
      });

      it('should allow problem creator to add testcases', async () => {
        const response = await request(app)
          .post(`/api/v1/problems/${testProblem.id}/testcases`)
          .set('Authorization', `Bearer ${regularUser.token}`)
          .send({
            input: 'creator input',
            expectedOutput: 'creator output',
            isPublic: true,
          })
          .expect(201);

        expect(response.body.success).toBe(true);
      });

      it('should deny other users from adding testcases', async () => {
        await request(app)
          .post(`/api/v1/problems/${testProblem.id}/testcases`)
          .set('Authorization', `Bearer ${otherUser.token}`)
          .send({
            input: 'unauthorized input',
            expectedOutput: 'unauthorized output',
            isPublic: true,
          })
          .expect(403);
      });
    });

    describe('GET /api/v1/problems/:problemId/testcases/public', () => {
      it('should return public testcases without authentication', async () => {
        const response = await request(app)
          .get(`/api/v1/problems/${testProblem.id}/testcases/public`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });

    describe('GET /api/v1/problems/:problemId/testcases', () => {
      it('should require authentication', async () => {
        await request(app)
          .get(`/api/v1/problems/${testProblem.id}/testcases`)
          .expect(401);
      });

      it('should return testcases for authenticated user', async () => {
        const response = await request(app)
          .get(`/api/v1/problems/${testProblem.id}/testcases`)
          .set('Authorization', `Bearer ${adminUser.token}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });
    });
  });

  describe('📤 Submission Tests', () => {
    describe('POST /api/v1/submissions', () => {
      it('should allow authenticated user to submit code', async () => {
        const response = await request(app)
          .post('/api/v1/submissions')
          .set('Authorization', `Bearer ${regularUser.token}`)
          .send({
            problemId: testProblem.id,
            code: 'print("Hello World")',
            language: 'python',
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.data.userId).toBe(regularUser.id);
        expect(response.body.data.problemId).toBe(testProblem.id);
      });

      it('should require authentication', async () => {
        await request(app)
          .post('/api/v1/submissions')
          .send({
            problemId: testProblem.id,
            code: 'print("Hello World")',
            language: 'python',
          })
          .expect(401);
      });

      it('should validate required fields', async () => {
        await request(app)
          .post('/api/v1/submissions')
          .set('Authorization', `Bearer ${regularUser.token}`)
          .send({
            code: 'print("Hello World")',
            language: 'python',
          })
          .expect(400);
      });

      it('should validate language', async () => {
        await request(app)
          .post('/api/v1/submissions')
          .set('Authorization', `Bearer ${regularUser.token}`)
          .send({
            problemId: testProblem.id,
            code: 'console.log("Hello")',
            language: 'invalid-language',
          })
          .expect(400);
      });
    });

    describe('GET /api/v1/submissions', () => {
      it('should return user submissions', async () => {
        const response = await request(app)
          .get('/api/v1/submissions')
          .set('Authorization', `Bearer ${regularUser.token}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should require authentication', async () => {
        await request(app)
          .get('/api/v1/submissions')
          .expect(401);
      });
    });

    describe('GET /api/v1/submissions/:id', () => {
      it('should allow submission owner to view submission', async () => {
        const response = await request(app)
          .get(`/api/v1/submissions/${testSubmission.id}`)
          .set('Authorization', `Bearer ${regularUser.token}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.id).toBe(testSubmission.id);
      });

      it('should allow admin to view any submission', async () => {
        const response = await request(app)
          .get(`/api/v1/submissions/${testSubmission.id}`)
          .set('Authorization', `Bearer ${adminUser.token}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should allow moderator to view any submission', async () => {
        const response = await request(app)
          .get(`/api/v1/submissions/${testSubmission.id}`)
          .set('Authorization', `Bearer ${moderatorUser.token}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });

      it('should deny other users from viewing submission', async () => {
        await request(app)
          .get(`/api/v1/submissions/${testSubmission.id}`)
          .set('Authorization', `Bearer ${otherUser.token}`)
          .expect(403);
      });
    });
  });

  describe('📊 Stats Tests', () => {
    describe('GET /api/v1/recentSubmissions', () => {
      it('should return recent submissions for authenticated user', async () => {
        const response = await request(app)
          .get('/api/v1/recentSubmissions')
          .set('Authorization', `Bearer ${adminUser.token}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should require authentication', async () => {
        await request(app)
          .get('/api/v1/recentSubmissions')
          .expect(401);
      });
    });

    describe('GET /api/v1/users/solved-problems', () => {
      it('should return solved problems for authenticated user', async () => {
        const response = await request(app)
          .get('/api/v1/users/solved-problems')
          .set('Authorization', `Bearer ${regularUser.token}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should require authentication', async () => {
        await request(app)
          .get('/api/v1/users/solved-problems')
          .expect(401);
      });
    });
  });

  describe('🛡️ Policy Authorization Tests', () => {
    it('should enforce problem ownership policies', async () => {
      // Create a problem as one user
      const problemResponse = await request(app)
        .post('/api/v1/problems')
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({
          title: 'Owner Test Problem',
          description: 'Testing ownership',
          difficulty: 'Easy',
          sampleInput: '1',
          sampleOutput: '1',
        })
        .expect(201);

      const problemId = problemResponse.body.data.id;

      // Admin should be able to edit
      await request(app)
        .put(`/api/v1/problems/${problemId}`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({ title: 'Updated by Admin' })
        .expect(200);

      // Moderator should be able to edit
      await request(app)
        .put(`/api/v1/problems/${problemId}`)
        .set('Authorization', `Bearer ${moderatorUser.token}`)
        .send({ title: 'Updated by Moderator' })
        .expect(200);

      // Regular user should NOT be able to edit others' problems
      await request(app)
        .put(`/api/v1/problems/${problemId}`)
        .set('Authorization', `Bearer ${regularUser.token}`)
        .send({ title: 'Should not work' })
        .expect(403);
    });

    it('should enforce submission viewing policies', async () => {
      // Admin can view problem submissions
      await request(app)
        .get(`/api/v1/problems/${testProblem.id}/submissions`)
        .set('Authorization', `Bearer ${adminUser.token}`)
        .expect(200);

      // Moderator can view problem submissions
      await request(app)
        .get(`/api/v1/problems/${testProblem.id}/submissions`)
        .set('Authorization', `Bearer ${moderatorUser.token}`)
        .expect(200);

      // Regular user cannot view problem submissions (unless they own the submission)
      await request(app)
        .get(`/api/v1/problems/${testProblem.id}/submissions`)
        .set('Authorization', `Bearer ${otherUser.token}`)
        .expect(403);
    });
  });

  describe('🚫 Error Handling Tests', () => {
    it('should handle non-existent resources gracefully', async () => {
      await request(app)
        .get('/api/v1/problems/non-existent-id')
        .expect(404);

      await request(app)
        .get('/api/v1/submissions/non-existent-id')
        .set('Authorization', `Bearer ${adminUser.token}`)
        .expect(404);
    });

    it('should validate input data', async () => {
      // Test missing required fields
      await request(app)
        .post('/api/v1/problems')
        .set('Authorization', `Bearer ${adminUser.token}`)
        .send({
          description: 'Missing title',
        })
        .expect(400);

      // Test invalid data
      await request(app)
        .post('/api/v1/submissions')
        .set('Authorization', `Bearer ${regularUser.token}`)
        .send({
          problemId: testProblem.id,
          code: '',
          language: 'python',
        })
        .expect(400);
    });
  });
});
