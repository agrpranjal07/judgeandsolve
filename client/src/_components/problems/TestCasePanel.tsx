"use client";
import React from "react";
import { Button } from "@/_components/ui/button";
import { Textarea } from "@/_components/ui/textarea";
import { SubmissionsTable } from "@/_components/profile/SubmissionTable";
import { TestCase, PastSubmission } from "@/_services/problem.service";

interface TestCasePanelProps {
  sampleTestcases: TestCase[];
  customTestcases: TestCase[];
  setCustomTestcases: React.Dispatch<React.SetStateAction<TestCase[]>>;
  pastSubmissions: PastSubmission[];
  showPastSubmissions: boolean;
  setShowPastSubmissions: React.Dispatch<React.SetStateAction<boolean>>;
  problemId: string;
  onAddCustomTestcase: () => void;
}

export const TestCasePanel: React.FC<TestCasePanelProps> = ({
  sampleTestcases,
  customTestcases,
  setCustomTestcases,
  pastSubmissions,
  showPastSubmissions,
  setShowPastSubmissions,
  onAddCustomTestcase,
}) => {
  const handleCustomTestcaseChange = (idx: number, field: 'input' | 'output', value: string) => {
    const updated = [...customTestcases];
    updated[idx][field] = value;
    setCustomTestcases(updated);
  };

  if (showPastSubmissions) {
    return (
      <div>
        {pastSubmissions.length > 0 && (
          <Button 
            onClick={() => setShowPastSubmissions(!showPastSubmissions)}
            className="mb-4"
          >
            Show Test Cases
          </Button>
        )}
        <SubmissionsTable submissions={pastSubmissions} isLoading={false} />
      </div>
    );
  }

  return (
    <div>
      {pastSubmissions.length > 0 && (
        <Button 
          onClick={() => setShowPastSubmissions(!showPastSubmissions)}
          className="mb-4"
        >
          Show Past Submissions
        </Button>
      )}
      
      {/* Sample Test Cases */}
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

      {/* Custom Test Cases */}
      <div className="space-y-4 mt-6">
        <h3 className="font-semibold">Custom Testcases</h3>
        {customTestcases.map((tc, idx) => (
          <div key={idx} className="space-y-2">
            <p className="font-semibold">Testcase {sampleTestcases.length + idx + 1}:</p>
            <Textarea
              placeholder="Input"
              value={tc.input}
              onChange={(e) => handleCustomTestcaseChange(idx, 'input', e.target.value)}
            />
            <Textarea
              placeholder="Expected Output"
              value={tc.output}
              onChange={(e) => handleCustomTestcaseChange(idx, 'output', e.target.value)}
            />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={onAddCustomTestcase}>
          + Add Custom Testcase
        </Button>
      </div>
    </div>
  );
};
