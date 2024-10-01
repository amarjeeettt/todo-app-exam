import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskProgressSkeleton() {
  return (
    <>
      <div className="flex justify-between items-start mb-4">
        <div>
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-60 mb-4" />
        </div>
        <Skeleton className="h-12 w-12 rounded" />
      </div>
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-3 w-40 mt-2" />
    </>
  );
}
