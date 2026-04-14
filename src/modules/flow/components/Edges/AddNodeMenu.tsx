import { useCallback } from "react";

import { PlusIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";

import { useAddNodeFromDropdown } from "../../hooks/useAddNodeFromDropDown";
import { BaseNode } from "../../types";
import AddConnectorSubmenuContent, { ConnectorItem } from "../ContextMenus/AddConnectorSubmenuContent";
import { AddNodeSubmenuContent } from "../ContextMenus/AddNodeSubmenuContent";
import { AddSubflowSubmenuContent } from "../ContextMenus/AddSubflowSubmenuContent";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { File } from "@/modules/workspace";
import { FlowStoreState, useFlowStore } from "@/store";
import { checkCanvasPermission, useCheckCanvasPermission } from "@/store/slices";
import { cn } from "@/utils";

const selector = (state: FlowStoreState) => ({
  mode: state.mode,
});

function AddNodeMenu({
  labelX,
  labelY,
  targetId,
  sourceId,
  targetHandleId,
  sourceHandleId,
  edgeId,
  forceVisible,
}: {
  labelX: number;
  labelY: number;
  targetId: string;
  sourceId: string;
  targetHandleId: string | null | undefined;
  sourceHandleId: string | null | undefined;
  edgeId: string;
  forceVisible?: boolean;
}) {
  const { handleAddNode, handleAddSubflow } = useAddNodeFromDropdown({
    sourceHandleId,
    sourceParentId: sourceId,
    targetHandleId,
    targetParentId: targetId,
    edgeId,
  });
  const checkCanvasPermission = useCheckCanvasPermission();
  const canCreateElements = checkCanvasPermission("canCreateElements");
  const { mode } = useFlowStore(useShallow(selector));

  const handleAddNodeByTemplate = useCallback(
    (data: BaseNode["data"]) => {
      handleAddNode(data.name);
    },
    [handleAddNode]
  );
  const handleAddSubflowByTemplate = useCallback(
    (subflow: File & { flowName: string }) => {
      handleAddSubflow(subflow);
    },
    [handleAddSubflow]
  );
  const handleAddConnector = useCallback(
    (connector: ConnectorItem) => {
      handleAddNode(connector.name);
    },
    [handleAddNode]
  );

  return (
    // Using ForeignObject to render the dropdown menu is a work around for the issue of SVG not supporting HTML elements directly.
    // using specific width and height to avoid overflow and z-index SVG related limitations
    // Avoid using EdgeLabelRenderer as it has limitations in passing hover state; different grandparents as edges.
    <foreignObject
      x={labelX - 25}
      y={labelY - 11}
      width={50}
      height={22}
      data-thumbnail="hidden"
      className={cn(
        "cursor-pointer overflow-visible invisible group-hover/edge:visible group-has-[[data-state=open]]/edge:visible",
        forceVisible && canCreateElements && "!visible",
        !canCreateElements && "!hidden"
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="w-full h-full flex justify-center items-center group/addnodetrigger">
          <div className={cn("flex justify-center items-center")}>
            <Button
              variant="outline"
              className={cn(
                "p-[2px] min-w-4 min-h-4 h-[22px] w-[22px] rounded-md",
                "ring-0 ring-offset-0 ring-offset-background ring-primary group-has-[[data-state=open]]/edge:ring-offset-2 group-has-[[data-state=open]]/edge:ring-2"
              )}
            >
              <PlusIcon size={16} />
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="start">
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="data-[disabled]:pointer-events-none data-[disabled]:opacity-50" disabled={mode === "run"}>
                Add Node
              </DropdownMenuSubTrigger>
              <AddNodeSubmenuContent isDropdownMenu={true} onAdd={handleAddNodeByTemplate} />
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="data-[disabled]:pointer-events-none data-[disabled]:opacity-50" disabled={mode === "run"}>
                Add Subflow
              </DropdownMenuSubTrigger>
              <AddSubflowSubmenuContent isDropdownMenu={true} onAdd={handleAddSubflowByTemplate} />
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="data-[disabled]:pointer-events-none data-[disabled]:opacity-50" disabled={mode === "run"}>
                Add Connector
              </DropdownMenuSubTrigger>
              <AddConnectorSubmenuContent isDropdownMenu={true} onAdd={handleAddConnector} />
            </DropdownMenuSub>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </foreignObject>
  );
}

const WithPermission = <P extends object>(Component: React.FC<P>) => {
  const WrappedComponent = (props: P) => {
    const canCreateElements = checkCanvasPermission("canCreateElements");
    return canCreateElements ? <Component {...props} /> : null;
  };
  return WrappedComponent;
};

export default WithPermission(AddNodeMenu);
