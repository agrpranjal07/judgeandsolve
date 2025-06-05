"use client";
import React, { useEffect, useState } from "react";
import { useToast } from "@/_hooks/use-toast";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/_components/ui/card";
import { Button } from "@/_components/ui/button";
import { Textarea } from "@/_components/ui/textarea";
import { CodeEditor } from "@/_components/problems/CodeEditor";
import useAuthStore from "@/_store/auth";
import api from "@/_services/api";
import { Badge } from "@/_components/ui/badge";
import { SubmissionsTable } from "@/_components/profile/SubmissionTable";
import ReactMarkdown from "react-markdown";

type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  sampleInput: string;
  sampleOutput: string;
  tags: string[];
};

type TestCase = {
  id: string;
  problemId: string;
  input: string;
  output: string;
};

type TestResult = {
  testcaseId: string;
  passed: boolean;
  output: string;
};

type SubmissionResult = {
  status: string;
  verdict: string;
  results: {
    testcaseId: string;
    passed: boolean;
    runtime: number;
  }[];
};

type PastSubmission = {
    id: string;
    problemTitle: string;
    problemId: string;
    language: string;
    verdict: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | "RUNTIME_ERROR" | "COMPILATION_ERROR";
    createdAt: string;
    runtime: number;
    memory: number;
  }

