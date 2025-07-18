import api from './api';
import { IProfileService } from '../_interfaces/IProfileService';

export interface UserData {
  id: string;
  username: string;
  email: string;
  usertype: string;
  createdAt: string;
}

export interface UserStats {
  totalSubmissions: number;
  totalAccepted: number;
  accuracyRate: number;
  totalAttempted: number;
}

export interface ProfileSubmission {
  id: string;
  problemTitle: string;
  problemId: string;
  language: string;
  verdict: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | "RUNTIME_ERROR" | "COMPILATION_ERROR";
  createdAt: string;
  runtime: number;
  memory: number;
}

export class ProfileService implements IProfileService {
  async getUserProfile(): Promise<UserData> {
    const response = await api.get("/auth/me");
    return response.data.data;
  }

  async getUserStats(username: string): Promise<UserStats> {
    const response = await api.get(`/stats/user/${username}/`);
    return response.data.data;
  }

  async getRecentSubmissions(limit: number = 5, offset: number = 0): Promise<ProfileSubmission[]> {
    const response = await api.get(`/recentSubmissions?limit=${limit}&offset=${offset}`);
    return response.data.data || [];
  }
}

export const profileService = new ProfileService();
