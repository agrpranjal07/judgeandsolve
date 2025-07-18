'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Card, CardContent, CardHeader } from "@/_components/ui/card";
import { Button } from "@/_components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/select";
import { RotateCcw } from "lucide-react";
import MonacoEditor, { loader } from '@monaco-editor/react';
import nightOwl from 'monaco-themes/themes/Night Owl.json';

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (language: string) => void;
  onReset: () => void;
  isReadOnly?: boolean;
}

const languages = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'cpp', label: 'C++' },
];

const languageMap: Record<string, string> = {
  python: 'python',
  javascript: 'javascript',
  cpp: 'cpp',
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  setCode,
  language,
  setLanguage,
  onReset,
  isReadOnly = false,
}) => {
  const { theme } = useTheme();
  const [isMonacoReady, setIsMonacoReady] = useState(false);

  useEffect(() => {
    loader.init().then(monaco => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      monaco.editor.defineTheme('night-owl', nightOwl as any);
      setIsMonacoReady(true);
    });
  }, []);

  return (
    <Card className="flex-1 flex flex-col rounded-2xl shadow-md border border-muted bg-background overflow-hidden">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-base">Code Editor</span>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 h-8 rounded-md text-sm">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {!isReadOnly && <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="gap-2 h-8"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <div className="h-[400px] w-full">
          {isMonacoReady && (
            <MonacoEditor
              height="100%"
              language={languageMap[language]}
              value={code}
              onChange={(val) => setCode(val || "")}
              theme={theme === 'light' ? 'vs-light' : 'night-owl'}
              options={{
                fontSize: 14,
                fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, monospace',
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                automaticLayout: true,
                tabSize: 2,
                lineNumbers: "on",
                renderLineHighlight: "gutter",
                padding: { top: 10 },
                readOnly: isReadOnly,
              }}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
