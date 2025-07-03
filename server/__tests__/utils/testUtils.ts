import { sequelize } from '../../src/config/database';
import User from '../../src/models/user.model';
import Problem from '../../src/models/problem.model';
import Tag from '../../src/models/tag.model';
import Submission from '../../src/models/submission.model';
import Testcase from '../../src/models/testcase.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret';

export interface TestUser {
  id: string;
  username: string;
  email: string;
  usertype: 'Admin' | 'Moderator' | 'User';
  token: string;
  model: any; // The actual Sequelize model instance
}

export interface TestContext {
  users: {
    admin: TestUser;
    moderator: TestUser;
    user: TestUser;
    otherUser: TestUser;
  };
  problem: any;
  tag: any;
  submission: any;
  testcase: any;
}

/**
 * Database setup utility for tests
 */
export class DatabaseTestUtils {
  static async setupDatabase(): Promise<void> {
    try {
      await sequelize.authenticate();
      await sequelize.sync({ force: true });
    } catch (error) {
      console.error('Failed to setup test database:', error);
      throw error;
    }
  }

  static async teardownDatabase(): Promise<void> {
    try {
      await sequelize.close();
    } catch (error) {
      console.error('Failed to teardown test database:', error);
    }
  }
}

/**
 * User creation utility for tests
 */
export class UserTestUtils {
  static async createTestUsers(): Promise<TestContext['users']> {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const [adminModel, moderatorModel, userModel, otherUserModel] = await Promise.all([
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
        username: 'otheruser',
        email: 'otheruser@test.com',
        password: hashedPassword,
        usertype: 'User',
      }),
    ]);

    return {
      admin: this.createTestUser(adminModel),
      moderator: this.createTestUser(moderatorModel),
      user: this.createTestUser(userModel),
      otherUser: this.createTestUser(otherUserModel),
    };
  }

  private static createTestUser(model: any): TestUser {
    return {
      id: model.id,
      username: model.username,
      email: model.email,
      usertype: model.usertype,
      token: jwt.sign(
        { id: model.id, username: model.username, usertype: model.usertype },
        JWT_SECRET
      ),
      model,
    };
  }
}

/**
 * Test data creation utility
 */
export class TestDataUtils {
  static async createTestData(users: TestContext['users']): Promise<{
    problem: any;
    tag: any;
    submission: any;
    testcase: any;
  }> {
    // Create test problem
    const problem = await Problem.create({
      title: 'Test Problem',
      description: 'A test problem for testing purposes',
      difficulty: 'Easy',
      sampleInput: '5',
      sampleOutput: '5',
      createdBy: users.user.id,
    });

    // Create test tag
    const tag = await Tag.create({
      name: 'algorithms',
    });

    // Create test submission
    const submission = await Submission.create({
      userId: users.user.id,
      problemId: problem.id,
      code: 'print(input())',
      language: 'python',
      status: 'Completed',
      verdict: 'Accepted',
    });

    // Create test testcase
    const testcase = await Testcase.create({
      problemId: problem.id,
      input: 'test input',
      output: 'test output',
      isSample: true,
    });

    return { problem, tag, submission, testcase };
  }
}

/**
 * Complete test context setup
 */
export class TestContextManager {
  static async createTestContext(): Promise<TestContext> {
    await DatabaseTestUtils.setupDatabase();
    
    const users = await UserTestUtils.createTestUsers();
    const testData = await TestDataUtils.createTestData(users);

    return {
      users,
      problem: testData.problem,
      tag: testData.tag,
      submission: testData.submission,
      testcase: testData.testcase,
    };
  }

  static async cleanupTestContext(): Promise<void> {
    await DatabaseTestUtils.teardownDatabase();
  }
}

/**
 * JWT Token utilities for testing
 */
export class TokenTestUtils {
  static generateValidToken(userId: string, username: string, usertype: string): string {
    return jwt.sign({ id: userId, username, usertype }, JWT_SECRET);
  }

  static generateInvalidToken(): string {
    return 'invalid.token.here';
  }

  static generateMalformedToken(): string {
    return 'malformed.token.structure';
  }

  static generateExpiredToken(userId: string, username: string, usertype: string): string {
    return jwt.sign(
      { id: userId, username, usertype },
      JWT_SECRET,
      { expiresIn: -1 } // Already expired
    );
  }
}
