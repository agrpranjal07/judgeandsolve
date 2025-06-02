import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/_components/ui/collapsible";
import { Button } from "@/_components/ui/button";
import { ChevronDown, ChevronUp, CheckCircle, XCircle, Clock } from "lucide-react";

type Submission = {
  id: string;
  problemId: string;
  language: string;
  code: string;
  status: 'pending' | 'accepted' | 'wrong_answer' | 'time_limit' | 'runtime_error';
  testCasesPassed: number;
  totalTestCases: number;
  submittedAt: string;
};

interface SubmissionPanelProps {
  submissions: Submission[];
}

export const SubmissionPanel: React.FC<SubmissionPanelProps> = ({ submissions }) => {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'Accepted';
      case 'wrong_answer':
        return 'Wrong Answer';
      case 'time_limit':
        return 'Time Limit Exceeded';
      case 'runtime_error':
        return 'Runtime Error';
      default:
        return 'Pending';
    }
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">
                Submissions ({submissions.length})
              </CardTitle>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {submissions
                .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                .map((submission) => (
                  <div
                    key={submission.id}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(submission.status)}
                      <div>
                        <div className="text-sm font-medium">
                          {getStatusText(submission.status)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {submission.language} • {new Date(submission.submittedAt).toLocaleString()}
                        </div>
                        <div>
                          <a href={`/submissions/${submission.id}`} className="text-violet-600 hover:underline text-xs">View</a>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {typeof submission.testCasesPassed === 'number' && typeof submission.totalTestCases === 'number'
                          ? `${submission.testCasesPassed}/${submission.totalTestCases}`
                          : '—'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Test Cases
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};