import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export const FileRowSkeleton = () => (
  <TableRow className="cursor-default pointer-events-none">
    <TableCell className="font-medium py-3.5 px-4">
      <Skeleton className="h-5 w-40" />
    </TableCell>
    <TableCell className="font-medium py-3.5 px-4">
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell className="font-medium py-3.5 px-4">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12 rounded-full" />
        <Skeleton className="h-4 w-12" />
      </div>
    </TableCell>
    <TableCell className="font-medium py-3.5 px-4">
      <div className="flex -space-x-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="size-6 rounded-full" />
      </div>
    </TableCell>
    <TableCell className="font-medium py-3.5 px-4">
      <div className="flex justify-end">
        <Skeleton className="h-6 w-6" />
      </div>
    </TableCell>
  </TableRow>
);
