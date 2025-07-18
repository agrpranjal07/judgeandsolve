import api from './api';

export interface UserData {
  username: string;
  email: string;
  usertype: string;
  createdAt: Date;
}

export interface UserStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  problemsSolved: number;
  recentSubmissions: any[];
}

export class ProfileService {
  async getUserProfile(): Promise<UserData> {
    const response = await api.get("/auth/me");
    return response.data.data;
  }

  async getUserStats(username: string): Promise<UserStats> {
    const response = await api.get(`/stats/user/${username}/`);
    return response.data.data;
  }

  async getRecentSubmissions(limit: number = 5, offset: number = 0): Promise<any[]> {
    const response = await api.get(`/recentSubmissions?limit=${limit}&offset=${offset}`);
    return response.data.data || [];
  }
}

export const profileService = new ProfileService();
