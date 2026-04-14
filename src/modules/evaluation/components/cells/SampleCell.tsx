import { DownloadSimpleIcon } from "@phosphor-icons/react";
import { Cell } from "@tanstack/react-table";

import { BadgeCell } from "./BadgeCell";
import { useDownloadEvaluationSamplesLogs } from "../../services";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface SampleCellProps<TData extends { type?: unknown; nodeId?: string; id: string }> {
  value: number;
  cell: Cell<TData, number>;
  batchId: string;
  nodeId: string;
  badgeClassName?: string;
}

export function SampleCell<TData extends { type?: unknown; nodeId?: string; id: string }>({
  value,
  cell,
  batchId,
  nodeId,
  badgeClassName,
}: SampleCellProps<TData>) {
  const { mutate: downloadLogs, isPending } = useDownloadEvaluationSamplesLogs(batchId, nodeId);

  if (value === null || value === undefined || !value) return null;

  const handleDownload = () => {
    downloadLogs();
  };

  return (
    <div className="flex items-center gap-1">
      <BadgeCell
        className={cn("text-muted-foreground text-xs group-data-[row-hovered=true]/tableRow:text-foreground", badgeClassName)}
        value={value}
        cell={cell}
      />
      <Button
        className="size-4 group-data-[row-hovered=true]/tableRow:flex hidden"
        variant="link"
        size="icon"
        onClick={handleDownload}
        loading={isPending}
      >
        <DownloadSimpleIcon />
      </Button>
    </div>
  );
}
