import { UserData, UserStats, ProfileSubmission } from '../_services/profile.service';

export interface IProfileService {
  getUserProfile(): Promise<UserData>;
  getUserStats(username: string): Promise<UserStats>;
  getRecentSubmissions(limit?: number, offset?: number): Promise<ProfileSubmission[]>;
}
