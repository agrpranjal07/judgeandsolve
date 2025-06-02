import React from 'react';
import { Badge } from "@/_components/ui/badge";
import { cn } from "@/_lib/utils";

interface DifficultyBadgeProps {
  difficulty: 'Easy' | 'Medium' | 'Hard';
  className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ difficulty, className }) => {
  const getBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-500 hover:bg-green-600 text-white';
      case 'Medium':
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'Hard':
        return 'bg-red-500 hover:bg-red-600 text-white';
      default:
        return 'bg-gray-500 hover:bg-gray-600 text-white';
    }
  };

  return (
    <Badge 
      className={cn(getBadgeColor(difficulty), "shrink-0", className)}
    >
      {difficulty}
    </Badge>
  );
};