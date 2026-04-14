import { useMemo } from "react";

import { ArrowBendDownRightIcon } from "@phosphor-icons/react";
import { useReactFlow } from "@xyflow/react";

import ConnectionDots from "@/components/common/ConnectionDots";
import { IconSelectTag, SelectTag } from "@/components/common/input-tags";
import { InputTag } from "@/components/ui/input-tag";
import { NODE_ICONS_MAP } from "@/constants";
import { Node } from "@/modules/flow/types";
import { cn } from "@/utils";

interface TargetNodeItemProps {
  nodeId: string;
}

const TargetNodeItem = ({ nodeId }: TargetNodeItemProps) => {
  const { getNode } = useReactFlow<Node>();
  const targetNode = getNode(nodeId);
  const nodeName = targetNode?.data.name || "";
  const nodeTitle = targetNode?.data.title || "";

  const iconDefaultValue = useMemo(() => {
    return { label: nodeName, value: nodeName };
  }, [nodeName]);

  const defaultSelectValue = useMemo(() => {
    return { label: nodeTitle, value: nodeTitle };
  }, [nodeTitle]);

  return (
    <InputTag.Root readonly variant="conditionalRouting">
      <IconSelectTag ICONS={NODE_ICONS_MAP} defaultValue={iconDefaultValue} />
      <SelectTag defaultValue={defaultSelectValue} />
    </InputTag.Root>
  );
};

interface TargetNodeDisplayProps {
  targetNodes: string[];
  showArrow?: boolean;
  className?: string;
}

/**
 * Component to display target node connection information
 */
export const TargetNodesDisplay = ({ targetNodes, showArrow = true, className = "ml-1.5 pb-2" }: TargetNodeDisplayProps) => {
  return (
    <div className={cn(`flex-1 flex items-center gap-2`, className)}>
      {showArrow && <ArrowBendDownRightIcon className="h-4 w-4 text-white " />}
      <div className="flex flex-wrap gap-2">
        {targetNodes?.length ? (
          targetNodes.map((target) => <TargetNodeItem key={target} nodeId={target} />)
        ) : (
          <div className="flex items-center gap-1">
            <ConnectionDots className="h-px w-3 text-muted-foreground/60" />
            <span className="text-sm text-muted-foreground font-medium">Drag to route...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TargetNodesDisplay;