export default function ProblemSolvePage() {
  const { id: problemId } = useParams();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState("");
  const [sampleTestcases, setSampleTestcases] = useState<TestCase[]>([]);
  const [customTestcases, setCustomTestcases] = useState<TestCase[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submissionResults, setSubmissionResults] = useState<SubmissionResult | null>(null);
  const [aiReviewAvailable, setAiReviewAvailable] = useState(false);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [codeRating, setCodeRating] = useState<number | null>(null);
  const [pastSubmissions, setPastSubmissions] = useState<PastSubmission[]>([]);
  const [showPastSubmissions, setShowPastSubmissions] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { toast } = useToast();

  useEffect(() => {
    if (!problemId) return;
    const fetchData = async () => {
      try {
        const [problemRes, testcaseRes, tagsRes] = await Promise.all([
          api.get(`/problems/${problemId}`),
          api.get(`/problems/${problemId}/testcases/public`),
          api.get(`/problems/${problemId}/tags`),
        ]);
        // Set problem first
        setProblem({
          ...problemRes.data.data,
          tags: tagsRes.data.data.map((tag: { id: string; name: string }) => tag.name),
        });
        if (testcaseRes.data.data.length !== 0) {
          const sampleTcs = testcaseRes.data.data
            .filter((tc: any) => tc.isSample)
            .map((tc: any) => ({
              id: tc.id,
              problemId: tc.problemId,
              input: tc.input,
              output: tc.output,
            }));
          setSampleTestcases(sampleTcs);
        }
        setCustomTestcases([]);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load problem data",
          variant: "destructive",
        });
      }
    };
    fetchData();
  }, [problemId, toast]);
  useEffect(() => {
    const fetchLastSubmission = async () => {
      try {
        if (!problemId || !accessToken) return;
        const res = await api.get(`/problems/${problemId}/submissions`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.data.data) {
          setPastSubmissions(res.data.data);
          }
        }
       catch (err) {
        toast({
          title: "Error",
          description: "Failed to load last submission",
          variant: "destructive",
        });
      }
    };

    fetchLastSubmission();
  }, [problemId, accessToken, toast]);

  const handleAddCustomTestcase = () => {
    if (!problemId) return;
    setCustomTestcases((prev) => [
      ...prev,
      { id: `${Date.now()}_${prev.length + 1}`, problemId: problemId as string, input: "", output: "" },
    ]);
  };

  const handleTest = async () => {
    const allTestcases = [...sampleTestcases, ...customTestcases];
    const testcases = allTestcases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.output,
    }));
    try {
      const res = await api.post("/submissions/testcases", { problemId, language, code, testcases },{
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.data.data.length !== 0) {
        const results = res.data.data.map((tc: any) => ({
          testcaseId: tc.testcaseId,
          passed: tc.passed,
          output: tc.output,
        }));
        setTestResults(results);
      }
    } catch (err) {
      toast({ title: "Error", description: "Test run failed", variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!accessToken) {
      return toast({
        title: "User Not Found",
        description: "Login/Signup Required",
        variant: "destructive",
      });
    }
    try {
      const res = await api.post("/submissions", { problemId, language, code });
      setSubmissionId(res.data.data.id);
      setSubmissionResults(null);
      setAiReviewAvailable(false);
      setAiReview(null);
    } catch (err) {
      toast({ title: "Error", description: "Submission failed", variant: "destructive" });
    }
  };

  useEffect(() => {
    if (!submissionId) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/submissions/${submissionId}`);
        const submission = res.data.data;

        setSubmissionResults({
          status: submission.dataValues.status,
          verdict: submission.dataValues.verdict,
          results: submission.testcaseResults,
        });

        const passedCount = submission.testcaseResults.filter((t: any) => t.passed).length;
        const failed = submission.testcaseResults.length - passedCount;

        if (submission.dataValues.verdict === "Accepted" || failed >= 2) {
          setAiReviewAvailable(true);
        }

        if (submission.dataValues.status === "Completed") clearInterval(interval);
      } catch (err) {
        clearInterval(interval);
        console.error("Error polling submission status", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [submissionId]);

  const handleAIReview = async () => {
    try {
      if(code.trim() === "") {
        return toast({
        title: "Error",
        description: "Code is empty",
        variant: "destructive",
      });
    }
      const aiReviewResponse = await api.post("/ai/review", {
        problemId,code, language},{
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      if(aiReviewResponse.data.data) {
        setAiReview(aiReviewResponse.data.data.reviewText);
        setCodeRating(aiReviewResponse.data.data.rating);
      }
    } catch {
      toast({ title: "Failed to fetch AI Review", description: "Please try again after some time", variant: "destructive" });
    }
  };

  if (!problem) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-0">
      {/* Problem Panel */}
      <Card>
        <CardContent className="space-y-6 pt-6 pb-2 px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            <Badge
              className={`${
                problem.difficulty === "Easy"
                  ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100"
                  : problem.difficulty === "Medium"
                  ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                  : "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100"
              }`}
            >
              {problem.difficulty}
            </Badge>
          </div>
            {/* Tags and Description */}
          <div className="flex flex-wrap gap-2">
            {problem.tags?.map((tag) => (
              <Badge key={tag} className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                {tag}
              </Badge>
            ))}
          <pre className="whitespace-pre-wrap text-sm">{problem.description}</pre>

          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-1">Sample Input</h3>
              <Textarea
                value={problem.sampleInput}
                readOnly
                className="w-full resize-none min-h-[6rem] border border-gray-300 dark:border-gray-600"
              />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Sample Output</h3>
              <Textarea
                value={problem.sampleOutput}
                readOnly
                className="w-full resize-none min-h-[6rem] border border-gray-300 dark:border-gray-600"
              />
            </div>
          </div>
        </CardContent>

        {/* Verdict & Results */}
        <CardContent className="pt-0 px-4 pb-6 space-y-4">
          {aiReview ? (
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-800">
              <h3 className="font-bold text-blue-700 dark:text-blue-300 mb-2">AI Review</h3>
              <p className="mb-2">Rating: <Badge variant={codeRating && codeRating >= 4 ? "default" : "destructive"}>{codeRating || "N/A"}</Badge></p>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{aiReview}</ReactMarkdown>
              </div>
            </div>
          ) : submissionResults ? (
            <div className={`space-y-3 ${submissionResults.verdict === "Accepted" ?`bg-green-50 dark:bg-green-950 p-4 rounded-md border border-green-200 dark:border-green-800`: `bg-red-50 dark:bg-red-950 p-4 rounded-md border border-red-200 dark:border-red-800`} `}>
              <h3 className={`font-semibold text-lg ${submissionResults.verdict === "Accepted" ?`text-green-700 dark:text-green-300`: `text-red-700 dark:text-red-300`} `}>Submission Results</h3>
              <p>Status: <Badge>{submissionResults.status}</Badge></p>
              <p>Verdict: <Badge variant={submissionResults.verdict === "Accepted" ? "default" : "destructive"}>{submissionResults.verdict}</Badge></p>
              <p>Passed Testcases: {submissionResults.results.filter((r: any) => r.passed).length}/{submissionResults.results.length}</p>
              <p>Runtime: {submissionResults.results.reduce((acc: number, r: any) => acc + r.runtime, 0).toFixed(2)}s</p>
              <p>Memory Usage: {submissionResults.results.reduce((acc: number, r: any) => acc + (r.memory || 0), 0)} MB</p>
            </div>
          ) : testResults.length > 0 ? (
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
          ) : null}
        </CardContent>
      </Card>

      {/* Editor Panel */}
      <Card>
        <CardContent className="space-y-6 pt-6 pb-6 px-4">
          <CodeEditor language={language} code={code} setCode={setCode} setLanguage={setLanguage} onReset={() => setCode("")} />
          {/*Buttons */}
          <div className="flex gap-3">
            <Button onClick={handleTest}>Test</Button>
            <Button onClick={handleSubmit}>Submit</Button>
            {aiReviewAvailable && <Button onClick={handleAIReview}>AI Review</Button>}
            { pastSubmissions.length > 0 && <Button onClick={() => setShowPastSubmissions(!showPastSubmissions)}>{showPastSubmissions ? "Show Test Cases" : "Show Past Submissions"}</Button>}
          </div>
          {showPastSubmissions ? <SubmissionsTable submissions={pastSubmissions} isLoading={false} /> :<div>
          <div className="space-y-4">
            <h3 className="font-semibold">Sample Testcases</h3>
            {sampleTestcases.map((t, i) => (
              <div key={i} className="space-y-2">
                <p className="font-semibold">Testcase {i + 1}:</p>
                <Textarea value={t.input} readOnly className="w-full resize-none min-h-[4rem]" />
                <Textarea value={t.output} readOnly className="w-full resize-none min-h-[4rem]" />
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Custom Testcases</h3>
            {customTestcases.map((tc, idx) => (
              <div key={idx} className="space-y-2">
                <p className="font-semibold">Testcase {sampleTestcases.length+idx + 1}:</p>
                <Textarea
                  placeholder="Input"
                  value={tc.input}
                  onChange={(e) => {
                    const updated = [...customTestcases];
                    updated[idx].input = e.target.value;
                    setCustomTestcases(updated);
                  }}
                />
                <Textarea
                  placeholder="Expected Output"
                  value={tc.output}
                  onChange={(e) => {
                    const updated = [...customTestcases];
                    updated[idx].output = e.target.value;
                    setCustomTestcases(updated);
                  }}
                />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={handleAddCustomTestcase}>
              + Add Custom Testcase
            </Button>
          </div>
          </div>}
        </CardContent>
      </Card>
    </div>
  );
}
