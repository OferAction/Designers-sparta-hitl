import React, { useState } from "react";

import { DotIcon, DotOutlineIcon, RepeatIcon as LoopIcon } from "@phosphor-icons/react";

import { VALUE_TYPE_ITEMS } from "@/components/ui/input-tag/old-deprecated/InputTag/constants";
import { TreeItem } from "@/components/ui/tree-view";
import { NodeIconsMapping } from "@/constants";
import { isObjectOrListType } from "@/modules/flow/components/ContextualPanel/shared/treeUtils";

interface TreeNodeProps {
  item: TreeItem;
  level: number;
}

export const TreeNode = React.memo<TreeNodeProps>(
  ({ item, level }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = item.children && item.children.length > 0;

    const IconComponent = NodeIconsMapping[item.type as keyof typeof NodeIconsMapping];
    const isActualNode = !!IconComponent;
    const showLoopIcon = !isActualNode && hasChildren && isObjectOrListType(item.type);

    const toggleExpanded = () => {
      if (hasChildren) {
        setIsExpanded(!isExpanded);
      }
    };

    return (
      <div className="relative">
        <div
          className="flex items-center py-1.5 px-2 rounded transition-colors cursor-pointer hover:bg-muted-foreground/10"
          style={{ paddingLeft: `${level * 16 + 8}px` }}
          onClick={toggleExpanded}
        >
          <div className="flex items-center gap-2 flex-1">
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

            <span className="text-sm font-medium flex-shrink-0 text-muted-foreground">{item.name}</span>
            {!isActualNode && (
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {VALUE_TYPE_ITEMS.find((type) => type.value === item.type)?.label || item.type}
              </span>
            )}
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
              <TreeNode key={child.path || `${child.name}-${index}-${level}`} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  },
  (prev, next) => {
    return prev.item.path === next.item.path && prev.level === next.level && prev.item.name === next.item.name;
  }
);
