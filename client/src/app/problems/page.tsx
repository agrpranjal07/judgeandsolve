"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/_components/ui/card";
import { Skeleton } from "@/_components/ui/skeleton";
import { Button } from "@/_components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/_components/ui/tabs";
import { ProblemCard } from "@/_components/problems/ProblemCard";
import { DifficultyBadge } from "@/_components/problems/DifficultyBadge";
import useAuthStore from "@/_store/auth";
import { ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/_services/api";

type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
};
function Problems() {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const searchParams = useSearchParams();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  const limit = 10;

  useEffect(() => {
    const difficulty = searchParams.get("difficulty") || "All";
    const page = parseInt(searchParams.get("page") || "1");

    setSelectedDifficulty(difficulty);
    setCurrentPage(page);
    fetchProblems(difficulty, page);
  }, [searchParams]);

  useEffect(() => {
    if (accessToken) {
      fetchSolvedProblems();
    }
  }, [accessToken]);

  const fetchProblems = async (difficulty: string, page: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (difficulty !== "All") {
        params.set("difficulty", difficulty);
      }

      const response = await api.get(`/problems?${params}`);
      if (response) {
        const data = response.data.data;
        setProblems(data.problems || []);
        setTotalPages(Math.ceil(data.total / limit) || 1);
      }
    } catch (error) {
      console.error("Failed to fetch problems:", error);
      setProblems([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSolvedProblems = async () => {
    try {
      const response = await api.get("/users/solved-problems", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response) {
        const data = response.data.data;
        setSolvedProblems(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch solved problems:", error);
      setSolvedProblems([]);
    }
  };

  const handleDifficultyChange = (difficulty: string) => {
    const params = new URLSearchParams();
    params.set("difficulty", difficulty);
    params.set("page", "1");
    router.push(`/problems?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.push(`/problems?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Coding Problems</h1>
          <p className="text-muted-foreground">
            Practice your coding skills with our collection of problems
          </p>
        </div>

        {/* Difficulty Filter Tabs */}
        <Tabs
          value={selectedDifficulty}
          onValueChange={handleDifficultyChange}
          className="mb-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="All">All</TabsTrigger>
            <TabsTrigger value="Easy">Easy</TabsTrigger>
            <TabsTrigger value="Medium">Medium</TabsTrigger>
            <TabsTrigger value="Hard">Hard</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Problems Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : problems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {problems.map((problem) => (
              <ProblemCard
                key={problem.id}
                problem={problem}
                isSolved={
                  accessToken ? solvedProblems.includes(problem.id) : false
                }
              />
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground text-lg">No problems found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your filters or check back later
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {!isLoading && problems.length > 0 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pageNumber = Math.max(1, currentPage - 2) + i;
                if (pageNumber > totalPages) return null;

                return (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === currentPage ? "default" : "outline"}
                    onClick={() => handlePageChange(pageNumber)}
                    className="w-10"
                  >
                    {pageNumber}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Problems;
