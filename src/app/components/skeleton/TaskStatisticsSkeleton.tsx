import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function TaskStatisticsSkeleton() {
  return (
    <>
      <Card className="flex-1 p-4">
        <div className="flex flex-col items-center">
          <Skeleton className="h-10 w-16" />
          <Separator className="w-1/2 my-2" decorative />
          <div className="flex flex-col items-center">
            <Skeleton className="h-5 w-20 mb-1" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </Card>
    </>
  );
}
