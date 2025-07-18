import { Problem } from '../_services/problem.service';

export interface ProblemsFilter {
  difficulty?: string;
  page?: number;
  limit?: number;
}

export interface IProblemsService {
  getProblems(filter?: ProblemsFilter): Promise<{
    problems: Problem[];
    totalPages: number;
  }>;
  getSolvedProblems(): Promise<string[]>;
}
