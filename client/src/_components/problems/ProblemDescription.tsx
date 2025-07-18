"use client";
import React from "react";
import { Card, CardContent } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import { Textarea } from "@/_components/ui/textarea";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Problem } from "@/_services/problem.service";

interface ProblemDescriptionProps {
  problem: Problem;
}

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({ problem }) => {
  return (
    <Card>
      <CardContent className="space-y-6 pt-6 pb-2 px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{problem.title}</h1>
          <Badge
            className={`${
              problem.difficulty === "Easy"
                ? "bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100"
                : problem.difficulty === "Medium"
                ? "bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                : "bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100"
            }`}
          >
            {problem.difficulty}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Created by: {problem.createdBy.toLowerCase()}</span>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {problem.tags?.map((tag) => (
            <Badge
              key={tag}
              className="bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Description */}
        <div className="prose dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
            components={{
              code({ className, children, ...props }: { className?: string; children?: React.ReactNode; inline?: boolean }) {
                const match = /language-(\w+)/.exec(className || "");
                return !props.inline && match ? (
                  <pre className="bg-gray-800 text-white p-4 rounded-md overflow-auto">
                    <code className={className} {...props}>
                      {String(children).replace(/\n$/, "")}
                    </code>
                  </pre>
                ) : (
                  <code
                    className="bg-gray-200 dark:bg-gray-700 px-1 rounded text-sm"
                    {...props}
                  >
                    {children}
                  </code>
                );
              },
            }}
          >
            {problem.description}
          </ReactMarkdown>
        </div>

        {/* Sample Input/Output */}
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-1">Sample Input</h3>
            <Textarea
              value={problem.sampleInput}
              readOnly
              className="w-full resize-none min-h-[6rem] border border-gray-300 dark:border-gray-600"
            />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Sample Output</h3>
            <Textarea
              value={problem.sampleOutput}
              readOnly
              className="w-full resize-none min-h-[6rem] border border-gray-300 dark:border-gray-600"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
