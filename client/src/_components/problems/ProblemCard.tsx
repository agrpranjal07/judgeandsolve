import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import { DifficultyBadge } from "./DifficultyBadge";
import { Check } from "lucide-react";
import Link from 'next/link';

type Problem = {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
};

interface ProblemCardProps {
  problem: Problem;
  isSolved: boolean;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, isSolved }) => {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-200 relative">
      {isSolved && (
        <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg leading-tight">
            <Link 
              href={`/problems/${problem.id}`}
              className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
            >
              {problem.title}
            </Link>
          </CardTitle>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {problem.description}
        </p>
        
        <div className="flex flex-wrap gap-2">
          {problem.tags &&problem.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
