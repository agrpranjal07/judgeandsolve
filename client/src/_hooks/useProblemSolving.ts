import { useState, useEffect } from "react";
import { useToast } from "@/_hooks/use-toast";
import { useErrorHandler } from "@/_hooks/useErrorHandler";
import useAuthStore from "@/_store/auth";
import { 
  problemService, 
  Problem, 
  TestCase, 
  TestResult, 
  SubmissionResult, 
  PastSubmission 
} from "@/_services/problem.service";
import { ProblemSolvingDomain } from "@/_domain/ProblemSolvingDomain";

export const useProblemSolving = (problemId: string) => {
  // State
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
  const [isLoading, setIsLoading] = useState({
    problem: false,
    test: false,
    submit: false,
    aiReview: false,
  });

  const accessToken = useAuthStore((state) => state.accessToken);
  const { toast } = useToast();
  const { handleAsyncOperation } = useErrorHandler();

  // Clean up old saved codes on mount (cleanup utility)
  useEffect(() => {
    try {
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('problemCode_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            if (data.timestamp && data.timestamp < sevenDaysAgo) {
              keysToRemove.push(key);
            }
          } catch {
            // Invalid JSON, remove it
            keysToRemove.push(key);
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error("Error cleaning up old saved codes:", error);
    }
  }, []);

    // Check for pre-filled code from submission page and restore saved code
  useEffect(() => {
    try {
      // First check for prefill data (from submission page)
      const prefillData = localStorage.getItem('prefillCode');
      if (prefillData) {
        const { code: prefillCode, language: prefillLanguage } = JSON.parse(prefillData);
        setCode(prefillCode);
        setLanguage(prefillLanguage);
        
        // Clear the prefill data after using it
        localStorage.removeItem('prefillCode');
        
        toast({
          title: "Code Loaded",
          description: "Code from submission has been loaded into the editor.",
          variant: "default",
        });
        return; // Don't load saved code if we have prefill data
      }
      
      // If no prefill data, check for saved code for this problem
      const savedCodeKey = `problemCode_${problemId}`;
      const savedData = localStorage.getItem(savedCodeKey);
      if (savedData) {
        const { code: savedCode, language: savedLanguage, timestamp } = JSON.parse(savedData);
        
        // Only restore if saved within last 7 days
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        if (timestamp > sevenDaysAgo) {
          setCode(savedCode);
          setLanguage(savedLanguage);
          
          toast({
            title: "Code Restored",
            description: "Your previous code has been restored from local storage.",
            variant: "default",
          });
        } else {
          // Clean up old saved code
          localStorage.removeItem(savedCodeKey);
        }
      }
    } catch (error) {
      console.error("Error loading saved code:", error);
    }
  }, [problemId, toast]);

  // Auto-save code changes to localStorage
  useEffect(() => {
    if (problem && code.trim()) {
      const saveCodeKey = `problemCode_${problemId}`;
      const dataToSave = {
        code: code,
        language: language,
        timestamp: Date.now(),
        problemTitle: problem.title
      };
      
      try {
        localStorage.setItem(saveCodeKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Error saving code:", error);
      }
    }
  }, [code, language, problemId, problem]);

  // Load problem data
  useEffect(() => {
    if (!problemId) return;

    const loadProblemData = async () => {
      setIsLoading(prev => ({ ...prev, problem: true }));
      try {
        const [problemData, testCases] = await Promise.all([
          problemService.getProblem(problemId),
          problemService.getPublicTestCases(problemId),
        ]);

        setProblem(problemData);
        setSampleTestcases(testCases);
        setCustomTestcases([]);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load problem data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(prev => ({ ...prev, problem: false }));
      }
    };

    loadProblemData();
  }, [problemId, toast]);

  // Load past submissions
  useEffect(() => {
    const loadPastSubmissions = async () => {
      try {
        if (!problemId || !accessToken) return;
        const submissions = await problemService.getPastSubmissions(problemId);
        setPastSubmissions(submissions);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load past submissions",
          variant: "destructive",
        });
      }
    };

    loadPastSubmissions();
  }, [problemId, accessToken, toast]);

  // Poll submission status
  useEffect(() => {
    if (!submissionId) return;

    const interval = setInterval(async () => {
      try {
        const submission = await problemService.getSubmissionStatus(submissionId);
        setSubmissionResults({
          status: submission.status,
          verdict: submission.verdict,
          results: submission.testcaseResults,
        });

        const passedCount = submission.testcaseResults.filter((t: { passed: boolean }) => t.passed).length;
        const failed = submission.testcaseResults.length - passedCount;

        if (submission.verdict === "Accepted" || failed >= 2) {
          setAiReviewAvailable(true);
        }

        if (submission.status === "Completed") {
          clearInterval(interval);
        }
      } catch (err) {
        clearInterval(interval);
        console.error("Error polling submission status", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [submissionId]);

  // Actions
  const handleAddCustomTestcase = () => {
    if (!problemId) return;
    setCustomTestcases((prev) => [
      ...prev,
      { 
        id: `${Date.now()}_${prev.length + 1}`, 
        problemId: problemId as string, 
        input: "", 
        output: "" 
      },
    ]);
  };

  const handleTest = async () => {
    // Validate code before testing
    const validation = ProblemSolvingDomain.validateCode(code, language);
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(prev => ({ ...prev, test: true }));
    const allTestcases = [...sampleTestcases, ...customTestcases];
    const testcases = allTestcases.map((tc) => ({
      input: tc.input,
      expectedOutput: tc.output,
    }));

    const result = await handleAsyncOperation(
      () => problemService.testCode({
        problemId,
        language,
        code,
        testcases,
      }),
      'Test Code'
    );

    if (result) {
      setTestResults(result);
    }
    setIsLoading(prev => ({ ...prev, test: false }));
  };

  const handleSubmit = async () => {
    if (!accessToken) {
      return toast({
        title: "User Not Found",
        description: "Login/Signup Required",
        variant: "destructive",
      });
    }

    setIsLoading(prev => ({ ...prev, submit: true }));
    try {
      const submission = await problemService.submitCode({
        problemId,
        language,
        code,
      });
      setSubmissionId(submission.id);
      setSubmissionResults(null);
      setAiReviewAvailable(false);
      setAiReview(null);
    } catch (err) {
      toast({ 
        title: "Error", 
        description: "Submission failed", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(prev => ({ ...prev, submit: false }));
    }
  };

  const handleAIReview = async () => {
    if (code.trim() === "") {
      return toast({
        title: "Error",
        description: "Code is empty",
        variant: "destructive",
      });
    }

    setIsLoading(prev => ({ ...prev, aiReview: true }));
    try {
      const review = await problemService.getAIReview({
        problemId,
        code,
        language,
      });
      setAiReview(review.reviewText);
      setCodeRating(review.rating);
    } catch {
      toast({ 
        title: "Failed to fetch AI Review", 
        description: "Please try again after some time", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(prev => ({ ...prev, aiReview: false }));
    }
  };

  const handleReset = () => {
    const defaultCode = ProblemSolvingDomain.getDefaultCode(language);
    setCode(defaultCode);
    
    // Also update saved code in localStorage
    handleAsyncOperation(
      async () => {
        const saveCodeKey = `problemCode_${problemId}`;
        localStorage.setItem(saveCodeKey, defaultCode);
      },
      'Reset Code'
    );
  };

  return {
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
  };
};
