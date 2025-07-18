"use client";

import { useRouter } from "next/navigation";
import { Code, Trophy, Clock } from "lucide-react";
import { DashboardCard } from "./dashboard/DashboardCard";
import { RecommendationsSection } from "./dashboard/RecommendationsSection";
import { useDashboard } from "@/_hooks/useDashboard";

export default function Dashboard() {
  const router = useRouter();
  const { recentSubmissions, userStats, isLoading, user } = useDashboard();

  const handleCategoryExplore = (category: string) => {
    // Navigate to problems with specific tag/category filter
    router.push(`/problems?tag=${encodeURIComponent(category.toLowerCase())}`);
  };

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto pt-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-violet-600 dark:text-violet-400">{user?.username}</span>
          </h1>
          <p className="text-muted-foreground mb-8">Continue your coding journey</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <DashboardCard
              icon={<Code className="text-violet-600" />}
              title="Continue Solving"
              description="Pick up where you left off with suggested problems."
              tags={["Arrays", "Strings", "DP"]}
              actionText="Browse Problems"
              onAction={() => router.push("/problems")}
            />
            <DashboardCard
              icon={<Clock className="text-violet-600" />}
              title="Recent Submissions"
              description={recentSubmissions.length > 0 ? `Your latest attempts:` : "No recent submissions."}
              list={recentSubmissions}
              onAction={() => router.push("/submissions")}
              isLoading={isLoading}
            />
            <DashboardCard
              icon={<Trophy className="text-violet-600" />}
              title="Your Stats"
              description=""
              stats={userStats}
              onAction={() => router.push("/me")}
              isLoading={isLoading}
            />
          </div>
        
          <RecommendationsSection onCategoryClick={handleCategoryExplore} />
        </div>
      </div>
    </div>
  );
}
