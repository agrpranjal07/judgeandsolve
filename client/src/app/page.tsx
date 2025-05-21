
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Code, Trophy, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HomePage(){
  const router = useRouter();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      
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
            <Button 
              className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white px-8 py-6 h-auto text-lg font-medium shadow-lg transition-all duration-300 hover:scale-105"
              onClick={() => router.push('/problems')}
            >
              Start Solving <ArrowRight className="ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="border-violet-600 dark:border-violet-500 text-violet-600 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 px-8 py-6 h-auto text-lg font-medium transition-all duration-300"
              onClick={() => router.push('/auth/signup')}
            >
              Create Account
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Featured Problems Card */}
          <Card className="bg-card border border-border/40 shadow-md hover:shadow-lg transition-all duration-300 hover:border-violet-400/30 dark:hover:border-violet-700/30">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-4">
                <Code className="text-violet-600 dark:text-violet-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Featured Problems</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground">
                Start solving our carefully curated collection of coding problems ranging from beginner to advanced levels
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-violet-600 hover:bg-violet-700 dark:bg-violet-700/80 dark:hover:bg-violet-700 text-white"
                onClick={() => router.push('/problems')}
              >
                Browse Problems <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Leaderboard Card */}
          <Card className="bg-card border border-border/40 shadow-md hover:shadow-lg transition-all duration-300 hover:border-violet-400/30 dark:hover:border-violet-700/30">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <Trophy className="text-indigo-600 dark:text-indigo-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground">
                See how you rank against other developers and compete to reach the top of our global leaderboard
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700/80 dark:hover:bg-indigo-700 text-white"
                onClick={() => router.push('/leaderboard')}
              >
                View Leaderboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>

          {/* Your Progress Card */}
          <Card className="bg-card border border-border/40 shadow-md hover:shadow-lg transition-all duration-300 hover:border-violet-400/30 dark:hover:border-violet-700/30">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <User className="text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-muted-foreground">
                Track your solving progress, view past submissions, and improve your coding skills with personalized insights
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700/80 dark:hover:bg-blue-700 text-white"
                onClick={() => router.push('/me')}
              >
                View Profile <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">500+</div>
            <div className="text-sm text-muted-foreground">Coding Problems</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">50K+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">1M+</div>
            <div className="text-sm text-muted-foreground">Submissions</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">20+</div>
            <div className="text-sm text-muted-foreground">Programming Languages</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to take your coding skills to the next level?</h2>
        <p className="text-muted-foreground mb-8">
          Join JudgeAndSolve today and start your journey toward becoming a better programmer
        </p>
        <Button 
          className="bg-violet-600 hover:bg-violet-700 dark:bg-violet-700 dark:hover:bg-violet-600 text-white px-8 py-6 h-auto text-lg font-medium shadow-lg transition-all duration-300"
          onClick={() => router.push('/signup')}
        >
          Join Now
        </Button>
      </section>
    </div>
  );
};


