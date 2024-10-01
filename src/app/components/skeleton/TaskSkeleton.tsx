import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskSkeleton() {
  return (
    <>
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
