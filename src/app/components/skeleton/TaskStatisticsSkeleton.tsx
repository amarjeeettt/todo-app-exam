import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function TaskStatisticsSkeleton() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <Skeleton className="h-10 w-16 mb-1" />
      <Separator className="my-1" decorative />
      <div className="mt-1 flex flex-col items-center">
        <Skeleton className="h-5 w-20 mb-1" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}
