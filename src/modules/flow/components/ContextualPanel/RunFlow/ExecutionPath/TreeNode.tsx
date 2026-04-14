import React, { useState } from "react";

import { DotIcon, DotOutlineIcon, XIcon, RepeatIcon as LoopIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";

import { TreeItem } from "@/components/ui/tree-view";
import { NodeIconsMapping } from "@/constants";
import { isObjectOrListType } from "@/modules/flow/components/ContextualPanel/shared/treeUtils";
import StatusIcon from "@/modules/flow/components/Node/NodeStatusIcon";
import { useExecutionStore } from "@/store/executionStore";

interface TreeNodeProps {
  item: TreeItem;
  level: number;
  isParentDimmed?: boolean;
}

export const TreeNode = React.memo<TreeNodeProps>(
  ({ item, level, isParentDimmed = false }) => {
    const [isExpanded, setIsExpanded] = useState(true);

    // Get execution status from centralized store (managed by NodeContainer)
    const nodeState = useExecutionStore((state) => state.getNodeState(item.path || ""));
    const nodeExecutionData = useExecutionStore(useShallow((state) => state.getNodeExecutionData(item.path || "")));
    const isExecutionStarted = useExecutionStore((state) => state.isExecutionStarted);

    const hasChildren = item.children && item.children.length > 0;

    const IconComponent = NodeIconsMapping[item.type as keyof typeof NodeIconsMapping];
    const isActualNode = !!IconComponent;

    // Determine if this node should be dimmed
    // A node is dimmed if:
    // 1. Its parent is dimmed, OR
    // 2. Execution has started AND it's an actual node that hasn't received any execution state (still "default")
    const isDimmed = isParentDimmed || (isExecutionStarted && isActualNode && nodeState === "default");

    const showLoopIcon = !isActualNode && hasChildren && isObjectOrListType(item.type);

    const toggleExpanded = () => {
      if (hasChildren) {
        setIsExpanded(!isExpanded);
      }
    };

    return (
      <div className="relative">
        <div
          className={`flex items-center py-1.5 px-2 rounded transition-colors cursor-pointer hover:bg-muted-foreground/10 ${
            isDimmed ? "opacity-50" : ""
          }`}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={toggleExpanded}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isActualNode && (
              <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 bg-accent/30 rounded-sm">
                <IconComponent className="text-muted-foreground w-5 h-5" />
              </div>
            )}

            {!isActualNode &&
              (hasChildren ? (
                <button
                  onClick={toggleExpanded}
                  aria-label={isExpanded ? "Collapse" : "Expand"}
                  aria-expanded={isExpanded}
                  className="flex items-center justify-center"
                >
                  <DotIcon size={16} weight="fill" className="text-muted-foreground flex-shrink-0" />
                </button>
              ) : (
                <DotOutlineIcon size={16} weight="fill" className="text-border flex-shrink-0" />
              ))}

            <div className="min-w-0 flex-shrink overflow-hidden">
              <span className="truncate text-sm font-medium text-muted-foreground block">{item.name}</span>
            </div>

            {/* Status Icon for actual nodes */}
            {isActualNode && (
              <div className="flex-shrink-0 ml-auto">
                {isDimmed ? (
                  <XIcon size={13} className="text-muted-foreground/50" weight="bold" />
                ) : (
                  <StatusIcon
                    state={nodeState}
                    systemRules={nodeExecutionData.systemRuleCount}
                    reliabilityRules={nodeExecutionData.builtInRuleCount}
                    executionTime={nodeExecutionData.executionTime}
                    isGroundTruthConnected={false}
                    showExecutionTime={false}
                  />
                )}
              </div>
            )}

            {!isActualNode && <span className="text-xs text-muted-foreground flex-shrink-0">{item.type}</span>}
            {showLoopIcon && <LoopIcon className="text-muted-foreground/70 flex-shrink-0 w-4 h-4" />}
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="relative">
            <div
              className="absolute border-l"
              style={{
                left: `${level * 16 + 16}px`,
                top: "0px",
                height: "100%",
                zIndex: 1,
              }}
            />
            {item.children!.map((child, index) => (
              <TreeNode key={child.path || `${child.name}-${index}-${level}`} item={child} level={level + 1} isParentDimmed={isDimmed} />
            ))}
          </div>
        )}
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.item.path === next.item.path &&
      prev.level === next.level &&
      prev.item.name === next.item.name &&
      prev.isParentDimmed === next.isParentDimmed
    );
  }
);
