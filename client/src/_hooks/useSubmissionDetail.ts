import { useState, useEffect } from "react";
import { useToast } from "@/_hooks/use-toast";
import { useAuthGuard } from "@/_hooks/useAuthGuard";
import useAuthStore from "@/_store/auth";
import { 
  submissionService, 
  Submission, 
  TestcaseResult, 
  Problem, 
  SubmissionDetail 
} from "@/_services/submission.service";

export const useSubmissionDetail = (submissionId: string) => {
  useAuthGuard();
  
  const { accessToken } = useAuthStore();
  const { toast } = useToast();
  
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [testcaseResults, setTestcaseResults] = useState<TestcaseResult[]>([]);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewNote, setReviewNote] = useState("");
  const [editingReview, setEditingReview] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Fetch submission details
  useEffect(() => {
    const fetchSubmissionDetail = async () => {
      if (!submissionId) return;

      setIsLoading(true);
      try {
        const data: SubmissionDetail = await submissionService.getSubmissionDetail(submissionId);
        
        setSubmission(data.submission);
        setTestcaseResults(data.testcaseResults || []);
        setProblem(data.problem);
        setReviewNote(data.submission?.reviewNote || ""); // Safe access with optional chaining
      } catch (err) {
        console.error("Failed to fetch submission:", err);
        toast({
          title: "Error",
          description: "Failed to load submission details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissionDetail();
  }, [submissionId, toast]);

  // Copy code to clipboard
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
      const updatedSubmission = await submissionService.saveReviewNote(submission.id, reviewNote);
      setSubmission(updatedSubmission);
      setEditingReview(false);
      toast({ title: "Review saved" });
    } catch {
      toast({ title: "Failed to save review", variant: "destructive" });
    } finally {
      setIsSavingReview(false);
    }
  };

  // Calculate test case statistics
  const testCaseStats = submissionService.calculateTestCaseStats(testcaseResults);

  return {
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
  };
};
