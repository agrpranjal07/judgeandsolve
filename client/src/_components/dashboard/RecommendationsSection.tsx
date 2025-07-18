"use client";

import React from "react";
import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/_components/ui/card";

interface RecommendationsSectionProps {
  onCategoryClick?: (category: string) => void;
}

export const RecommendationsSection: React.FC<RecommendationsSectionProps> = ({
  onCategoryClick = () => {}
}) => {
  const categories = ["Graph Algorithms", "Dynamic Programming", "Binary Search"];

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">Recommended for you</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <Card key={index} className="bg-card hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {`Improve your ${category.toLowerCase()} skills with our curated problems.`}
              </p>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => onCategoryClick(category)}
              >
                Explore
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </section>
  );
};
