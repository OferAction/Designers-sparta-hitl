import { TableCell, TableRow } from "@/components/ui/table";

interface MappingGridSkeletonProps {
  rows?: number;
}

const MappingGridSkeleton = ({ rows = 5 }: MappingGridSkeletonProps) => {
  return (
    <>
      {Array.from({ length: rows }, (_, index) => (
        <TableRow key={`skeleton-${index}`} className="hover:bg-transparent border-b-0">
          <TableCell className="align-top p-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              <div className="flex flex-col gap-1">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              </div>
            </div>
          </TableCell>
          <TableCell className="align-top p-3">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse" />
              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
            </div>
          </TableCell>
          <TableCell className="align-top p-3">
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
            </div>
          </TableCell>
          <TableCell className="align-top p-3">
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};

export default MappingGridSkeleton;
