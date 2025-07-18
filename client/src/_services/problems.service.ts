import api from './api';
import { Problem, PastSubmission } from './problem.service';

export interface ProblemsFilter {
  difficulty?: string;
  page?: number;
  limit?: number;
}

export interface ProblemsResponse {
  problems: Problem[];
  total: number;
  totalPages: number;
}

export class ProblemsService {
  async getProblems(filter: ProblemsFilter = {}): Promise<ProblemsResponse> {
    const { difficulty, page = 1, limit = 10 } = filter;
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (difficulty && difficulty !== "All") {
      params.set("difficulty", difficulty);
    }

    const response = await api.get(`/problems?${params}`);
    const data = response.data.data;
    
    return {
      problems: data.problems || [],
      total: data.total || 0,
      totalPages: Math.ceil((data.total || 0) / limit),
    };
  }

  async getSolvedProblems(): Promise<string[]> {
    const response = await api.get("/users/solved-problems");
    return response.data.data || [];
  }
}

export const problemsService = new ProblemsService();
