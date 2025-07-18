"use client";
import React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/_components/ui/tabs";

interface DifficultyFilterProps {
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
}

export const DifficultyFilter: React.FC<DifficultyFilterProps> = ({
  selectedDifficulty,
  onDifficultyChange,
}) => {
  return (
    <Tabs
      value={selectedDifficulty}
      onValueChange={onDifficultyChange}
      className="mb-6"
    >
      <TabsList className="grid w-full max-w-md grid-cols-4">
        <TabsTrigger value="All">All</TabsTrigger>
        <TabsTrigger value="Easy">Easy</TabsTrigger>
        <TabsTrigger value="Medium">Medium</TabsTrigger>
        <TabsTrigger value="Hard">Hard</TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
