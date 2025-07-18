import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/_components/ui/card";
import { CodeEditor } from "@/_components/problems/CodeEditor";
import { Code2 } from "lucide-react";

interface CodeDisplayProps {
  code: string;
  language: string;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({
  code,
  language
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code2 className="h-5 w-5" />
          Submitted Code ({language})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <CodeEditor
            code={code}
            setCode={() => {}} // Read-only
            language={language}
            setLanguage={() => {}} // Read-only
            onReset={() => {}} // No reset for submitted code
            isReadOnly={true}
          />
        </div>
      </CardContent>
    </Card>
  );
};
