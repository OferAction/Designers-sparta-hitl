import { SubflowIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { useFileActions } from "@/modules/workspace/hooks";

export function TemplateActionButton() {
  const { addUntitledSubflow, createSubflowPending } = useFileActions();

  return (
    <Button loading={createSubflowPending} variant="purple" className="text-sidebar-accent-foreground" onClick={() => addUntitledSubflow()}>
      <SubflowIcon className="size-4" />
      New subflow
    </Button>
  );
}
