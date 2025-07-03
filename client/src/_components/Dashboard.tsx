"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/_components/ui/card";
import { Code, Trophy, Clock } from "lucide-react";
import { Badge } from "@/_components/ui/badge";
import useAuthStore from "@/_store/auth";
import { useToast } from "@/_hooks/use-toast";
import api from "@/_services/api";

const getVerdictColor = (verdict: string) => {
  switch (verdict) {
    case "ACCEPTED": return "bg-green-500";
    case "WRONG_ANSWER": return "bg-red-500";
    case "TIME_LIMIT_EXCEEDED": return "bg-amber-500";
    default: return "bg-gray-500";
  }
};

export default function Dashboard() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { user } = useAuthStore();
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);
  const { toast } = useToast();

  // Fetch dashboard data when component mounts or user changes
  useEffect(() => {
    if (!accessToken || !user?.username) {
      setIsLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const [submissionRes, statsRes] = await Promise.all([
          api.get("/recentSubmissions?limit=3&offset=0", {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          api.get(`/stats/user/${user.username}/`)
        ]);

        if (submissionRes.data.data) {
          setRecentSubmissions(submissionRes.data.data);
        }
        if (statsRes.data.data) {
          setUserStats(statsRes.data.data);
        }
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

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto pt-8 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="text-violet-600 dark:text-violet-400">{user?.username}</span>
          </h1>
          <p className="text-muted-foreground mb-8">Continue your coding journey</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
            <HomeCard
              icon={<Code className="text-violet-600" />}
              title="Continue Solving"
              description="Pick up where you left off with suggested problems."
              tags={["Arrays", "Strings", "DP"]}
              actionText="Browse Problems"
              onAction={() => router.push("/problems")}
            />
            <HomeCard
              icon={<Clock className="text-violet-600" />}
              title="Recent Submissions"
              description={recentSubmissions.length > 0 ? `Your latest attempts:` : "No recent submissions."}
              list={recentSubmissions}
              onAction={() => router.push("/submissions")}
              isLoading={isLoading}
            />
            <HomeCard
              icon={<Trophy className="text-violet-600" />}
              title="Your Stats"
              description=""
              stats={userStats}
              onAction={() => router.push("/me")}
              isLoading={isLoading}
            />
          </div>
        
          {/* Recommendations Section */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Recommended for you</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {["Graph Algorithms", "Dynamic Programming", "Binary Search"].map((category, index) => (
                <Card key={index} className="bg-card hover:shadow-md transition-all duration-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {`Improve your ${category.toLowerCase()} skills with our curated problems.`}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" className="w-full">
                      Explore
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function HomeCard({
  icon,
  title,
  description,
  tags,
  stats,
  list,
  actionText = "Explore",
  onAction,
  isLoading = false
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  tags?: string[];
  stats?: { totalAccepted: number; accuracyRate: string; totalAttempted: number };
  list?: any[];
  actionText?: string;
  onAction: () => void;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {description && <p className="text-muted-foreground mb-4">{description}</p>}
        {tags && (
          <div className="flex gap-2 flex-wrap mb-4">
            {tags.map((tag, i) => (
              <Badge key={i} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}
        {stats && !isLoading && (
          <>
            <div className="flex justify-between"><span>Problems Attempted</span><strong>{stats.totalAttempted}</strong></div>
            <div className="flex justify-between"><span>Acceptance Rate</span><strong>{stats.accuracyRate}%</strong></div>
            <div className="flex justify-between"><span>Accepted Submissions</span><strong>{stats.totalAccepted}</strong></div>
          </>
        )}
        {stats && isLoading && (
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded"></div>
            <div className="h-4 bg-muted animate-pulse rounded"></div>
            <div className="h-4 bg-muted animate-pulse rounded"></div>
          </div>
        )}
        {list && !isLoading && (
          <ul className="space-y-3">
            {list.map((s, i) => (
              <li key={i} className="flex items-center justify-between border-b border-border/30 pb-2">
                <div>
                  <p className="font-medium">{s.problemTitle}</p>
                  <div className="text-xs text-muted-foreground font-mono">{s.language} • {s.time}</div>
                </div>
                <Badge className={getVerdictColor(s.verdict)}>{s.verdict}</Badge>
              </li>
            ))}
          </ul>
        )}
        {list && isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center border-b border-border/30 pb-2">
                <div className="space-y-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-32"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-20"></div>
                </div>
                <div className="h-6 bg-muted animate-pulse rounded w-16"></div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onAction} className="w-full">{actionText}</Button>
      </CardFooter>
    </Card>
  );
}
