"use client";

import React from "react";
import { Button } from "@/_components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/_components/ui/card";
import { Badge } from "@/_components/ui/badge";
import { DashboardStats, RecentSubmission } from "@/_services/dashboard.service";

const getVerdictColor = (verdict: string) => {
  switch (verdict) {
    case "ACCEPTED": return "bg-green-500";
    case "WRONG_ANSWER": return "bg-red-500";
    case "TIME_LIMIT_EXCEEDED": return "bg-amber-500";
    default: return "bg-gray-500";
  }
};

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  tags?: string[];
  stats?: DashboardStats | null;
  list?: RecentSubmission[];
  actionText?: string;
  onAction: () => void;
  isLoading?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  icon,
  title,
  description,
  tags,
  stats,
  list,
  actionText = "Explore",
  onAction,
  isLoading = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {description && <p className="text-muted-foreground mb-4">{description}</p>}
        
        {tags && (
          <div className="flex gap-2 flex-wrap mb-4">
            {tags.map((tag, i) => (
              <Badge key={i} variant="outline">{tag}</Badge>
            ))}
          </div>
        )}
        
        {stats && !isLoading && (
          <>
            <div className="flex justify-between">
              <span>Problems Attempted</span>
              <strong>{stats.totalAttempted}</strong>
            </div>
            <div className="flex justify-between">
              <span>Acceptance Rate</span>
              <strong>{stats.accuracyRate}%</strong>
            </div>
            <div className="flex justify-between">
              <span>Accepted Submissions</span>
              <strong>{stats.totalAccepted}</strong>
            </div>
          </>
        )}
        
        {stats && isLoading && (
          <div className="space-y-2">
            <div className="h-4 bg-muted animate-pulse rounded"></div>
            <div className="h-4 bg-muted animate-pulse rounded"></div>
            <div className="h-4 bg-muted animate-pulse rounded"></div>
          </div>
        )}
        
        {list && !isLoading && (
          <ul className="space-y-3">
            {list.map((s, i) => (
              <li key={i} className="flex items-center justify-between border-b border-border/30 pb-2">
                <div>
                  <p className="font-medium">{s.problemTitle}</p>
                  <div className="text-xs text-muted-foreground font-mono">
                    {s.language} • {s.time}
                  </div>
                </div>
                <Badge className={getVerdictColor(s.verdict)}>{s.verdict}</Badge>
              </li>
            ))}
          </ul>
        )}
        
        {list && isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center border-b border-border/30 pb-2">
                <div className="space-y-1">
                  <div className="h-4 bg-muted animate-pulse rounded w-32"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-20"></div>
                </div>
                <div className="h-6 bg-muted animate-pulse rounded w-16"></div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={onAction} className="w-full">{actionText}</Button>
      </CardFooter>
    </Card>
  );
};
