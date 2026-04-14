import { useState } from "react";

import { GearIcon, QuestionIcon } from "@phosphor-icons/react";

import { SystemRulesHandlingDialog } from "./SystemRulesHandlingDialog";
import WithTooltip from "@/components/common/WithTooltip";

export type SystemRuleAction = "terminate" | "route" | "continue" | "retry";

export default function SystemRulesItem() {
  const [open, setOpen] = useState(false);

  return (
    <div className="group/system px-0 transition-colors">
      <div
        className="flex items-center w-full"
        onClick={() => {
          setOpen(true);
        }}
      >
        <div className="flex-1 min-w-0 rounded-md bg-sidebar border border-transparent hover:border hover:border-input hover:bg-accent p-1 pl-2 flex items-center gap-2">
          <GearIcon className="size-4 text-muted-foreground group-hover/system:text-foreground" />
          <p className="text-sm mt-[1px] text-muted-foreground truncate max-w-[180px] group-hover/system:text-foreground ">All system rules</p>
          <WithTooltip tooltip="System rules are special rules that get triggered on system exceptions. Click to configure.">
            <QuestionIcon className="size-4 text-muted-foreground" />
          </WithTooltip>
        </div>
      </div>
      <SystemRulesHandlingDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
