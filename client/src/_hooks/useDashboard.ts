import { useState, useEffect } from "react";
import { useToast } from "@/_hooks/use-toast";
import useAuthStore from "@/_store/auth";
import { dashboardService, DashboardStats, RecentSubmission } from "@/_services/dashboard.service";

export const useDashboard = () => {
  const accessToken = useAuthStore((s) => s.accessToken);
  const { user } = useAuthStore();
  const [recentSubmissions, setRecentSubmissions] = useState<RecentSubmission[]>([]);
  const [userStats, setUserStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!accessToken || !user?.username) {
      setIsLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const data = await dashboardService.getDashboardData(user.username);
        setRecentSubmissions(data.recentSubmissions);
        setUserStats(data.userStats);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [accessToken, user?.username, toast]);

  return {
    recentSubmissions,
    userStats,
    isLoading,
    user,
  };
};
