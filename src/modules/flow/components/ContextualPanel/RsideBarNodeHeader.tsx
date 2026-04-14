import { ArrowSquareOutIcon, DotsThreeIcon, PlayCircleIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";

import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import DescriptionDialog from "./DescriptionDialog";
import { NodeLabelField } from "./NodeLabelField";
import { useRunHandlers } from "../../hooks";
import { PanelDialogWrapper } from "../dialog/PanelDialogWrapper";
import WithTooltip from "@/components/common/WithTooltip";
import { Button } from "@/components/ui/button";
import { SidebarHeader } from "@/components/ui/sidebar";
import { NODE_CATEGORY_COLOR, NodeIconsMapping } from "@/constants";
import { usePanelDialogContext } from "@/modules/flow/components/dialog";
import { NodeVariant } from "@/modules/flow/types";
import { useGetFileQuery } from "@/services";
import { useFlowStore } from "@/store";
import { useCheckCanvasPermission } from "@/store/slices";

const RsideBarSubflowButton = () => {
  const selectedNode = useSelectedNode<NodeVariant<"subflow">>();
  const { data, isLoading } = useGetFileQuery(selectedNode?.data?.subflowId || "");

  if (selectedNode?.type !== "subflow") return null;
  if (isLoading) return <div>Loading...</div>;
  return (
    <a
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!selectedNode?.data?.subflowConfigId) {
          window.open(`/canvas/${data?.projectId}/${data?.id}/subflow`, "_blank");
          return;
        }
        window.open(`/canvas/${data?.projectId}/${data?.id}/${selectedNode?.data.subflowConfigId}/subflow`, "_blank");
      }}
      className="text-sm leading-5 font-semibold text-sidebar-foreground flex hover:underline cursor-pointer"
    >
      ({data?.name}
      <ArrowSquareOutIcon className="size-5 p-0.5" />)
    </a>
  );
};

const RsideBarNodeNodeType = () => {
  const selectedNode = useSelectedNode();

  if (!selectedNode) return null;
  const { name } = selectedNode?.data || {};
  if (["start", "end"].includes(name)) {
    return null;
  }
  const Icon = name ? NodeIconsMapping[name] : null;
  const colorVar = NODE_CATEGORY_COLOR[name] || "var(--foreground)";

  return (
    <div className="flex gap-3">
      <WithTooltip followCursor={true} tooltip={selectedNode.data.description} side="right" disableTooltip={!selectedNode.data.description}>
        <div className="flex gap-1 items-center w-fit mx-2">
          {Icon && (
            <Icon
              className="size-6 duration-[800ms] ease-in-out flex-shrink-0"
              style={{
                color: `hsl(${colorVar})`,
              }}
            />
          )}
          <span className="text-sm leading-5 font-semibold text-sidebar-foreground">{selectedNode.data.title}</span>
        </div>
      </WithTooltip>
      <RsideBarSubflowButton />
    </div>
  );
};

export default function RsideBarNodeHeader() {
  const { openDialog } = usePanelDialogContext();
  const { handleRunSingleNode } = useRunHandlers();
  const checkCanvasPermission = useCheckCanvasPermission();

  const mode = useFlowStore((state) => state.mode);

  const selectedNode = useSelectedNode();

  const handleDialogOpen = () => {
    openDialog(
      <PanelDialogWrapper>
        <DescriptionDialog />
      </PanelDialogWrapper>
    );
  };

  const handleRunSingleNodeClick = () => {
    const selectedNodeId = selectedNode?.id;
    handleRunSingleNode(selectedNodeId);
  };

  return (
    <SidebarHeader className="py-2 border-b border-sidebar-border">
      <div className="pt-2.5">
        <div className="flex items-center justify-between min-w-0 mb-0.5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <NodeLabelField />
          </div>
          <div className="flex gap-2 items-center flex-shrink-0">
            {mode === "build" && (
              <Button className="size-7 p-1.5" variant="ghost" size="icon" onClick={handleDialogOpen}>
                {<SlidersHorizontalIcon className="cursor-pointer" />}
              </Button>
            )}

            {mode === "run" && selectedNode?.data.name !== "iterator" && checkCanvasPermission("canRunFlow") && (
              <Button className="size-7 p-1.5" variant="ghost" size="icon" onClick={handleRunSingleNodeClick}>
                <PlayCircleIcon className="cursor-pointer" />
              </Button>
            )}
            <Button className="size-7 p-1.5" variant="ghost" size="icon">
              <DotsThreeIcon className="cursor-pointer" />
            </Button>
          </div>
        </div>
        <RsideBarNodeNodeType />
      </div>
    </SidebarHeader>
  );
}
