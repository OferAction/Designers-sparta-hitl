import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardFooter } from "@/modules/workspace/components/card";

export const FileCardSkeleton = () => (
  <Card variant="file" className="pointer-events-none">
    <div className="flex flex-col justify-between flex-1">
      <Skeleton className="w-full h-48 rounded-none" />

      <div className="mt-auto p-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
        </div>

        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-12 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex -space-x-2">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="size-6 rounded-full" />
            </div>
          </div>
        </CardFooter>
      </div>
    </div>
  </Card>
);
