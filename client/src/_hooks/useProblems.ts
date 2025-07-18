import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/_hooks/use-toast";
import useAuthStore from "@/_store/auth";
import { problemsService, ProblemsFilter } from "@/_services/problems.service";
import { Problem } from "@/_services/problem.service";

export const useProblems = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");

  const searchParams = useSearchParams();
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);
  const { toast } = useToast();

  const limit = 10;

  const fetchProblems = useCallback(async (filter: ProblemsFilter = {}) => {
    setIsLoading(true);
    try {
      const { difficulty = "All", page = 1 } = filter;
      const response = await problemsService.getProblems({
        difficulty: difficulty === "All" ? undefined : difficulty,
        page,
        limit,
      });

      setProblems(response.problems);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
      setProblems([]);
      setTotalPages(1);
      toast({
        title: "Error",
        description: "Failed to fetch problems",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Update state from URL params
  useEffect(() => {
    const difficulty = searchParams.get("difficulty") || "All";
    const page = parseInt(searchParams.get("page") || "1");

    setSelectedDifficulty(difficulty);
    setCurrentPage(page);
    fetchProblems({ difficulty, page });
  }, [searchParams, fetchProblems]);

  // Fetch solved problems when user is authenticated
  useEffect(() => {
    if (accessToken) {
      fetchSolvedProblems();
    }
  }, [accessToken]);

  const fetchSolvedProblems = async () => {
    try {
      const solved = await problemsService.getSolvedProblems();
      setSolvedProblems(solved);
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

  return {
    // State
    problems,
    solvedProblems,
    isLoading,
    currentPage,
    totalPages,
    selectedDifficulty,
    accessToken,
    
    // Actions
    handleDifficultyChange,
    handlePageChange,
  };
};
