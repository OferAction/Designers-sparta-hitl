import { ReactNode } from "react";

import { FileTextIcon, ArrowUpRightIcon, ArrowsClockwiseIcon } from "@phosphor-icons/react";

import { Terminal, TerminalContent, TerminalEditor } from "@/components/common/CodeTerminal";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { RenderType } from "@/modules/flow/types";

import { NODE_ICONS_MAP } from "@/constants/NodesConstants";

export interface ExecutionDataPanelProps {
  title: string;
  nodeLabel?: string;
  nodeType?: RenderType;
  data?: Record<string, any> | any[];
  className?: string;
  emptyMessage?: string;
  children?: ReactNode;
  iterationPath?: number[];
  showFilesDropdown?: boolean;
  fileKeys?: string[];
  onFileSelect?: (fileKey: string) => void;
  isError?: boolean;
}

export function ExecutionDataPanel({
  title,
  nodeLabel,
  nodeType,
  data,
  className,
  emptyMessage = "No data available",
  children,
  iterationPath = [],
  showFilesDropdown = true,
  fileKeys = [],
  onFileSelect,
  isError = false,
}: ExecutionDataPanelProps) {
  const hasData = !isError && data && (Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0);
  const value = JSON.stringify(data, null, 2);

  const displayLabel = nodeLabel;
  const NodeIcon = nodeType ? NODE_ICONS_MAP(nodeType) : undefined;

  return (
    <div className={cn("flex flex-col bg-background border-r border-t border-b border-border h-full", className)}>
      <div className="flex items-center justify-between p-2 h-10 border-b mb-2 border-border bg-background">
        <div className="flex items-center gap-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          {(hasData || !!children) &&
            iterationPath.length > 0 &&
            iterationPath.map((iteration, index) => (
              <span key={index} className="text-xs text-muted-foreground/80 bg-muted/50 p-1 rounded-md truncate">
                <ArrowsClockwiseIcon className="size-3 inline-block mr-1" />
                {iteration}
              </span>
            ))}
          {(displayLabel || NodeIcon) && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 p-1 rounded-md">
              {NodeIcon && <NodeIcon className="size-3" />}
              {displayLabel && <span className="truncate">{displayLabel}</span>}
            </div>
          )}
        </div>

        {/* Files Dropdown Button */}
        {showFilesDropdown && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-6 focus:ring-2 focus:ring-foreground focus:ring-offset-background focus:ring-offset-2 rounded-md border-border bg-background hover:bg-accent hover:text-accent-foreground"
              >
                <FileTextIcon className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-30">
              {fileKeys.length > 0 ? (
                fileKeys.map((fileName) => (
                  <DropdownMenuItem key={fileName} className="flex items-center gap-2 cursor-pointer" onClick={() => onFileSelect?.(fileName)}>
                    <FileTextIcon className="size-4 text-foreground" />
                    <span className="flex-1 truncate">{fileName}</span>
                    <ArrowUpRightIcon className="size-3 text-foreground" />
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>No files available</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {children ? (
          children
        ) : hasData ? (
          <Terminal className="h-full bg-background border-none">
            <TerminalContent>
              <TerminalEditor
                className="h-full w-full border-none bg-transparent text-foreground"
                options={{
                  minimap: { enabled: false },
                }}
                value={value}
                readOnly
              />
            </TerminalContent>
          </Terminal>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">{emptyMessage}</div>
        )}
      </div>
    </div>
  );
}
