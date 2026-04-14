import { ArrowsCounterClockwiseIcon } from "@phosphor-icons/react";
import { PopoverAnchor } from "@radix-ui/react-popover";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useViewOnlyContext } from "@/contexts/ViewOnlyContext";
import { useDialogStore } from "@/store";

interface WorkflowUpdatePopoverProps {
  open?: boolean;
  onIgnore?: () => void;
  onUpdate?: () => void;
}

export function WorkflowUpdatePopover({ children, open = false, onIgnore, onUpdate }: React.PropsWithChildren<WorkflowUpdatePopoverProps>) {
  const hasActiveDialogs = useDialogStore((store) => !!store.dialogs.length);
  const { viewOnly } = useViewOnlyContext();

  if (viewOnly) {
    return <>{children}</>;
  }
  return (
    <Popover open={!hasActiveDialogs && open} modal={false}>
      <PopoverTrigger />
      <PopoverAnchor>{children}</PopoverAnchor>
      <PopoverContent
        side="right"
        align="center"
        sideOffset={8}
        sticky="always"
        className="bg-card border border-border rounded-lg w-[276px] shadow-lg p-6"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-start gap-2">
            <div className="flex gap-2 items-center">
              <ArrowsCounterClockwiseIcon className="w-6 h-6 text-primary flex-shrink-0" weight="bold" />
              <h3 className="text-lg font-semibold text-foreground">Workflow Update</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-5">
              There's an updated version of this workflow.
              <br />
              Would you like to update it now?
            </p>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" className="px-6" onClick={onIgnore}>
              Ignore
            </Button>
            <Button variant="default" className="px-6" onClick={onUpdate}>
              Update
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
