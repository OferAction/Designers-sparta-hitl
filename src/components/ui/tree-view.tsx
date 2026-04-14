import React, { useState } from "react";

import { ArrowsClockwiseIcon, DotIcon, DotOutlineIcon, RepeatIcon } from "@phosphor-icons/react";

// Import custom SVG icons for nesting levels
import WithTooltip from "../common/WithTooltip";
import { RepeatOnceIcon, RepeatThreeIcon, RepeatTwiceIcon } from "@/lib/icons";

export interface TreeItem {
  name: string;
  type: string;
  sample?: string;
  children?: TreeItem[];
  path?: string;
  isArrayItem?: boolean;
  parentPath?: string;
}

// Helper function to check if a type represents an array/list
const isArrayOrListType = (type?: string): boolean => {
  if (!type) return false;
  const lowerType = type.toLowerCase();
  return lowerType.includes("array") || lowerType.includes("list") || lowerType === "[]";
};

// Helper function to check if item has nested array/list children
const hasNestedArrayChildren = (item: TreeItem): boolean => {
  if (!item.children) return false;
  return item.children.some((child) => isArrayOrListType(child.type));
};

// Helper function to highlight matching text
const highlightText = (text: string, searchValue: string) => {
  if (!searchValue) return text;

  const regex = new RegExp(`(${searchValue})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.toLowerCase() === searchValue.toLowerCase()) {
      return (
        <span key={index} className="text-purple-accent">
          {part}
        </span>
      );
    }
    return part;
  });
};

// Component to render the appropriate nesting indicator icon
const NestingIndicator: React.FC<{ item: TreeItem; parentLevel: number }> = ({ item, parentLevel }) => {
  const isArrayOrList = isArrayOrListType(item.type);

  // If it's an item inside a list (not an array/list itself), show ArrowsClockwise
  if (item.isArrayItem && !isArrayOrList) {
    return <ArrowsClockwiseIcon className="text-muted-foreground/50 flex-shrink-0 size-3" />;
  }

  // If not an array/list type, don't show any indicator
  if (!isArrayOrList) return null;

  // For array/list items at level 0 (root level), only show icon if they have nested arrays
  if (parentLevel === 0) {
    // Root level array with no nested arrays: show regular Repeat
    return <RepeatIcon className="text-muted-foreground/50 flex-shrink-0 size-4" />;
  }

  // For nested arrays (level >= 1), show level-specific icons
  if (parentLevel === 1) {
    const hasNested = hasNestedArrayChildren(item);
    if (!hasNested) {
      return <RepeatIcon className="text-muted-foreground/50 flex-shrink-0 size-4" />;
    }
    return <RepeatOnceIcon className="flex-shrink-0 size-4.5 text-muted-foreground" />;
  } else if (parentLevel === 2) {
    return <RepeatTwiceIcon className="flex-shrink-0 size-4.5 text-muted-foreground" />;
  } else if (parentLevel >= 3) {
    return <RepeatThreeIcon className="flex-shrink-0 size-4.5 text-muted-foreground" />;
  }

  return null;
};

interface TreeNodeProps {
  item: TreeItem;
  level: number;
  parentLevel?: number; // Track nesting level of array/list parents
  onSelect?: (item: TreeItem) => void;
  searchValue?: string;
  draggable?: boolean;
  showSample?: boolean;
  className?: string;
  allowParentSelect?: boolean;
  disableParentToggle?: boolean;
  showParentDisabledStyle?: boolean; // only apply disabled styling when explicitly requested (e.g. dropdown)
}

const TreeNode: React.FC<TreeNodeProps> = ({
  item,
  level,
  parentLevel = 0,
  onSelect,
  searchValue = "",
  draggable = false,
  showSample = false,
  className = "",
  allowParentSelect = false,
  disableParentToggle = false,
  showParentDisabledStyle = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const parentDisabled = showParentDisabledStyle && hasChildren && item.type === "object" && !allowParentSelect;

  // Filter logic for search
  const matchesSearch =
    searchValue === "" || item.name.toLowerCase().includes(searchValue.toLowerCase()) || item.type.toLowerCase().includes(searchValue.toLowerCase());

  const hasMatchingChildren =
    hasChildren &&
    item.children!.some(
      (child) =>
        child.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        child.type.toLowerCase().includes(searchValue.toLowerCase()) ||
        (child.children && child.children.length > 0)
    );

  if (!matchesSearch && !hasMatchingChildren) {
    return null;
  }

  const toggleExpanded = () => {
    if (hasChildren && !disableParentToggle) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = () => {
    if (!hasChildren && onSelect) {
      onSelect(item);
    } else if (hasChildren && allowParentSelect && onSelect) {
      // allow selecting parent nodes when enabled
      onSelect(item);
    } else if (hasChildren && item.type !== "object" && onSelect) {
      // allow selecting non-object parent nodes (e.g., arrays, lists)
      onSelect(item);
    } else {
      toggleExpanded();
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    // Remove the hasChildren check to allow parent dragging
    if (!draggable) return;

    setIsDragging(true);

    // Create custom drag image
    const dragElement = document.createElement("div");
    dragElement.className = "bg-background border-2 border-muted-foreground rounded px-2 py-1.5 text-sm shadow-lg";
    dragElement.style.position = "absolute";
    dragElement.style.top = "-1000px";
    dragElement.textContent = item.name;

    document.body.appendChild(dragElement);
    e.dataTransfer.setDragImage(dragElement, 0, 0);

    // Clean up after drag starts
    setTimeout(() => {
      document.body.removeChild(dragElement);
    }, 0);

    // Set drag data with parent information
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        name: item.name,
        type: item.type,
        sample: item.sample,
        path: item.path,
        isArrayItem: item.isArrayItem,
        parentPath: item.parentPath,
        isParent: hasChildren, // Add flag to indicate if this is a parent node
      })
    );
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative">
      <div
        draggable={draggable}
        className={`flex items-center py-1.5 px-2 rounded transition-colors ${
          isDragging
            ? "opacity-50 bg-primary/10 border-2 border-dashed border-primary"
            : parentDisabled
              ? "cursor-default opacity-60"
              : "cursor-pointer hover:bg-muted-foreground/10"
        } ${className}`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={handleSelect}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        aria-disabled={parentDisabled || undefined}
        title={parentDisabled ? "Parent item (not selectable)" : undefined}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
          {hasChildren ? (
            <button onClick={toggleExpanded} className="flex items-center justify-center flex-shrink-0">
              <DotIcon size={16} weight="fill" className="text-muted-foreground flex-shrink-0" />
            </button>
          ) : (
            <DotOutlineIcon size={16} weight="fill" className="text-border flex-shrink-0" />
          )}
          {item.name.length > 25 ? (
            <WithTooltip tooltip={item.name} delayDuration={0} side="top" align="start">
              <span
                className={`text-sm font-medium truncate max-w-[13rem] ${
                  isDragging ? "text-primary" : parentDisabled ? "text-muted-foreground" : "text-foreground"
                } ${parentDisabled ? "select-none" : ""}`}
              >
                {highlightText(item.name, searchValue)}
              </span>
            </WithTooltip>
          ) : (
            <span
              className={`text-sm font-medium truncate max-w-[13rem] ${
                isDragging ? "text-primary" : parentDisabled ? "text-muted-foreground" : "text-foreground"
              } ${parentDisabled ? "select-none" : ""}`}
            >
              {highlightText(item.name, searchValue)}
            </span>
          )}
          <span className="text-xs text-muted-foreground flex-shrink-0 truncate max-w-[100px]">{highlightText(item.type, searchValue)}</span>
          <NestingIndicator item={item} parentLevel={parentLevel} />
          {showSample &&
            item.sample &&
            (() => {
              const sampleStr = typeof item.sample === "object" ? JSON.stringify(item.sample) : String(item.sample);
              const displayStr = sampleStr === "empty" ? "" : sampleStr;
              if (!displayStr) return null;
              const truncated = displayStr.length > 20 ? `${displayStr.slice(0, 20)}...` : displayStr;
              return (
                <WithTooltip
                  tooltip={highlightText(displayStr, searchValue)}
                  delayDuration={0}
                  side="top"
                  align="start"
                  contentClassName="max-w-[50rem]"
                >
                  <span className="text-xs text-muted-foreground truncate ml-auto max-w-[8rem]">{highlightText(truncated, searchValue)}</span>
                </WithTooltip>
              );
            })()}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="relative">
          {/* Vertical line for expanded folders */}
          <div
            className="absolute border-l "
            style={{
              left: `${level * 16 + 16}px`,
              top: "0px",
              height: "100%",
              zIndex: 1,
            }}
          />
          {item.children!.map((child, index) => {
            // Calculate the next parent level
            // If current item is an array/list, children inherit current level + 1
            // If current item is NOT an array/list, children inherit the same level
            const nextParentLevel = isArrayOrListType(item.type) ? parentLevel + 1 : parentLevel;

            return (
              <TreeNode
                key={`${child.name}-${index}-${level}`}
                item={child}
                level={level + 1}
                parentLevel={nextParentLevel}
                onSelect={onSelect}
                searchValue={searchValue}
                draggable={draggable}
                showSample={showSample}
                className={className}
                allowParentSelect={allowParentSelect}
                disableParentToggle={disableParentToggle}
                showParentDisabledStyle={showParentDisabledStyle}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

interface TreeViewProps {
  data: TreeItem[];
  onItemSelect?: (item: TreeItem) => void;
  searchValue?: string;
  draggable?: boolean;
  showSample?: boolean;
  className?: string;
  allowParentSelect?: boolean;
  disableParentToggle?: boolean;
  showParentDisabledStyle?: boolean; // propagate to nodes (used only in dropdown context)
}

export const TreeView: React.FC<TreeViewProps> = ({
  data,
  onItemSelect,
  searchValue = "",
  draggable = false,
  showSample = false,
  className = "",
  allowParentSelect = false,
  disableParentToggle = false,
  showParentDisabledStyle = false,
}) => {
  return (
    <div className={`space-y-0 ${className}`}>
      {data.map((item, index) => {
        // Root level arrays/lists start at level 1
        const initialParentLevel = isArrayOrListType(item.type) ? 1 : 0;

        return (
          <TreeNode
            key={`${item.name}-${index}`}
            item={item}
            level={0}
            parentLevel={initialParentLevel}
            onSelect={onItemSelect}
            searchValue={searchValue}
            draggable={draggable}
            showSample={showSample}
            allowParentSelect={allowParentSelect}
            disableParentToggle={disableParentToggle}
            showParentDisabledStyle={showParentDisabledStyle}
          />
        );
      })}
    </div>
  );
};

export default TreeView;
