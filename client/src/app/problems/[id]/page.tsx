"use client";
import React from "react";
import { useParams } from "next/navigation";
import { ProblemDescription } from "@/_components/problems/ProblemDescription";
import { CodeSubmissionPanel } from "@/_components/problems/CodeSubmissionPanel";
import { TestCasePanel } from "@/_components/problems/TestCasePanel";
import { SubmissionResultsPanel } from "@/_components/problems/SubmissionResultsPanel";
import { useProblemSolving } from "@/_hooks/useProblemSolving";

export default function ProblemSolvePage() {
  const { id: problemId } = useParams();
  const {
    // State
    problem,
    language,
    code,
    sampleTestcases,
    customTestcases,
    testResults,
    submissionResults,
    aiReviewAvailable,
    aiReview,
    codeRating,
    pastSubmissions,
    showPastSubmissions,
    isLoading,
    
    // Actions
    setLanguage,
    setCode,
    setCustomTestcases,
    setShowPastSubmissions,
    handleAddCustomTestcase,
    handleTest,
    handleSubmit,
    handleAIReview,
    handleReset,
  } = useProblemSolving(problemId as string);

  if (isLoading.problem || !problem) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-0">
      {/* Problem Panel */}
      <div className="space-y-4">
        <ProblemDescription problem={problem} />
        <SubmissionResultsPanel
          aiReview={aiReview}
          codeRating={codeRating}
          submissionResults={submissionResults}
          testResults={testResults}
        />
      </div>

      {/* Editor Panel */}
      <div className="space-y-4">
        <CodeSubmissionPanel
          language={language}
          code={code}
          setCode={setCode}
          setLanguage={setLanguage}
          onTest={handleTest}
          onSubmit={handleSubmit}
          onAIReview={handleAIReview}
          onReset={handleReset}
          aiReviewAvailable={aiReviewAvailable}
          isLoading={isLoading}
        />
        
        <TestCasePanel
          sampleTestcases={sampleTestcases}
          customTestcases={customTestcases}
          setCustomTestcases={setCustomTestcases}
          pastSubmissions={pastSubmissions}
          showPastSubmissions={showPastSubmissions}
          setShowPastSubmissions={setShowPastSubmissions}
          problemId={problemId as string}
          onAddCustomTestcase={handleAddCustomTestcase}
        />
      </div>
    </div>
  );
}
