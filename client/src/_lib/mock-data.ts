// Mock user profile data
export const mockUserData = {
    id: "user-123",
    username: "CodeMaster42",
    email: "codemaster@example.com",
    role: "USER", // or "ADMIN"
    avatar: "", // Empty for now to use fallback
    createdAt: "2024-01-15T12:30:45.000Z"
  };
  
  // Mock user statistics
  export const mockUserStats = {
    totalAttempted: 47,
    totalAccepted: 32,
    accuracyRate: 68, // Percentage
    totalSubmissions: 61
  };
  
  // Optionally, define a type for clarity
  export type Submission = {
    id: string;
    problemId: string;
    problemTitle: string;
    language: string;
    verdict: string;
    createdAt: string;
    runtime: number;
    memory: number;
  };
  
  // Mock submissions data
  export const mockSubmissions: Submission[] = [
    {
      id: "sub-1",
      problemId: "prob-1",
      problemTitle: "Two Sum",
      language: "Python",
      verdict: "ACCEPTED",
      createdAt: "2025-05-20T14:32:15.000Z",
      runtime: 42,
      memory: 8.2
    },
    {
      id: "sub-2",
      problemId: "prob-2",
      problemTitle: "Binary Tree Traversal",
      language: "JavaScript",
      verdict: "WRONG_ANSWER",
      createdAt: "2025-05-19T09:21:44.000Z",
      runtime: 67,
      memory: 12.8
    },
    {
      id: "sub-3",
      problemId: "prob-3",
      problemTitle: "Merge Sort Implementation",
      language: "C++",
      verdict: "TIME_LIMIT_EXCEEDED",
      createdAt: "2025-05-17T16:05:30.000Z",
      runtime: 2500,
      memory: 10.1
    },
    {
      id: "sub-4",
      problemId: "prob-4",
      problemTitle: "Dynamic Programming Challenge",
      language: "Java",
      verdict: "MEMORY_LIMIT_EXCEEDED",
      createdAt: "2025-05-15T11:47:22.000Z",
      runtime: 156,
      memory: 256.4
    },
    {
      id: "sub-5",
      problemId: "prob-5",
      problemTitle: "Graph Algorithm Problem",
      language: "Go",
      verdict: "RUNTIME_ERROR",
      createdAt: "2025-05-12T18:33:02.000Z",
      runtime: 88,
      memory: 14.7
    }
  ];
  