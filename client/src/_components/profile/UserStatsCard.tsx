import { Card, CardContent } from "@/_components/ui/card";
import { Skeleton } from "@/_components/ui/skeleton";
import { ReactNode } from "react";

interface UserStatsCardProps {
  title: string;
  value?: number | string;
  icon: ReactNode;
  isLoading: boolean;
}

export function UserStatsCard({ title, value, icon, isLoading }: UserStatsCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <p className="text-2xl font-bold">{value}</p>
            )}
          </div>
          <div className="p-2 bg-muted/80 dark:bg-muted/30 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
