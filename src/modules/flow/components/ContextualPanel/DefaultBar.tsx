import { DotsThreeIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";

import { useSubflowContext } from "../../contexts/SubflowContext";
import { Button } from "@/components/ui/button";
import { SidebarHeader } from "@/components/ui/sidebar";
import { NodeLabelField } from "@/modules/flow/components/ContextualPanel/NodeLabelField";

export function DefaultBar() {
  const isSubflow = useSubflowContext();

  return (
    <SidebarHeader className="pb-0">
      <div className="pt-2.5">
        <div className="flex items-center justify-between min-w-0 mb-0.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <NodeLabelField />
          </div>
          <div className="flex gap-2 items-center flex-shrink-0">
            {!isSubflow && (
              <Button
                className="size-7 p-1.5"
                variant="ghost"
                size="icon"
              >
                <SlidersHorizontalIcon className="cursor-pointer" />
              </Button>
            )}
            <Button className="size-7 p-1.5" variant="ghost" size="icon">
              <DotsThreeIcon className="cursor-pointer" />
            </Button>
          </div>
        </div>
      </div>
    </SidebarHeader>
  );
}
