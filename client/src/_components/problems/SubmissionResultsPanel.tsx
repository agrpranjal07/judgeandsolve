"use client";
import React from "react";
import { CardContent } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import ReactMarkdown from "react-markdown";
import { SubmissionResult, TestResult } from "@/_services/problem.service";

interface SubmissionResultsPanelProps {
  aiReview?: string | null;
  codeRating?: number | null;
  submissionResults?: SubmissionResult | null;
  testResults?: TestResult[];
}

export const SubmissionResultsPanel: React.FC<SubmissionResultsPanelProps> = ({
  aiReview,
  codeRating,
  submissionResults,
  testResults = [],
}) => {
  if (aiReview) {
    return (
      <CardContent className="pt-0 px-4 pb-6 space-y-4">
        <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-2">AI Review</h3>
          <p className="mb-2">
            Rating: <Badge variant={codeRating && codeRating >= 4 ? "default" : "destructive"}>
              {codeRating || "N/A"}
            </Badge>
          </p>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{aiReview}</ReactMarkdown>
          </div>
        </div>
      </CardContent>
    );
  }

  if (submissionResults) {
    const isAccepted = submissionResults.verdict === "Accepted";
    const passedCount = submissionResults.results.filter((r: any) => r.passed).length;
    const totalRuntime = submissionResults.results.reduce((acc: number, r: any) => acc + r.runtime, 0);
    const totalMemory = submissionResults.results.reduce((acc: number, r: any) => acc + (r.memory || 0), 0);

    return (
      <CardContent className="pt-0 px-4 pb-6 space-y-4">
        <div className={`space-y-3 ${
          isAccepted 
            ? "bg-green-50 dark:bg-green-950 p-4 rounded-md border border-green-200 dark:border-green-800"
            : "bg-red-50 dark:bg-red-950 p-4 rounded-md border border-red-200 dark:border-red-800"
        }`}>
          <h3 className={`font-semibold text-lg ${
            isAccepted 
              ? "text-green-700 dark:text-green-300"
              : "text-red-700 dark:text-red-300"
          }`}>
            Submission Results
          </h3>
          <p>Status: <Badge>{submissionResults.status}</Badge></p>
          <p>
            Verdict: <Badge variant={isAccepted ? "default" : "destructive"}>
              {submissionResults.verdict}
            </Badge>
          </p>
          <p>Passed Testcases: {passedCount}/{submissionResults.results.length}</p>
          <p>Runtime: {totalRuntime.toFixed(2)}s</p>
          <p>Memory Usage: {totalMemory} MB</p>
        </div>
      </CardContent>
    );
  }

  if (testResults.length > 0) {
    return (
      <CardContent className="pt-0 px-4 pb-6 space-y-4">
        <div className="space-y-3 bg-yellow-50 dark:bg-yellow-950 p-4 rounded-md border border-yellow-200 dark:border-yellow-800">
          <h3 className="font-semibold text-lg text-yellow-700 dark:text-yellow-300">Test Results</h3>
          {testResults.map((r, idx) => (
            <div
              key={idx}
              className={`p-2 rounded border ${
                r.passed
                  ? "border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-700"
                  : "border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-700"
              }`}
            >
              <p><strong>Testcase:</strong> {r.testcaseId}</p>
              <p><strong>Output:</strong> <code>{r.output}</code></p>
              <p>
                <strong>Passed:</strong>{" "}
                <span className={r.passed ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}>
                  {r.passed.toString()}
                </span>
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    );
  }

  return null;
};
