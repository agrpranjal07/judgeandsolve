import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import { CheckCircle, XCircle, Clock, Calendar, Code2, Play, Clipboard, ExternalLink } from "lucide-react";
import { Submission, Problem } from "@/_services/submission.service";
import { submissionService } from "@/_services/submission.service";

interface SubmissionHeaderProps {
  submission: Submission;
  problem: Problem;
  onCopyCode: () => void;
  onRunCode: () => void;
  isRunning: boolean;
}

export const SubmissionHeader: React.FC<SubmissionHeaderProps> = ({
  submission,
  problem,
  onCopyCode,
  onRunCode,
  isRunning
}) => {
  const router = useRouter();

  const getVerdictIcon = (verdict: string) => {
    const iconType = submissionService.getVerdictIcon(verdict);
    switch (iconType) {
      case "check-circle":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "clock":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getVerdictIcon(submission.verdict)}
            <div>
              <CardTitle className="text-xl">
                Submission #{submission.id.slice(-8)}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Problem: {problem.title}
              </p>
            </div>
          </div>
          <Badge className={submissionService.getVerdictColor(submission.verdict)}>
            {submission.verdict}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(submission.createdAt).toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Code2 className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{submission.language}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">Status:</span>
            <span>{submission.status}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-medium">User ID:</span>
            <span>{submission.userId}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => router.push(`/problems/${problem.id}`)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            View Problem
          </Button>
          <Button
            onClick={onCopyCode}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Clipboard className="h-4 w-4" />
            Copy Code
          </Button>
          <Button
            onClick={onRunCode}
            variant="outline"
            size="sm"
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            {isRunning ? "Running..." : "Run Code"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
