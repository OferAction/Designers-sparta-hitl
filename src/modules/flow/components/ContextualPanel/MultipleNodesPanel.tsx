import { SelectionForegroundIcon } from "@phosphor-icons/react";
import { produce } from "immer";
import { useShallow } from "zustand/shallow";

import { useToast } from "@/hooks/use-toast";

import { useConnectionValidity } from "@/modules/flow/utils/useConnectionValidity";

import { SubflowIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { NonNullableOption } from "@/components/ui/input-tag";
import { NodeIconsMapping } from "@/constants";
import { mitt } from "@/lib/mitt";
import { getRequiredInputs, transformInputsToNewNodeOutputs } from "@/modules/flow/components/ContextualPanel/RunDialog/utils";
import { initialConfig } from "@/modules/flow/constants";
import { useGetChildNodes, useSelectedNodes, useUpdateNodeInternalsAsync, useCreateSubflowDisabled } from "@/modules/flow/hooks";
import { Node, Edge, NodeVariant, ConditionType } from "@/modules/flow/types";
import { useFileActions } from "@/modules/workspace";
import { FlowStoreState, useFlowStore } from "@/store";
import { checkCanvasPermission } from "@/store/slices";
import { genId } from "@/utils";

interface SelectedNodeItemProps {
  node: Pick<Node, "id" | "type" | "data">;
  index: number;
  disabledReason?: string;
}
const normalizeNodeId = (nodeId: string): string[] => {
  return nodeId.split(".");
};

const SelectedNodeItem = ({ node, index, disabledReason }: SelectedNodeItemProps) => {
  const IconComponent = NodeIconsMapping[node.data.name! as keyof typeof NodeIconsMapping] || NodeIconsMapping.start;
  return (
    <div key={`${node.id}-${index}`} className="flex items-center gap-4">
      <IconComponent size={16} className="text-foreground w-4 h-4" />
      <span className="text-sm text-muted-foreground capitalize flex items-center gap-1">{node.data.name}</span>
      {disabledReason && <span className="text-sm text-muted-foreground">({disabledReason})</span>}
    </div>
  );
};

const selector = (state: FlowStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  onConnect: state.onConnect,
});

const createDefaultNodeData = (nodeType: "start" | "end"): any => ({
  title: nodeType === "start" ? "Start" : "End",
  name: nodeType,
  type: nodeType,
  subtitle: `${nodeType === "start" ? "Start" : "End"} node`,
  description: `${nodeType === "start" ? "Start" : "End"} of the orchestration`,
  label: nodeType === "start" ? "Start" : "End",
  after_node_execution: "continue",
  inputs: [],
  outputs: [],
});

const getConnectedEdges = (edges: Edge[], selectedNodeIds: Set<string>): Edge[] => {
  return edges.filter((edge) => selectedNodeIds.has(edge.source) && selectedNodeIds.has(edge.target));
};

const createSubflowNode = (
  nodeId: string,
  position: { x: number; y: number },
  subflowConfigId: string,
  subflowId: string,
  subflowNodeData: Partial<NodeVariant<"subflow">["data"]>
): Node => ({
  id: nodeId,
  type: "subflow",
  data: {
    type: "subflow",
    name: "subflow",
    title: "Subflow",
    subtitle: "Reusable subflow",
    description: "",
    label: "Untitled Subflow",
    subflowConfigId: subflowConfigId,
    subflowId: subflowId,
    after_node_execution: "continue",
    inputs: [],
    outputs: [],
    ...subflowNodeData,
  },
  position,
  selected: false,
  zIndex: 2,
  measured: {
    width: 120,
    height: 56,
  },
});

const calculateAveragePosition = (selectedNodes: Pick<Node, "id" | "type" | "data">[], allNodes: Node[]) => {
  const selectedNodeIds = new Set(selectedNodes.map((node) => node.id));
  const selectedNodesWithPositions = allNodes.filter((node) => selectedNodeIds.has(node.id));

  const totalPosition = selectedNodesWithPositions.reduce(
    (acc, node) => ({
      x: acc.x + node.position.x,
      y: acc.y + node.position.y,
    }),
    { x: 0, y: 0 }
  );

  return {
    x: totalPosition.x / selectedNodesWithPositions.length,
    y: totalPosition.y / selectedNodesWithPositions.length,
  };
};

