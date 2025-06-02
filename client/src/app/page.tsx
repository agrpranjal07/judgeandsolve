"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/_components/ui/card";
import { ArrowRight, Code, BarChart, Trophy, Clock } from "lucide-react";
import { Badge } from "@/_components/ui/badge";
import useAuthStore from "@/_store/auth";
import { useToast } from "@/_hooks/use-toast";
import api from "@/_services/api";

// // Mock data (you'll replace this with real API data later)
// const recentSubmissions = [
//   { id: 1, problem: "Two Sum", verdict: "ACCEPTED", language: "Python", time: "2 hours ago" },
//   { id: 2, problem: "Binary Tree Traversal", verdict: "WRONG_ANSWER", language: "JavaScript", time: "1 day ago" },
//   { id: 3, problem: "Merge Sort", verdict: "TIME_LIMIT_EXCEEDED", language: "C++", time: "3 days ago" },
// ];

const getVerdictColor = (verdict: string) => {
  switch (verdict) {
    case "ACCEPTED": return "bg-green-500";
    case "WRONG_ANSWER": return "bg-red-500";
    case "TIME_LIMIT_EXCEEDED": return "bg-amber-500";
    default: return "bg-gray-500";
  }
};

export default function HomePage() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const {user, setUser} = useAuthStore();
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);
  const { toast } = useToast();
  useEffect(() => {
    if (!accessToken) return;
    const fetchUser= async () => {
          try {
            const res = await api.get("/auth/me", {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            setUser(res.data.data);
          } catch (err) {
            console.error("Failed to fetch user:", err);}
        };
        fetchUser();
      }, [accessToken, setUser]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!accessToken || !user?.username) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // Fetch recent submissions
        const submissionRes = await api.get("/recentSubmissions?limit=3&offset=0", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (submissionRes.data.data) {
          setRecentSubmissions(submissionRes.data.data);
        }

        // Fetch user stats
        const statsRes = await api.get(`/stats/user/${user.username}/`);
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
  }, [recentSubmissions,userStats,setUserStats,isLoading,setRecentSubmissions,accessToken, user, toast]);

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] bg-gradient-to-br from-background to-muted/30">
      {!accessToken ? (
        <>
          {/* Hero Section */}
          <section className="relative py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
                Welcome to JudgeAndSolve
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Solve coding problems, improve your skills, and compete with others in our programming challenges
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button onClick={() => router.push("/problems")}>
                  Start Solving <ArrowRight className="ml-2" />
                </Button>
                <Button variant="outline" onClick={() => router.push("/auth/signup")}>
                  Create Account
                </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[{
                title: "Browse Problems",
                icon: <Code className="text-violet-600 dark:text-violet-400" />,
                description: "Explore 500+ challenges from beginner to expert level.",
                action: () => router.push("/problems")
              },
              {
                title: "Leaderboard",
                icon: <Trophy className="text-violet-600 dark:text-violet-400" />,
                description: "Climb ranks and challenge 50K+ active users.",
                action: () => router.push("/stats/leaderboard")
              },
              {
                title: "Track Progress",
                icon: <BarChart className="text-violet-600 dark:text-violet-400" />,
                description: "Get personalized stats and insights.",
                action: () => router.push("/auth/login")
              }].map((card, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                      {card.icon}
                    </div>
                    <CardTitle className="text-2xl font-bold">{card.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{card.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="ghost" onClick={card.action}>
                      Learn More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </section>

          {/* Stats Section */}
          <section className="py-16 bg-muted/30 px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold mb-12">Join our growing community</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard count="500+" label="Coding Problems" />
                <StatCard count="1M+" label="Submissions" />
                <StatCard count="50K+" label="Active Users" />
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-20 text-center max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">Ready to enhance your coding skills?</h2>
            <p className="text-muted-foreground mb-6">Create an account and start solving now.</p>
            <Button onClick={() => router.push("/auth/signup")}>
              Join Now
            </Button>
          </section>
        </>
      ) : (
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
                description="Your latest attempts:"
                list={recentSubmissions}
                onAction={() => router.push("/submissions")}
              />
              <HomeCard
                icon={<Trophy className="text-violet-600" />}
                title="Your Stats"
                description=""
                stats={userStats}
                onAction={() => router.push("/me")}
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
      )}
    </div>
  );
}

function StatCard({ count, label }: { count: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-4xl font-bold text-violet-600 dark:text-violet-400">{count}</span>
      <span className="text-muted-foreground mt-2">{label}</span>
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
  onAction
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  tags?: string[];
  stats?: { totalAccepted: number; accuracyRate: string; totalAttempted: number };
  list?: any[];
  actionText?: string;
  onAction: () => void;
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
        {stats && (
          <>
            <div className="flex justify-between"><span>Problems Attempted</span><strong>{stats.totalAttempted}</strong></div>
            <div className="flex justify-between"><span>Acceptance Rate</span><strong>{stats.accuracyRate}%</strong></div>
            <div className="flex justify-between"><span>Accepted Submissions</span><strong>{stats.totalAccepted}</strong></div>
          </>
        ) }
        {list && (
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
      </CardContent>
      <CardFooter>
        <Button onClick={onAction} className="w-full">{actionText}</Button>
      </CardFooter>
    </Card>
  );
}
