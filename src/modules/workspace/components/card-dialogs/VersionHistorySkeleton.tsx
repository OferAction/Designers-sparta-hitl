import { Skeleton } from "@/components/ui/skeleton";

export const VersionHistorySkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <div className="min-h-[440px]">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex items-stretch justify-between px-6 py-3">
          <div className="flex flex-1 items-center gap-2 w-full">
            <div className="grid grid-cols-4 w-full gap-4 items-center">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <Skeleton className="size-6 rounded-full" />
                  <Skeleton className="size-6 rounded-full" />
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            </div>
            <Skeleton className="ml-auto h-9 w-20 invisible" />
          </div>
        </div>
      ))}
    </div>
  );
};
