import { FileArchiveIcon, FileIcon, FolderOpenIcon } from "@phosphor-icons/react";

import { TreeItemProps } from "./types";
import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const iconMap = {
  file: FileIcon,
  folder: FolderOpenIcon,
  archive: FileArchiveIcon,
};

export function TreeItem({ type, name, level, hasChildren = false, isLast = false, className }: TreeItemProps) {
  const Icon = iconMap[type];

  if (level === 0) {
    return (
      <TableRow className={cn("border-0 hover:bg-transparent relative h-10", className)}>
        <TableCell className="p-0 h-10">
          <div className="flex items-center gap-2 px-2 h-full">
            <Icon className="w-4 h-4 text-muted-foreground" weight="fill" />
            <span className="text-xs text-foreground tracking-[0.1em]">{name}</span>
          </div>
          {hasChildren && <div className="absolute left-4 bottom-0 w-px h-[20px] bg-border inline-block"></div>}
        </TableCell>
      </TableRow>
    );
  }

  if (level === 1) {
    return (
      <TableRow className={cn("border-0 hover:bg-transparent h-10", className)}>
        <TableCell className="p-0 h-10 relative">
          {/* Tree lines */}
          <div className="absolute left-4 top-0 space-x-4 h-full">
            {/* Vertical line from parent */}
            <div className="w-px h-full bg-border inline-block"></div>
            {/* Vertical line for this level */}
            {hasChildren && <div className="absolute w-px h-[15px] bottom-0 bg-border inline-block"></div>}
          </div>
          <div className="flex items-center h-full pl-4">
            <div className="flex items-center gap-2 px-2">
              <Icon className="w-4 h-4 text-muted-foreground" weight="fill" />
              <span className="text-[12px] text-foreground tracking-[0.1em]">{name}</span>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className={cn("border-0 hover:bg-transparent h-10", isLast && "relative", className)}>
      <TableCell className="p-0 h-10 relative">
        {/* Tree lines */}
        <div className="absolute left-4 top-0 space-x-4 h-full">
          {/* Vertical line from parent */}
          <div className="w-px h-full bg-border inline-block"></div>
          {/* Vertical line for this level */}
          {isLast ? (
            <div className="absolute w-px h-[20px] top-0 bg-border inline-block"></div>
          ) : (
            <div className="w-px h-full bg-border inline-block"></div>
          )}
        </div>
        <div className="flex items-center h-full pl-8">
          <div className="flex items-center gap-2 px-2">
            <Icon className="w-4 h-4 text-muted-foreground" weight="fill" />
            <span className="text-[12px] text-foreground tracking-[0.1em]">{name}</span>
          </div>
        </div>
        {/* Horizontal connector for last item */}
        {isLast && <div className="absolute left-[33px] bottom-[50%] w-[8px] h-px bg-border inline-block"></div>}
      </TableCell>
    </TableRow>
  );
}
