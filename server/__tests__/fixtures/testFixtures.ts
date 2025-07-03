/**
 * Test fixtures for consistent test data
 */

export const TEST_USERS = {
  ADMIN: {
    username: 'admin',
    email: 'admin@test.com',
    password: 'password123',
    usertype: 'Admin' as const,
  },
  MODERATOR: {
    username: 'moderator',
    email: 'moderator@test.com',
    password: 'password123',
    usertype: 'Moderator' as const,
  },
  USER: {
    username: 'user',
    email: 'user@test.com',
    password: 'password123',
    usertype: 'User' as const,
  },
  OTHER_USER: {
    username: 'otheruser',
    email: 'otheruser@test.com',
    password: 'password123',
    usertype: 'User' as const,
  },
} as const;

export const TEST_PROBLEMS = {
  EASY_PROBLEM: {
    title: 'Simple Addition',
    description: 'Add two numbers and return the result',
    difficulty: 'Easy' as const,
    sampleInput: '5 3',
    sampleOutput: '8',
  },
  MEDIUM_PROBLEM: {
    title: 'Array Sort',
    description: 'Sort an array of integers',
    difficulty: 'Medium' as const,
    sampleInput: '[3, 1, 4, 1, 5]',
    sampleOutput: '[1, 1, 3, 4, 5]',
  },
  HARD_PROBLEM: {
    title: 'Graph Traversal',
    description: 'Find shortest path in a graph',
    difficulty: 'Hard' as const,
    sampleInput: 'graph with nodes',
    sampleOutput: 'shortest path',
  },
} as const;

export const TEST_TAGS = {
  ALGORITHMS: {
    name: 'algorithms',
  },
  DATA_STRUCTURES: {
    name: 'data-structures',
  },
  DYNAMIC_PROGRAMMING: {
    name: 'dynamic-programming',
  },
  GRAPH_THEORY: {
    name: 'graph-theory',
  },
} as const;

export const TEST_SUBMISSIONS = {
  PYTHON_SOLUTION: {
    code: 'a, b = map(int, input().split())\nprint(a + b)',
    language: 'python',
    status: 'Completed',
    verdict: 'Accepted',
  },
  JAVASCRIPT_SOLUTION: {
    code: 'const [a, b] = readline().split(" ").map(Number);\nprint(a + b);',
    language: 'javascript',
    status: 'Completed',
    verdict: 'Accepted',
  },
  FAILED_SOLUTION: {
    code: 'print("wrong answer")',
    language: 'python',
    status: 'Completed',
    verdict: 'Wrong Answer',
  },
} as const;

export const TEST_TESTCASES = {
  PUBLIC_TESTCASE: {
    input: '5 3',
    output: '8',
    isSample: true,
  },
  PRIVATE_TESTCASE: {
    input: '100 200',
    output: '300',
    isSample: false,
  },
  EDGE_CASE: {
    input: '0 0',
    output: '0',
    isSample: false,
  },
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    ME: '/api/v1/auth/me',
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
  },
  PROBLEMS: {
    BASE: '/api/v1/problems',
    BY_ID: (id: string) => `/api/v1/problems/${id}`,
    TESTCASES: (id: string) => `/api/v1/problems/${id}/testcases`,
    PUBLIC_TESTCASES: (id: string) => `/api/v1/problems/${id}/testcases/public`,
    SUBMISSIONS: (id: string) => `/api/v1/problems/${id}/submissions`,
  },
  TAGS: {
    BASE: '/api/v1/tags',
    BY_ID: (id: string) => `/api/v1/tags/${id}`,
  },
  SUBMISSIONS: {
    BASE: '/api/v1/submissions',
    BY_ID: (id: string) => `/api/v1/submissions/${id}`,
  },
  STATS: {
    RECENT_SUBMISSIONS: '/api/v1/recentSubmissions',
    SOLVED_PROBLEMS: '/api/v1/users/solved-problems',
  },
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const RESPONSE_MESSAGES = {
  SUCCESS: 'success',
  ERROR: 'error',
  PROFILE_FETCHED: 'Profile fetched',
  PROBLEM_CREATED: 'Problem created',
  TAG_CREATED: 'Tag created',
  SUBMISSION_CREATED: 'Submission created',
  TESTCASE_CREATED: 'Testcase created',
} as const;
