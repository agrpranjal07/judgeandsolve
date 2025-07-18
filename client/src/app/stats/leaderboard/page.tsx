"use client";
import { useState, useEffect } from 'react';
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import { Skeleton } from "@/_components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/_components/ui/table";
import { Trophy, Medal, Award } from "lucide-react";
import api from '@/_services/api';
import useAuthStore from '@/_store/auth';
import { useProtectedRoute } from '@/_hooks/useProtectedRoute';
import AuthLoader from '@/_components/AuthLoader';

interface LeaderboardUser {
  id: string;
  username: string;
  weightedScore: number;
  solvedCount: number;
  submissionsCount: number;
  avgRuntime: number;
}

function LeaderboardPage() {
  const { isAllowed, isLoading: authLoading } = useProtectedRoute();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    // Only fetch data if user is authenticated and allowed to access this route
    if (!isAllowed) {
      return;
    }

    // make API call
    const fetchLeaderboard = async () => {
      try {
        const res=await api.get("/stats/leaderboard")
        const data = res.data.data;
        // console.log("Fetched leaderboard data:", data);
        setLeaderboardData(data);
      } catch (error) {
        console.error("Failed to fetch leaderboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [isAllowed]);

  // Show loading while authentication is being verified
  if (authLoading || !isAllowed) {
    return <AuthLoader />;
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return "";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
        
        <div className="container mx-auto py-8 px-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
     
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Trophy className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              Leaderboard
            </CardTitle>
            <p className="text-muted-foreground">Top performers on JudgeAndSolve</p>
          </CardHeader>
          <CardContent>
            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-4">
              {leaderboardData.map((user, index) => {
                const rank = index + 1;
                const isCurrentUser = user.username === currentUser?.username;
                
                return (
                  <Card 
                    key={user.id} 
                    className={`${isCurrentUser ? 'ring-2 ring-violet-500 bg-violet-50 dark:bg-violet-900/20' : ''}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getRankIcon(rank)}
                          <div>
                            <p className="font-semibold">{getRankEmoji(rank)} {user.username}</p>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                        </div>
                        <Badge className="bg-violet-600 hover:bg-violet-700">
                          {user.weightedScore.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Solved</p>
                          <p className="font-medium">{user.solvedCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Submissions</p>
                          <p className="font-medium">{user.submissionsCount}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg Runtime</p>
                          <p className="font-medium font-mono">{user.avgRuntime}ms</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden md:block">
              <Table>
                <TableHeader className="sticky top-0 bg-background/95 backdrop-blur">
                  <TableRow>
                    <TableHead className="w-16">Rank</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Solved</TableHead>
                    <TableHead className="text-right">Submissions</TableHead>
                    <TableHead className="text-right">Avg Runtime</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.map((user, index) => {
                    const rank = index + 1;
                    const isCurrentUser = user.username === currentUser?.username;
                    
                    return (
                      <TableRow 
                        key={user.id}
                        className={`${isCurrentUser ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800' : ''} hover:bg-muted/50`}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {getRankIcon(rank)}
                            {getRankEmoji(rank)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{user.username}</span>
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge className="bg-violet-600 hover:bg-violet-700">
                            {user.weightedScore.toLocaleString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                          {user.solvedCount}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {user.submissionsCount.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {user.avgRuntime}ms
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Stats Summary */}
            <div className="mt-8 pt-6 border-t border-border/40">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">
                    {leaderboardData.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Competitors</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {leaderboardData.reduce((sum, user) => sum + user.solvedCount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Problems Solved</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {leaderboardData.reduce((sum, user) => sum + user.submissionsCount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Submissions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LeaderboardPage;