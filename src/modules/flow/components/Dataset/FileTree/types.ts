import { ReactNode } from "react";

export type TreeItemType = "file" | "folder" | "archive";

export interface TreeItemProps {
  type: TreeItemType;
  name: string;
  level: number;
  hasChildren?: boolean;
  isLast?: boolean;
  className?: string;
}

export interface FileTreeProps {
  children: ReactNode;
  className?: string;
}

export interface TreeLinesProps {
  level: number;
  hasChildren?: boolean;
  isLast?: boolean;
}
