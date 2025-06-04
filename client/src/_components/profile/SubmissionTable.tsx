import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/_components/ui/table";
  import { Badge } from "@/_components/ui/badge";
  import Link from 'next/link';
  import { Skeleton } from "@/_components/ui/skeleton";
  
  interface Submission {
    id: string;
    problemTitle: string;
    problemId: string;
    language: string;
    verdict: "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "MEMORY_LIMIT_EXCEEDED" | "RUNTIME_ERROR" | "COMPILATION_ERROR";
    createdAt: string;
    runtime: number;
    memory: number;
  }
  
  interface SubmissionsTableProps {
    submissions: Submission[];
    isLoading: boolean;
  }
  
  export function SubmissionsTable({ submissions, isLoading }: SubmissionsTableProps) {
    const getVerdictBadge = (verdict: Submission['verdict']) => {
      const verdictStyles = {
        ACCEPTED: "bg-green-500 hover:bg-green-600 dark:bg-green-700 dark:hover:bg-green-600",
        WRONG_ANSWER: "bg-red-500 hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-600",
        TIME_LIMIT_EXCEEDED: "bg-amber-500 hover:bg-amber-600 dark:bg-amber-700 dark:hover:bg-amber-600",
        MEMORY_LIMIT_EXCEEDED: "bg-orange-500 hover:bg-orange-600 dark:bg-orange-700 dark:hover:bg-orange-600",
        RUNTIME_ERROR: "bg-rose-600 hover:bg-rose-700 dark:bg-rose-800 dark:hover:bg-rose-700",
        COMPILATION_ERROR: "bg-gray-500 hover:bg-gray-600 dark:bg-gray-700 dark:hover:bg-gray-600",
      };
  
      const verdictLabel = {
        ACCEPTED: "✅ Accepted",
        WRONG_ANSWER: "❌ Wrong Answer",
        TIME_LIMIT_EXCEEDED: "🕓 TLE",
        MEMORY_LIMIT_EXCEEDED: "⚠️ MLE",
        RUNTIME_ERROR: "💥 RE",
        COMPILATION_ERROR: "CE",
      };
  
      return (
        <Badge className={verdictStyles[verdict]}>
          {verdictLabel[verdict]}
        </Badge>
      );
    };
  
    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };
  
    // Generate skeleton rows for loading state
    const skeletonRows = Array(5).fill(0).map((_, index) => (
      <TableRow key={`skeleton-${index}`}>
        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-32" /></TableCell>
        <TableCell><Skeleton className="h-5 w-28" /></TableCell>
      </TableRow>
    ));
  
    return (
      <div className="border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Problem</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Verdict</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Runtime / Memory</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              skeletonRows
            ) : submissions.length > 0 ? (
              submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">
                    <Link 
                      href={`/submissions/${submission.id}`}
                      className="text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      {submission.problemTitle}
                    </Link>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{submission.language}</TableCell>
                  <TableCell>{getVerdictBadge(submission.verdict)}</TableCell>
                  <TableCell>{formatDate(submission.createdAt)}</TableCell>
                  <TableCell className="font-mono">
                    {submission.runtime}ms / {submission.memory}MB
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                  No submissions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }