import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardFooter } from "@/modules/workspace/components/card";

export const FolderCardSkeleton = () => (
  <Card variant="folder" className="pointer-events-none group-hover:pointer-events-none">
    <div className="p-4 flex-1 w-full gap-4 flex flex-col justify-between">
      {/* Folder preview grid skeleton */}
      <div className="grid grid-cols-2 gap-2 h-40">
        <Skeleton className="w-full h-full rounded-md" />
        <Skeleton className="w-full h-full rounded-md" />
        <Skeleton className="w-full h-full rounded-md" />
        <Skeleton className="w-full h-full rounded-md" />
      </div>

      <div className="mt-auto">
        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-32" />
        </div>

        <CardFooter>
          <div className="flex justify-between items-center w-full">
            <Skeleton className="h-4 w-32" />
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
