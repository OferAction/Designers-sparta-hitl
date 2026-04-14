import { Loader } from "@/components/common/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils";

interface RequestsTableHeaderProps {
  title: string;
  filteredRowCount: number;
  isApproveAllPending: boolean;
  onApproveAll: () => void;
  className?: string;
}

export function RequestsTableHeader({
  title,
  filteredRowCount,
  isApproveAllPending,
  onApproveAll,
  className,
}: RequestsTableHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-sidebar-border",
        className
      )}
    >
      <div className="flex items-center gap-4">
        <h3 className="text-sm text-sidebar-foreground/70 leading-6">{title}</h3>
        <Badge variant="secondary" className="text-xs font-semibold rounded-full">
          {filteredRowCount}
        </Badge>
      </div>
      <Button size="sm" className="min-w-[85px]" onClick={onApproveAll} disabled={filteredRowCount === 0 || isApproveAllPending}>
        {isApproveAllPending ? <Loader className="size-4" /> : "Approve all"}
      </Button>
    </div>
  );
}
