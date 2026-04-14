import { getDefaultExceptionMessage, SYSTEM_EXCEPTION_VARIABLES } from "./constants";
import OutlookDetails from "@/modules/flow/components/ContextualPanel/connectors/OutlookDetails";
import type { ConnectorNode, Node } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

type AddNodeFn = (type: ConnectorNode, position: { x: number; y: number }, rest?: object) => string;
type OnChangeFn = (id: string, path: string, value: any) => void;

export function selectOutlookConnector(params: {
  addNode: AddNodeFn;
  onChange: OnChangeFn;
  setSelectedNodeId?: (id: string) => void;
  handleRouteSelect: (id: string) => void;
  selectInPanel?: boolean;
  orchestrationName?: string;
  onNodeCreated?: (id: string) => void;
}) {
  const {
    addNode,
    onChange,
    setSelectedNodeId,
    handleRouteSelect,
    selectInPanel = false,
    orchestrationName = "orchestration",
    onNodeCreated,
  } = params;

  const subjectString = `Exception in "${orchestrationName}" Workflow`;
  const templateString = getDefaultExceptionMessage(orchestrationName);

  const id = addNode(
    "outlook",
    { x: -10000, y: -10000 },
    {
      draggable: false,
      selectable: false,
      hidden: true,
      data: {
        label: "outlook",
        name: "outlook",
      },
    }
  );

  const createdNode = useFlowStore.getState().nodes.find((n) => n.id === id);

  if (createdNode && Array.isArray(createdNode.data.inputs)) {
    const updatedInputs = createdNode.data.inputs.map((input) => {
      if (input.key === "body") {
        return {
          ...input,
          value: {
            ...input.value,
            value: templateString,
          },
        };
      }
      if (input.key === "subject") {
        return {
          ...input,
          value: {
            ...input.value,
            value: subjectString,
          },
        };
      }
      return input;
    });

    onChange(id, "inputs", updatedInputs);
  }

  if (selectInPanel && setSelectedNodeId) setSelectedNodeId(id);

  if (onNodeCreated) {
    onNodeCreated(id);
  } else {
    handleRouteSelect(id);
  }
}

export function shouldRenderOutlookConfiguration(routeDestination: string, node?: Node) {
  if (!routeDestination) return false;
  return !!node && node.data?.name === "outlook";
}

export function OutlookConfiguration({ nodeId }: { nodeId: string }) {
  return (
    <div className="mt-6 bg-background" style={{ "--sidebar-background": "hsl(var(--background))" } as React.CSSProperties}>
      <div className="text-sm mb-2.5">Configuration</div>
      <OutlookDetails nodeId={nodeId} systemVariables={SYSTEM_EXCEPTION_VARIABLES} isExceptionConnector />
    </div>
  );
}
