"use client";
import React from "react";
import { Card, CardContent } from "@/_components/ui/card";
import { Button } from "@/_components/ui/button";
import { CodeEditor } from "./CodeEditor";

interface CodeSubmissionPanelProps {
  language: string;
  code: string;
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  onTest: () => void;
  onSubmit: () => void;
  onAIReview: () => void;
  onReset: () => void;
  aiReviewAvailable: boolean;
  isLoading?: {
    test: boolean;
    submit: boolean;
    aiReview: boolean;
  };
}

export const CodeSubmissionPanel: React.FC<CodeSubmissionPanelProps> = ({
  language,
  code,
  setCode,
  setLanguage,
  onTest,
  onSubmit,
  onAIReview,
  onReset,
  aiReviewAvailable,
  isLoading = { test: false, submit: false, aiReview: false },
}) => {
  return (
    <Card>
      <CardContent className="space-y-6 pt-6 pb-6 px-4">
        <CodeEditor 
          language={language} 
          code={code} 
          setCode={setCode} 
          setLanguage={setLanguage} 
          onReset={onReset} 
        />
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            onClick={onTest}
            disabled={isLoading.test}
          >
            {isLoading.test ? "Testing..." : "Test"}
          </Button>
          <Button 
            onClick={onSubmit}
            disabled={isLoading.submit}
          >
            {isLoading.submit ? "Submitting..." : "Submit"}
          </Button>
          {aiReviewAvailable && (
            <Button 
              onClick={onAIReview}
              disabled={isLoading.aiReview}
            >
              {isLoading.aiReview ? "Generating..." : "AI Review"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
