import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import { CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import { TestcaseResult } from "@/_services/submission.service";

interface TestCaseResultsProps {
  testcaseResults: TestcaseResult[];
  stats: {
    passed: number;
    total: number;
    avgRuntime: number;
    avgMemory: string;
  };
}

export const TestCaseResults: React.FC<TestCaseResultsProps> = ({
  testcaseResults,
  stats
}) => {
  if (testcaseResults.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Test Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No test case results available.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          Test Case Results ({stats.passed}/{stats.total} passed)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-sm text-muted-foreground">Passed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.avgRuntime}ms</div>
            <div className="text-sm text-muted-foreground">Avg Runtime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{stats.avgMemory}MB</div>
            <div className="text-sm text-muted-foreground">Avg Memory</div>
          </div>
        </div>

        {/* Individual Test Cases */}
        <div className="space-y-2">
          {testcaseResults.map((result, index) => (
            <div
              key={result.testcaseId || index}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {result.passed ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className="font-medium">
                  Test Case {index + 1}
                </span>
                <Badge variant={result.passed ? "default" : "destructive"}>
                  {result.passed ? "PASSED" : "FAILED"}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {result.runtime || 0}ms
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  {result.memory || 0}MB
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
