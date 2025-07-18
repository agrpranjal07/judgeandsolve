import { useState, useEffect } from "react";
import { useToast } from "@/_hooks/use-toast";
import { useAuthGuard } from "@/_hooks/useAuthGuard";
import useAuthStore from "@/_store/auth";
import { profileService, UserData, UserStats, ProfileSubmission } from "@/_services/profile.service";

export const useProfile = () => {
  useAuthGuard();
  
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<ProfileSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user profile if not in store
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profileData = await profileService.getUserProfile();
        setUser(profileData);
        setUserData(profileData);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
        toast({
          title: "Error",
          description: "Failed to load user profile",
          variant: "destructive",
        });
      }
    };

    if (!user || !userData) {
      fetchUserProfile();
    } else {
      setUserData(user);
    }
  }, [user, userData, setUser, toast]);

  // Fetch user stats and recent submissions
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.username) return;

      setIsLoading(true);
      try {
        const [stats, submissions] = await Promise.all([
          profileService.getUserStats(user.username),
          profileService.getRecentSubmissions(5, 0),
        ]);

        setUserStats(stats);
        setRecentSubmissions(submissions);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.username, toast]);

  return {
    userData,
    userStats,
    recentSubmissions,
    isLoading,
  };
};
