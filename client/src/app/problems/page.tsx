"use client";

import React, { Suspense } from "react";
import { DifficultyFilter } from "@/_components/problems/DifficultyFilter";
import { ProblemsGrid } from "@/_components/problems/ProblemsGrid";
import { Pagination } from "@/_components/problems/Pagination";
import { useProblems } from "@/_hooks/useProblems";

function ProblemsPageContent() {
  // Remove auth guard - problems page should be accessible to everyone
  const {
    problems,
    solvedProblems,
    isLoading,
    currentPage,
    totalPages,
    selectedDifficulty,
    accessToken,
    handleDifficultyChange,
    handlePageChange,
  } = useProblems();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Coding Problems</h1>
          <p className="text-muted-foreground">
            Practice your coding skills with our collection of problems
          </p>
        </div>

        <DifficultyFilter
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={handleDifficultyChange}
        />

        <ProblemsGrid
          problems={problems}
          solvedProblems={solvedProblems}
          isLoading={isLoading}
          hasAccessToken={!!accessToken}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          showPagination={!isLoading && problems.length > 0}
        />
      </div>
    </div>
  );
}

export default function ProblemsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProblemsPageContent />
    </Suspense>
  );
}
