"use client";
import React from "react";
import { Card, CardContent, CardHeader } from "@/_components/ui/card";
import { Skeleton } from "@/_components/ui/skeleton";
import { ProblemCard } from "@/_components/problems/ProblemCard";
import { Problem } from "@/_services/problem.service";

interface ProblemsGridProps {
  problems: Problem[];
  solvedProblems: string[];
  isLoading: boolean;
  hasAccessToken: boolean;
}

export const ProblemsGrid: React.FC<ProblemsGridProps> = ({
  problems,
  solvedProblems,
  isLoading,
  hasAccessToken,
}) => {
  if (isLoading) {
    return (
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
    );
  }

  if (problems.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <p className="text-muted-foreground text-lg">No problems found</p>
          <p className="text-sm text-muted-foreground mt-2">
            Try adjusting your filters or check back later
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {problems.map((problem) => (
        <ProblemCard
          key={problem.id}
          problem={problem}
          isSolved={hasAccessToken ? solvedProblems.includes(problem.id) : false}
        />
      ))}
    </div>
  );
};
