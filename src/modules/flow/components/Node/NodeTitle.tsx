import { PlaceholderIcon } from "@phosphor-icons/react";

import { mainIconCardVariants } from "../GeneralNodes/CustomNodeVariants";
import { GroundTruthIcon, TerminateIcon, WirelessIcon as WirlessIcon } from "@/lib/icons";
import { NODE_CATEGORY_BG_COLOR, NODE_CATEGORY_ICON_COLOR, NodeIconsMapping } from "@/constants";
import { cn } from "@/lib/utils";
import { NodeTypes } from "@/modules/flow/types";

interface TitleProps {
  title?: string;
  className?: string;
  containerClasses?: string;
  mainIcon?: NodeTypes | "";
  nodeType?: "start" | "end" | "subflow";
}

const RenderIcons: React.FC = () => {
  return (
    <>
      <GroundTruthIcon width={16} height={16} className="group-data-[ground-truth-connected=true]:inline hidden text-blue-accent" />
      <WirlessIcon width={16} height={16} className="group-data-[ground-truth-connected=true]:inline hidden text-foreground" />
      <TerminateIcon width={16} height={16} className="hidden group-data-[pruned=true]:inline text-muted-foreground opacity-80 h-[9px] w-[9px] " />
      <PlaceholderIcon
        size={16}
        weight="fill"
        className="hidden group-data-[after-execution=terminate]:inline text-muted-foreground opacity-80"
        aria-label="execution-action-icon"
      />
    </>
  );
};

interface NodeIconRendererProps {
  iconKey: NodeTypes | "";
  className?: string;
  nodeType?: "start" | "end" | "subflow";
  nodeState?: "default" | "success" | "error" | "reliabilityRule" | "systemRule" | "running" | "pruned" | undefined | null;
}

const NodeIconRenderer: React.FC<NodeIconRendererProps> = ({ iconKey, nodeType }) => {
  if (!iconKey) {
    return null;
  }

  const bgColor = NODE_CATEGORY_BG_COLOR[iconKey];
  const iconColor = NODE_CATEGORY_ICON_COLOR[iconKey];
  const IconComponent = NodeIconsMapping[iconKey];

  if (!IconComponent) {
    return null;
  }

  return (
    <div
      style={{
        background: `hsl(${bgColor})`,
      }}
      className={cn(mainIconCardVariants({ type: nodeType || "default" }))}
    >
      <IconComponent
        className="flex-shrink-0"
        style={{
          color: `hsl(${iconColor})`,
        }}
      />
    </div>
  );
};

export default function NodeTitle({ title = "Untitled", className, mainIcon = "", containerClasses = "", nodeType }: TitleProps) {
  return (
    <div
      className={cn(
        "relative flex items-center gap-2 group truncate overflow-hidden pr-2 max-w-[280px]",
        nodeType === "end" && "!pr-0 pl-2",
        containerClasses
      )}
    >
      <NodeIconRenderer iconKey={mainIcon} nodeType={nodeType} />
      <span className={cn("text-foreground font-semibold text-sm font-inter leading-5 truncate min-w-0 whitespace-nowrap", className)}>{title}</span>
      <RenderIcons />
      {/* <div className="relative flex ml-3 group-data-[has-terminal=false]:hidden group-hover:group-data-[has-terminal=true]:visible invisible">
        <Button className="flex items-center justify-center px-0.5 py-0.5" variant="ghost">
          <ArrowsOutIcon size={16} weight="regular" />
        </Button>
      </div> */}
    </div>
  );
}
