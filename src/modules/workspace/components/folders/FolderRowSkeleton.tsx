import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";

export const FolderRowSkeleton = () => (
  <TableRow className="cursor-default pointer-events-none">
    <TableCell className="font-medium py-[1.375rem] px-4">
      <Skeleton className="h-5 w-40" />
    </TableCell>
    <TableCell className="font-medium py-[1.375rem] px-4">
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell className="font-medium py-[1.375rem] px-4">
      <Skeleton className="h-4 w-6" />
    </TableCell>
    <TableCell className="font-medium py-[1.375rem] px-4">
      <div className="flex -space-x-2">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="size-6 rounded-full" />
      </div>
    </TableCell>
    <TableCell className="font-medium py-[1.375rem] px-4">
      <div className="flex justify-end">
        <Skeleton className="h-6 w-6" />
      </div>
    </TableCell>
  </TableRow>
);
