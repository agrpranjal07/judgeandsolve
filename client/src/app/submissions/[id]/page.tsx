"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import { Textarea } from "@/_components/ui/textarea";
import { CodeEditor } from "@/_components/problems/CodeEditor";
import { Skeleton } from "@/_components/ui/skeleton";
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Code2,
  Play,
  Clipboard,
  ExternalLink,
  Pencil,
  Zap,
} from "lucide-react";
import { useSubmissionDetail } from "@/_hooks/useSubmissionDetail";

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const submissionId = params.id as string;
  
  const {
    submission,
    testcaseResults,
    problem,
    isLoading,
    reviewNote,
    setReviewNote,
    editingReview,
    setEditingReview,
    isSavingReview,
    testCaseStats,
    handleCopyCode,
    handleSaveReview,
  } = useSubmissionDetail(submissionId);

  // Verdict badge/icon helpers (original functions)
  const getVerdictIcon = (verdict: string) => {
    if (verdict?.toLowerCase().includes("accept")) return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (verdict?.toLowerCase().includes("pending")) return <Clock className="h-5 w-5 text-yellow-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict?.toLowerCase().includes("accept")) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300";
    if (verdict?.toLowerCase().includes("pending")) return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300";
    return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300";
  };

  // Loading state (original design)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Not found (original design)
  if (!submission) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Submission Not Found</h1>
          <p className="text-muted-foreground">The requested submission could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 space-y-6">
        {/* Header (original design) */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold">Submission Details</h1>
            <div className="flex items-center gap-4 mt-2 text-muted-foreground">
              {problem && (
                <a
                  href={`/problems/${problem.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  {problem.title}
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
          <Badge className={`${getVerdictColor(submission.verdict)} border`}>
            <div className="flex items-center gap-2">
              {getVerdictIcon(submission.verdict)}
              {submission.verdict}
            </div>
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (original layout) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Code (original design) */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code2 className="h-5 w-5" />
                    Code ({submission.language})
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    className="flex items-center gap-2"
                  >
                    <Clipboard className="h-4 w-4" />
                    Copy Code
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <CodeEditor
                    code={submission.code}
                    language={submission.language}
                    isReadOnly={true}
                    setCode={() => {}}
                    onReset={() => {}}
                    setLanguage={() => {}}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Review Note (original design) */}
            <Card>
              <CardHeader>
                <CardTitle>Review Note</CardTitle>
              </CardHeader>
              <CardContent>
                {submission.reviewNote && !editingReview ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-md">
                      <p className="whitespace-pre-wrap">{submission.reviewNote}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingReview(true);
                        setReviewNote(submission.reviewNote || "");
                      }}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add your review note here..."
                      value={reviewNote}
                      onChange={(e) => setReviewNote(e.target.value)}
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveReview}
                        disabled={!reviewNote.trim() || isSavingReview}
                      >
                        {isSavingReview ? "Saving..." : "Save Review"}
                      </Button>
                      {submission.reviewNote && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditingReview(false);
                            setReviewNote(submission.reviewNote || "");
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar (original layout) */}
          <div className="space-y-6">
            {/* Submission Info (original design) */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Submitted</span>
                  <span>{new Date(submission.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Language</span>
                  <span className="capitalize">{submission.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span>{submission.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verdict</span>
                  <Badge className={getVerdictColor(submission.verdict)}>
                    {submission.verdict}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Test Results (original design) */}
            {testcaseResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Test Results</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Passed</span>
                    <span className="font-medium text-green-600">
                      {testCaseStats.passed}/{testCaseStats.total}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Runtime</span>
                    <span>{testCaseStats.avgRuntime}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg Memory</span>
                    <span>{testCaseStats.avgMemory}MB</span>
                  </div>
                  
                  <div className="pt-4 border-t space-y-2">
                    {testcaseResults.map((result, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 border rounded"
                      >
                        <div className="flex items-center gap-2">
                          {result.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm">Test {index + 1}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {result.runtime || 0}ms
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {result.memory || 0}MB
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions (original design) */}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={() => router.push(`/problems/${problem?.id}`)}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Problem
                </Button>
                <Button
                  onClick={() => {
                    // Store the submission code in localStorage to pre-fill the problem page
                    if (submission) {
                      localStorage.setItem('prefillCode', JSON.stringify({
                        code: submission.code,
                        language: submission.language,
                        fromSubmission: submission.id
                      }));
                    }
                    router.push(`/problems/${problem?.id}`);
                  }}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Play className="h-4 w-4" />
                  Test on Problem
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
