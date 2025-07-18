import api from './api';

export interface DashboardStats {
  totalAccepted: number;
  accuracyRate: string;
  totalAttempted: number;
}

export interface RecentSubmission {
  id: string;
  problemTitle: string;
  language: string;
  verdict: string;
  time: string;
  createdAt: string;
}

export interface DashboardData {
  recentSubmissions: RecentSubmission[];
  userStats: DashboardStats | null;
}

export class DashboardService {
  async getRecentSubmissions(limit: number = 3, offset: number = 0): Promise<RecentSubmission[]> {
    const response = await api.get(`/recentSubmissions?limit=${limit}&offset=${offset}`);
    return response.data.data || [];
  }

  async getUserStats(username: string): Promise<DashboardStats> {
    const response = await api.get(`/stats/user/${username}/`);
    return response.data.data;
  }

  async getDashboardData(username: string): Promise<DashboardData> {
    const [recentSubmissions, userStats] = await Promise.all([
      this.getRecentSubmissions(3, 0),
      this.getUserStats(username).catch(() => null)
    ]);

    return {
      recentSubmissions,
      userStats,
    };
  }
}

export const dashboardService = new DashboardService();
