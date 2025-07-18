"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/_components/ui/avatar";
import { Badge } from "@/_components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Skeleton } from "@/_components/ui/skeleton";
import { Button } from "@/_components/ui/button";
import { CalendarDays, Code, CheckCircle, ListChecks, ArrowRight } from "lucide-react";
import { UserStatsCard } from "@/_components/profile/UserStatsCard";
import { SubmissionsTable } from "@/_components/profile/SubmissionTable";
import { useProfile } from "@/_hooks/useProfile";
import { useProtectedRoute } from "@/_hooks/useProtectedRoute";
import AuthLoader from "@/_components/AuthLoader";

const ProfilePage = () => {
  const router = useRouter();
  const { isAllowed, isLoading: authLoading } = useProtectedRoute();
  const { userData, userStats, recentSubmissions, isLoading } = useProfile();

  // Show loading while auth is initializing or user is not allowed
  if (authLoading || !isAllowed) {
    return <AuthLoader />;
  }

  if (isLoading || !userData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card Skeleton */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader className="text-center">
                    <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-8 w-48 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              {/* Stats Skeleton */}
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-8 w-48" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                      <CardHeader>
                        <Skeleton className="h-6 w-32" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-8 w-16" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <Avatar className="h-24 w-24 mx-auto mb-4">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-2xl">
                      {userData.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <CardTitle className="text-2xl">{userData.username}</CardTitle>
                  <Badge variant="secondary">{userData.usertype}</Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Member since {new Date(userData.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Code className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{userData.email}</span>
                  </div>
                  {userStats && (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {userStats.totalAccepted || 0} problems solved
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats and Activity */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Statistics</h2>
                <Button 
                  variant="outline" 
                  onClick={() => router.push("/stats/user")}
                  className="flex items-center gap-2"
                >
                  View Detailed Stats
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Stats Grid */}
              {userStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <UserStatsCard
                    title="Total Submissions"
                    value={userStats.totalSubmissions || 0}
                    icon={<ListChecks className="h-6 w-6" />}
                    isLoading={false}
                  />
                  <UserStatsCard
                    title="Accepted"
                    value={userStats.totalAccepted || 0}
                    icon={<CheckCircle className="h-6 w-6" />}
                    isLoading={false}
                  />
                  <UserStatsCard
                    title="Acceptance Rate"
                    value={`${userStats.accuracyRate || 0}%`}
                    icon={<Code className="h-6 w-6" />}
                    isLoading={false}
                  />
                  <UserStatsCard
                    title="Problems Attempted"
                    value={userStats.totalAttempted || 0}
                    icon={<CheckCircle className="h-6 w-6" />}
                    isLoading={false}
                  />
                </div>
              )}

              {/* Recent Submissions */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Submissions</CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push("/submissions")}
                    className="flex items-center gap-2"
                  >
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <SubmissionsTable 
                    submissions={recentSubmissions} 
                    isLoading={false} 
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
