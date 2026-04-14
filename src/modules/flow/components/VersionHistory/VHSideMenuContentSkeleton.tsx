import { Skeleton } from "@/components/ui/skeleton";

const VHSideContentMenuSkeleton: React.FC = () => {
  return (
    <div className="py-3 px-4 relative">
      <ul className="overflow-y-auto flex flex-col gap-2">
        {Array.from({ length: 1 }).map((_, dayIndex) => (
          <li key={`skeleton-day-${dayIndex}`}>
            {/* Date header skeleton */}
            <div className="bg-sidebar w-full sticky top-0 z-10  text-center">
              <Skeleton className="h-5 w-32 mx-auto" />
            </div>

            <ol className="flex flex-col">
              {Array.from({ length: dayIndex === 0 ? 6 : 3 }).map((_, itemIndex) => (
                <li
                  key={`skeleton-item-${dayIndex}-${itemIndex}`}
                  className="[&:not(:last-child)]:pb-1 [&:not(:last-child)]:mb-1 [&:not(:last-child)]:border-border [&:not(:last-child)]:border-b"
                >
                  <div className="flex items-center justify-between p-[6px] border-2 border-transparent rounded-sm">
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-5 w-16" />

                      {/* Collaborators skeleton */}
                      <div className="flex -space-x-4">
                        {Array.from({ length: 1 }).map((_, avatarIndex) => (
                          <Skeleton key={`avatar-${avatarIndex}`} className="h-8 w-8 rounded-full" />
                        ))}
                      </div>
                    </div>

                    {/* Button skeleton */}
                    <Skeleton className="h-8 w-20" />
                  </div>
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VHSideContentMenuSkeleton;
