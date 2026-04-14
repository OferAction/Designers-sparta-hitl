import { ProjectDataRow } from "@/types/user";

import ProjectsSheetTable from "./ProjectsSheetTable";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface ProjectUsersSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRow?: ProjectDataRow;
}

const ProjectUsersSheet = ({ isOpen, onOpenChange, selectedRow }: ProjectUsersSheetProps) => {
  if (!selectedRow) return null;
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-2 bg-sidebar min-w-[452px]">
        <SheetHeader className="py-3 min-h-[56px] border-b border-sidebar-border overflow-x-hidden">
          <SheetTitle className="text-sm text-foreground">{selectedRow?.projectName ? selectedRow?.projectName : "__"}</SheetTitle>
        </SheetHeader>

        <div className="py-2 h-full overflow-hidden">
          <ProjectsSheetTable onOpenChange={onOpenChange} selectedRow={selectedRow} />
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProjectUsersSheet;
