import api from './api';

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
