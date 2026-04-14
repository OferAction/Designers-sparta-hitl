import { NodeIconsMapping } from "@/constants";

const NodeBadge = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center justify-between gap-1 bg-background border rounded-lg border-muted px-1 py-0.5 w-[64px]">{children}</div>;
};

export const FlowPath = () => {
  return (
    <div className="flex items-center mb-1">
      <NodeBadge>
        <NodeIconsMapping.start className="text-sidebar-foreground/70 h-5 w-5" />
        <span className="text-sm text-sidebar-foreground/70 font-inter">Start</span>
      </NodeBadge>
      <div className="h-[1px] w-[16px] border-dashed border border-focus" />
      <NodeBadge>
        <NodeIconsMapping.end className="text-sidebar-foreground/70 h-5 w-5" />
        <span className="text-sm text-sidebar-foreground/70 font-inter">End</span>
      </NodeBadge>
    </div>
  );
};

export default FlowPath;
