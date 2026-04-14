import { useMemo } from "react";

import { NodeResizeControl as XYFlowNodeResizeControl } from "@xyflow/react";

import { useUpdateNodeInternalsAsync } from "../../hooks";
import { mitt } from "@/lib/mitt";
import { useFlowStore } from "@/store";

import { MIN_NODE_HEIGHT, MIN_NODE_WIDTH } from "@/modules/flow/constants/nodeDimensions";

interface NodeResizeControlProps {
  className?: string;
  id: string;
  minHeight?: number;
  minWidth?: number;
  parentId?: string;
}

const ResizeHandle = () => (
  <div className="absolute bottom-4 right-4 w-6 h-6 transition-opacity duration-200 pointer-events-none">
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="fill-foreground text-foreground hover:opacity-55">
      <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="16" y1="20" x2="20" y2="16" />
        {/* <line x1="12" y1="20" x2="20" y2="12" /> */}
        <line x1="8" y1="20" x2="20" y2="8" />
      </g>
    </svg>
  </div>
);

export const NodeResizeControl = ({ id, className, minHeight = MIN_NODE_HEIGHT, minWidth = MIN_NODE_WIDTH }: NodeResizeControlProps) => {
  const updateNodeInternals = useUpdateNodeInternalsAsync();
  const extent = useFlowStore((state) => state.nodes.find((node) => node.id === id)?.extent);

  const maxWidth = Array.isArray(extent) ? extent[1][0] - extent[0][0] : Infinity; // default max width if extent is not set
  const maxHeight = Array.isArray(extent) ? extent[1][1] - extent[0][1] : Infinity; // default max height if extent is not set

  const debouncedOnResize = useMemo(() => {
    updateNodeInternals(id);
    return async () => {
      await updateNodeInternals(id);
      mitt.emit("flow:node:update-extent", id);
    };
  }, [id, updateNodeInternals]);

  return (
    <XYFlowNodeResizeControl
      style={{
        background: "transparent",
        border: "none",
        cursor: "se-resize",
        bottom: "0",
        right: "0",
        width: "24px",
        height: "24px",
        position: "absolute",
      }}
      className={className}
      minHeight={minHeight}
      minWidth={minWidth}
      maxHeight={maxHeight}
      maxWidth={maxWidth}
      onResize={debouncedOnResize}
    >
      <ResizeHandle />
    </XYFlowNodeResizeControl>
  );
};

export default NodeResizeControl;