export const MultipleNodesPanel = () => {
  const selectedNodes = useSelectedNodes();
  const { addSelectedSubflow, createSubflowPending } = useFileActions();
  const { nodes, edges, setNodes, setEdges, onConnect } = useFlowStore(useShallow(selector));
  const canCreateElements = checkCanvasPermission("canCreateElements");
  const { isValidConnection } = useConnectionValidity();
  const updateNodeInternalsAsync = useUpdateNodeInternalsAsync();
  const { toast } = useToast();
  const getChildNodes = useGetChildNodes();

  const getExtendedSelectedNodeIds = (selectedNodeIds: Set<string>) => {
    const extendedSelectedNodeIds = new Set(
      Array.from(selectedNodeIds).concat(Array.from(selectedNodeIds).flatMap((nodeId) => getChildNodes(nodeId)))
    );
    return extendedSelectedNodeIds;
  };

  const mappingNewConfig = (selectedNodeIds: Set<string>, originalSelectedNodeIds: Set<string>) => {
    if (selectedNodes.length === 0) return [];

    // Get edges between (possibly) extended selected nodes
    const connectedEdges = getConnectedEdges(edges, selectedNodeIds);

    // Determine full node objects for extended set (ensure positions, etc.)
    const selectedFullNodes: Node[] = nodes.filter((n) => selectedNodeIds.has(n.id)).map((n) => ({ ...n, selected: false })); // ensure not selected inside subflow config

    // Identify left nodes (no inbound edge from another selected node) and right nodes (no outbound edge to another selected node)
    const inboundCounts: Record<string, number> = {};
    const outboundCounts: Record<string, number> = {};
    for (const id of originalSelectedNodeIds) {
      inboundCounts[id] = 0;
      outboundCounts[id] = 0;
    }
    for (const e of connectedEdges) {
      if (inboundCounts[e.target] !== undefined) inboundCounts[e.target] += 1;
      if (outboundCounts[e.source] !== undefined) outboundCounts[e.source] += 1;
    }
    const leftMostNodes = selectedFullNodes.filter((n) => inboundCounts[n.id] === 0);
    const rightMostNodes = selectedFullNodes.filter((n) => outboundCounts[n.id] === 0);

    if (rightMostNodes.some((n) => n.type === "ifelse")) {
      throw "If-Else nodes cannot be at the end of a subflow.";
    }

    // Compute positional helpers
    const minX = Math.min(...selectedFullNodes.map((n) => n.position.x));
    const maxX = Math.max(...selectedFullNodes.map((n) => n.position.x + (n.measured?.width || 0)));
    const avgY = selectedFullNodes.reduce((acc, n) => acc + n.position.y, 0) / selectedFullNodes.length;

    // Create empty start & end nodes
    const startNode: NodeVariant<"start"> = {
      id: "node_0",
      type: "start",
      position: { x: minX - 300, y: avgY },
      data: createDefaultNodeData("start"),
      zIndex: 2,
    };
    const endNode: NodeVariant<"end"> = {
      id: genId().replace(/-/g, ""),
      type: "end",
      position: { x: maxX + 300, y: avgY },
      data: createDefaultNodeData("end"),
      zIndex: 2,
    };

    // Build new edges: start -> left nodes, right nodes -> end
    const startEdges: Edge[] = leftMostNodes.map((ln) => ({
      animated: false,
      type: "curved",
      source: startNode.id,
      sourceHandle: "b",
      target: ln.id,
      targetHandle: "a",
      id: `${startNode.id}-${ln.id}-b-a`,
      zIndex: 1,
      data: { targetNodeType: "start" },
    }));
    const endEdges: Edge[] = rightMostNodes.map((rn) => ({
      animated: false,
      type: "curved",
      source: rn.id,
      sourceHandle: "b",
      target: endNode.id,
      targetHandle: "a",
      id: `${rn.id}-${endNode.id}-b-a`,
      zIndex: 1,
      data: { targetNodeType: "end" },
    }));

    // Add right nodes outputs to the end node
    rightMostNodes.forEach((rightNode) => {
      endNode.data.inputs = rightNode.data.outputs.map((output) => {
        return {
          id: genId(),
          key: output.key,
          type: output.type,
          value: {
            type: output.type,
            isReference: true,
            label: output.key,
            value: rightNode.id + "." + output.id,
          },
        };
      });
      endNode.data.outputs = rightNode.data.outputs.map((output) => {
        return {
          id: output.id,
          key: output.key,
          type: output.type,
        };
      });
    });

    const subflowNodeData: Partial<NodeVariant<"subflow">["data"]> = {};

    subflowNodeData.outputs = endNode.data.outputs;
    subflowNodeData.inputs = [];

    // process references and modify start and end and nodes to accommedate this
    const updatedSelectedNodes = processReferenceInputs(selectedFullNodes, startNode, subflowNodeData);

    // Assemble nodes & edges for subflow configuration
    // Cast to any to bypass narrow literal inference from initialConfig
    const newNodes = [startNode, ...updatedSelectedNodes, endNode].map<Node>((n) => ({
      ...n,
      selected: false,
    }));
    const newEdges = [...startEdges, ...connectedEdges, ...endEdges];

    const config = produce(initialConfig, (draft) => {
      (draft.config.parameters.nodes as unknown as Node[]) = newNodes;
      (draft.config.parameters.edges as unknown as Edge[]) = newEdges;
    });
    return [config, subflowNodeData] as const;
  };

  // Helper function to process reference inputs with recursion
  const processReferenceInputs = (
    subflowSelectedNodes: Node[],
    subflowStartNode: NodeVariant<"start">,
    subflowNodeData: Partial<NodeVariant<"subflow">["data"]>
  ) => {
    const startNode = subflowStartNode;
    const processedReferences = new Set<string>();
    subflowSelectedNodes.forEach((node) => {
      const inputs = getRequiredInputs(node);
      inputs.forEach(processInputRecursively);
    });

    function processInputRecursively(input: NonNullableOption) {
      if (!input?.isReference) return;
      const [nodeId, outputId] = normalizeNodeId(input.value);
      // // Skip if we've already processed this reference
      if (processedReferences.has(outputId)) return;
      // Check if the referenced node is not in selected nodes
      if (!selectedNodes.some((n) => n.id === nodeId)) {
        // Find the referenced node
        const referencedNode = nodes.find((n) => n.id === nodeId);
        if (referencedNode) {
          const nodeOutputs = referencedNode.data.outputs || [];
          const foundNode = nodeOutputs.find((n) => n.id === outputId);
          if (foundNode) {
            processedReferences.add(foundNode.id);

            const id = genId();

            // Add input to start node
            startNode.data.inputs.push({
              id,
              key: foundNode.key,
              type: foundNode.type || "String",
              value: {
                label: foundNode.key,
                value: foundNode.key,
              },
            });

            subflowNodeData.inputs?.push({
              id,
              key: foundNode.key,
              type: foundNode.type || "String",
              value: {
                label: foundNode.key,
                value: `${referencedNode.id}.${foundNode.id}`,
                isReference: true,
              },
            });

            startNode.data.outputs.push({
              id: foundNode.id,
              key: foundNode.key,
              type: (foundNode.type || "String") as NodeVariant<"end">["data"]["outputs"][number]["type"],
            });
          }
        }
      }
    }

    // update subflow nodes references to reference to start node inside subflow
    // i.e. whenever the subflow nodes references outputs outside the subflow
    const updatedNodes = produce(subflowSelectedNodes, (draft) => {
      transformInputsToNewNodeOutputs(draft, new Set(subflowSelectedNodes.map((n) => n.id)), startNode.id);
    });
    return updatedNodes;
  };

  const { createSubflowDisabled, disableReasons } = useCreateSubflowDisabled(selectedNodes, edges);

  const handleCreateSubflow = async () => {
    try {
      const selectedNodeIds = new Set(selectedNodes.map((node) => node.id));

      const extendedSelectedNodeIds = getExtendedSelectedNodeIds(selectedNodeIds);
      const [config, subflowNodeData] = mappingNewConfig(extendedSelectedNodeIds, selectedNodeIds);
      const newAddedSubflow = await addSelectedSubflow(config);
      const newAddedSubflowId = newAddedSubflow.activeConfigurationId;
      const newAddedSubflowSubflowId = newAddedSubflow.id;
      if (newAddedSubflowId) {
        // Calculate average position of selected nodes
        const averagePosition = calculateAveragePosition(selectedNodes, nodes);

        // Filter out selected nodes and their connected edges
        const filteredNodes = nodes.filter((n) => !extendedSelectedNodeIds.has(n.id));

        // Sanitize remaining ifelse nodes immutably: remove any IDs in each condition.then that are part of the selected nodes
        const sanitizedFilteredNodes = produce(filteredNodes, (draft) => {
          draft.forEach((node) => {
            if (node.type === "ifelse" && Array.isArray(node.data?.conditions)) {
              node.data.conditions = node.data.conditions.map((condition: ConditionType) => {
                if (Array.isArray(condition?.then)) {
                  return {
                    ...condition,
                    then: condition.then.filter((id: string) => !selectedNodeIds.has(id)),
                  };
                }
                return condition;
              });
            }
          });
        });
        const connectedEdges = getConnectedEdges(edges, selectedNodeIds);
        const filteredEdges = edges.filter((edge) => !selectedNodeIds.has(edge.source) && !selectedNodeIds.has(edge.target));

        // Get edges that are in edges but not in connectedEdges and not in filteredEdges
        const connectedEdgeIds = new Set(connectedEdges.map((edge) => edge.id));
        const filteredEdgeIds = new Set(filteredEdges.map((edge) => edge.id));

        const remainingEdges = edges.filter((edge) => !connectedEdgeIds.has(edge.id) && !filteredEdgeIds.has(edge.id));

        // Generate new subflow node
        const newNodeId = genId().replace(/-/g, "");
        const subflowNode = createSubflowNode(newNodeId, averagePosition, newAddedSubflowId || "", newAddedSubflowSubflowId || "", subflowNodeData);

        // update filtered nodes (i.e. flow nodes except future subflow nodes) references to reference to outputs of the subflow node itself
        // i.e. whenever the flow nodes references outputs inside the subflow
        const updatedFilteredNodes = produce(sanitizedFilteredNodes, (draft) => {
          transformInputsToNewNodeOutputs(draft, new Set(sanitizedFilteredNodes.map((n) => n.id)), subflowNode.id);
        });

        // Update the store with filtered nodes and new subflow
        setNodes([...updatedFilteredNodes, subflowNode]);
        setEdges(filteredEdges);

        // Add new edges to connect subflow to left and right nodes
        await updateNodeInternalsAsync(subflowNode.id);
        remainingEdges.forEach((edge) => {
          if (selectedNodeIds.has(edge.source)) {
            const connection = {
              source: subflowNode.id,
              target: edge.target,
              sourceHandle: null,
              targetHandle: edge.targetHandle || null,
            };
            if (isValidConnection(connection)) return onConnect(connection);
          }
          if (selectedNodeIds.has(edge.target)) {
            const connection = {
              source: edge.source,
              target: subflowNode.id,
              sourceHandle: edge.sourceHandle || null,
              targetHandle: null,
            };
            if (isValidConnection(connection)) return onConnect(connection);
          }
        });
        return subflowNode.id;
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error creating subflow",
        description: typeof error === "string" ? error : "Couldn't create subflow. try changing the selected arrangement.",
        variant: "destructive",
      });
    }
  };

  const createSubflowWithRenaming = async () => {
    const subflowId = await handleCreateSubflow();
    mitt.emit("node:double-click:focus-label", { nodeId: subflowId! });
  };

  if (!selectedNodes.length) {
    return null;
  }

  return (
    <>
      <div className="min-h-20 space-y-2 pt-3">
        <div className="flex items-center justify-between pb-6 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <SelectionForegroundIcon size={24} className="text-foreground" />
            {selectedNodes.length}
            <span className="text-md text-foreground">selected</span>
          </div>
          {canCreateElements && (
            <Button
              loading={createSubflowPending}
              onClick={createSubflowWithRenaming}
              className="flex gap-2 p-1.5"
              variant="secondary"
              disabled={createSubflowDisabled}
            >
              <span className="text-primary text-sm">Create Subflow</span>
              <SubflowIcon className="size-4 text-foreground" />
            </Button>
          )}
        </div>

        <div className="flex flex-col gap-2 pb-6 px-4 border-b border-sidebar-border">
          <span className="text-xs text-sidebar-foreground">Selected items</span>
          <div className="flex flex-col gap-2">
            {selectedNodes.map((node, index) => {
              const disabledReason = disableReasons[node.id];
              return <SelectedNodeItem key={`${node.id}-${index}`} node={node} index={index} disabledReason={disabledReason} />;
            })}
          </div>
        </div>
      </div>
    </>
  );
};
