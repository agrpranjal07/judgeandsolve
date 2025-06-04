"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import { Textarea } from "@/_components/ui/textarea";
import { CodeEditor  } from "@/_components/problems/CodeEditor";
import { toast } from "@/_hooks/use-toast";
import useAuthStore from "@/_store/auth";
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
} from "lucide-react";
import api from "@/_services/api";

type Submission = {
  id: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  reviewNote: string | null;
  status: string;
  verdict: string;
  createdAt: string;
};

type TestcaseResult = {
  testcaseId?: string;
  passed: boolean;
  runtime: number;
  memory: number;
};

type Problem = {
  id: string;
  title: string;
};

export default function SubmissionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { accessToken } = useAuthStore();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [testcaseResults, setTestcaseResults] = useState<TestcaseResult[]>([]);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProblemLoading, setIsProblemLoading] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [editingReview, setEditingReview] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);

  useEffect(() => {
    const fetchSubmission = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/submissions/${params.id}`, {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        if (!res.data?.data) throw new Error("Not found");
        const data = res.data.data;
        const sub = data.dataValues as Submission;
        setSubmission(sub);
        setReviewNote(sub.reviewNote || "");
        setTestcaseResults(data.testcaseResults || []);
        if (sub.problemId) fetchProblem(sub.problemId);
      } catch {
        setSubmission(null);
      } finally {
        setIsLoading(false);
      }
    };
    const fetchProblem = async (problemId: string) => {
      setIsProblemLoading(true);
      try {
        const res = await api.get(`/problems/${problemId}`);
        if (!res) throw new Error("Not found");
        const data = res.data;
        setProblem({id:problemId,title:data.data.title});
      } catch {
        setProblem(null);
      } finally {
        setIsProblemLoading(false);
      }
    };
    if (params.id) fetchSubmission();
    // eslint-disable-next-line
  }, [params.id]);

  // Verdict badge/icon helpers
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

  // Testcase stats
  const passed = testcaseResults.filter((t) => t.passed).length;
  const avgRuntime = testcaseResults.length
    ? Math.round(testcaseResults.reduce((a, b) => a + (b.runtime || 0), 0) / testcaseResults.length)
    : 0;
  const avgMemory = testcaseResults.length
    ? (testcaseResults.reduce((a, b) => a + (b.memory || 0), 0) / testcaseResults.length).toFixed(1)
    : "0.0";

  // Copy code
  const handleCopyCode = async () => {
    if (!submission?.code) return;
    try {
      await navigator.clipboard.writeText(submission.code);
      toast({ title: "Copied!", description: "Code copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Could not copy code.", variant: "destructive" });
    }
  };

  // Save review note
  const handleSaveReview = async () => {
    if (!submission || !accessToken) return;
    setIsSavingReview(true);
    try {
      const res = await api.post(
        `/submissions/review/${submission.id}`,{
          reviewNote,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (!res.data?.data) throw new Error("Failed to save review");
      setSubmission((s) => (s ? { ...s, reviewNote } : s));
      setEditingReview(false);
      toast({ title: "Review saved" });
    } catch {
      toast({ title: "Failed to save review", variant: "destructive" });
    } finally {
      setIsSavingReview(false);
    }
  };

  // Loading state
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
  // Not found
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
        {/* Header */}
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
                  {isProblemLoading ? "Loading..." : problem.title}
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
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Code */}
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

            {/* Review Note */}
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
                          variant="ghost"
                          type="button"
                          onClick={() => setEditingReview(false)}
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submission Info */}
            <Card>
              <CardHeader>
                <CardTitle>Submission Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Submitted</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(submission.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Avg Runtime</p>
                    <p className="text-sm text-muted-foreground">{avgRuntime}ms</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Avg Memory</p>
                    <p className="text-sm text-muted-foreground">{avgMemory}MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Test Cases</span>
                    <span className="text-sm">
                      {passed}/{testcaseResults.length}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        passed === testcaseResults.length
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width:
                          testcaseResults.length > 0
                            ? `${(passed / testcaseResults.length) * 100}%`
                            : "0%",
                      }}
                    />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {passed === testcaseResults.length
                      ? "All test cases passed!"
                      : `${testcaseResults.length - passed} test case(s) failed`}
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {testcaseResults.map((result, idx) => (
                      <div
                        key={result.testcaseId || idx}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs"
                      >
                        <div className="flex items-center gap-2">
                          {result.passed ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <XCircle className="h-3 w-3 text-red-500" />
                          )}
                          <span>Test {idx + 1}</span>
                        </div>
                        <div className="text-muted-foreground">
                          {result.runtime}ms | {result.memory?.toFixed(1) ?? "—"}MB
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}