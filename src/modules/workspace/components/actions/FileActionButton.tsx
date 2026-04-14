import { FlowArrowIcon } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { useFileActions } from "@/modules/workspace/hooks";

export function FileActionButton() {
  const { addUntitledFile, createFilePending } = useFileActions();

  return (
    <Button loading={createFilePending} variant="purple" className="text-sidebar-accent-foreground" onClick={addUntitledFile}>
      <FlowArrowIcon className="size-4" />
      New workflow
    </Button>
  );
}
