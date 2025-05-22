"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar";
import { Badge } from "@/_components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Skeleton } from "@/_components/ui/skeleton";
import { Button } from "@/_components/ui/button";
import { CalendarDays, Code, CheckCircle, ListChecks, ArrowRight } from "lucide-react";
import { UserStatsCard } from "@/_components/profile/UserStatsCard";
import { SubmissionsTable } from "@/_components/profile/SubmissionTable";
import { useToast } from "@/_hooks/use-toast";
import { mockUserStats, mockSubmissions } from "@/_lib/mock-data";
import { useAuthGuard } from "@/_hooks/useAuthGuard";
import useAuthStore from "@/_store/auth";
import api from "@/_services/api";

interface UserData {
  username: string;
  email: string;
  usertype: string;
  createdAt: Date;
}

const ProfilePage = () => {
  useAuthGuard();
  const router = useRouter();
  const { toast } = useToast();

  const { user, setUser } = useAuthStore();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user info if not present in store
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data);
        setUserData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      }
    };

    if (!user || !userData) {
      fetchUser();
    } else {
      setUserData(user);
    }
  }, [user, setUser, userData, setUserData]);

  // Mock stats and recent submissions
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setUserStats(mockUserStats);
        setRecentSubmissions(mockSubmissions);
      } catch (err) {
        toast({
          title: "Error loading profile",
          description: "Something went wrong while loading stats",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [toast]);

  const getInitials = (name?: string) => {
    return name ? name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "U";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">

      <div className="container mx-auto px-4 ">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {isLoading ? (
                <Skeleton className="h-20 w-20 rounded-full" />
              ) : (
                <Avatar className="h-20 w-20">
                  <AvatarImage src="" alt={userData?.username} />
                  <AvatarFallback className="bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200 text-xl">
                    {getInitials(userData?.username)}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="space-y-2 flex-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold">{userData?.username}</h2>
                      <Badge className={userData?.usertype === "Admin" ? "bg-violet-600" : "bg-blue-500"}>
                        {userData?.usertype}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{userData?.email}</p>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDays className="mr-2 h-4 w-4" />
                      Joined on {new Date(userData?.createdAt || Date.now()).toLocaleDateString()}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <h2 className="text-xl font-semibold mb-4">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <UserStatsCard
            title="Problems Attempted"
            value={userStats?.totalAttempted}
            icon={<ListChecks className="h-5 w-5 text-blue-500 dark:text-blue-400" />}
            isLoading={isLoading}
          />
          <UserStatsCard
            title="Accepted Solutions"
            value={userStats?.totalAccepted}
            icon={<CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />}
            isLoading={isLoading}
          />
          <UserStatsCard
            title="Accuracy Rate"
            value={`${userStats?.accuracyRate}%`}
            icon={<Code className="h-5 w-5 text-violet-500 dark:text-violet-400" />}
            isLoading={isLoading}
          />
        </div>

        {/* Submissions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Submissions</h2>
            <Button
              variant="outline"
              size="sm"
              className="text-violet-600 border-violet-600 dark:text-violet-400 dark:border-violet-400"
              onClick={() => router.push("/submissions")}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <SubmissionsTable submissions={recentSubmissions} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
