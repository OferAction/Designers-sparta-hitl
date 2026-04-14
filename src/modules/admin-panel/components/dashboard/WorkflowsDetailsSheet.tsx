import { WorkflowDataRow } from "@/types/user";

import WorkflowsSheetTable from "./WorkflowsSheetTable";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface WorkflowsDetailsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRow?: WorkflowDataRow;
}

const WorkflowsDetailsSheet = ({ isOpen, onOpenChange, selectedRow }: WorkflowsDetailsSheetProps) => {
  if (!selectedRow) return null;
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-2 bg-sidebar min-w-[452px]">
        <SheetHeader className="py-3 min-h-[56px] border-b border-sidebar-border overflow-x-hidden">
          <SheetTitle className="text-sm text-foreground">{selectedRow?.workflowName ? selectedRow?.workflowName : "__"}</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">{selectedRow?.projectName ? selectedRow?.projectName : "__"}</SheetDescription>
        </SheetHeader>

        <div className="py-2 h-full overflow-hidden">
          <WorkflowsSheetTable onOpenChange={onOpenChange} selectedRow={selectedRow} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default WorkflowsDetailsSheet;
