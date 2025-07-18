"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/_components/ui/card";
import { ArrowRight, Code, BarChart, Trophy } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const handleLeaderboardClick = () => {
    // Store the leaderboard path for redirect after login
    sessionStorage.setItem('redirectAfterLogin', '/stats/leaderboard');
    router.push('/auth/login');
  };

  const handleTrackProgressClick = () => {
    // Store the profile path for redirect after login
    sessionStorage.setItem('redirectAfterLogin', '/me');
    router.push('/auth/login');
  };

  return (
    <div className="min-h-[calc(100vh-var(--header-height))] bg-gradient-to-br from-background to-muted/30">
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
            action: handleLeaderboardClick
          },
          {
            title: "Track Progress",
            icon: <BarChart className="text-violet-600 dark:text-violet-400" />,
            description: "Get personalized stats and insights.",
            action: handleTrackProgressClick
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
