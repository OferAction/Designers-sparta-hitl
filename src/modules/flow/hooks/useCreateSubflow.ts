import { useCallback, useMemo } from "react";

import { produce } from "immer";
import { useShallow } from "zustand/shallow";

// Shared hooks & utilities
import { useToast } from "@/hooks/use-toast";
import { useCreateSubflowDisabled } from "@/modules/flow/hooks/useCreateSubflowDisabled";

import { useConnectionValidity } from "@/modules/flow/utils/useConnectionValidity";

import { mitt } from "@/lib/mitt";
// Flow domain utilities & hooks (order: validity, config, run-dialog utils, generic hooks, types)
import { getRequiredInputs, transformInputsToNewNodeOutputs } from "@/modules/flow/components/ContextualPanel/RunDialog/utils";
import { initialConfig } from "@/modules/flow/constants";
import { useSelectedNodes, useUpdateNodeInternalsAsync } from "@/modules/flow/hooks";
import { Node, Edge, ConditionType } from "@/modules/flow/types";
// App state & actions
import { useFileActions } from "@/modules/workspace";
import { FlowStoreState, useFlowStore } from "@/store";
import { genId } from "@/utils";

// Local selector for required store pieces
const selector = (s: FlowStoreState) => ({
  nodes: s.nodes,
  edges: s.edges,
  setNodes: s.setNodes,
  setEdges: s.setEdges,
  onConnect: s.onConnect,
});

// Helpers
const createDefaultNodeData = (nodeType: "start" | "end"): any => ({
  title: nodeType === "start" ? "Start" : "End",
  name: nodeType,
  type: nodeType,
  subtitle: `${nodeType === "start" ? "Start" : "End"} node`,
  description: `${nodeType === "start" ? "Start" : "End"} of the orchestration`,
  after_node_execution: "continue",
  label: "",
  inputs: [],
  outputs: [],
});

const getConnectedEdges = (edges: Edge[], selectedNodeIds: Set<string>): Edge[] =>
  edges.filter((e) => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target));

const calculateAveragePosition = (selectedNodes: Pick<Node, "id" | "type" | "data">[], allNodes: Node[]) => {
  const ids = new Set(selectedNodes.map((n) => n.id));
  const full = allNodes.filter((n) => ids.has(n.id));
  const total = full.reduce((acc, n) => ({ x: acc.x + n.position.x, y: acc.y + n.position.y }), { x: 0, y: 0 });
  return { x: total.x / full.length, y: total.y / full.length };
};

const createSubflowNode = (nodeId: string, position: { x: number; y: number }, subflowConfigId: string, subflowId: string): Node => ({
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
  },
  position,
  selected: false,
  zIndex: 2,
  measured: {
    width: 120,
    height: 56,
  },
});

export const useCreateSubflow = () => {
  const selectedNodes = useSelectedNodes();
  const { addSelectedSubflow, createSubflowPending } = useFileActions();
  const { nodes, edges, setNodes, setEdges, onConnect } = useFlowStore(useShallow(selector));
  const { isValidConnection } = useConnectionValidity();
  const updateNodeInternals = useUpdateNodeInternalsAsync();
  const { toast } = useToast();

  const { createSubflowDisabled } = useCreateSubflowDisabled(selectedNodes, edges, { shouldGetDisableReasons: false });

  const processReferenceInputs = useCallback(
    (subflowSelectedNodes: Node[], subflowStartNode: Node) => {
      const startNode: any = subflowStartNode;
      const processed = new Set<string>();
      const normalizeNodeId = (nodeId: string): string[] => nodeId.split(".");

      const requiredInputs = subflowSelectedNodes.flatMap((n) => getRequiredInputs(n));
      requiredInputs.forEach((input) => {
        if (!input?.isReference) return;
        const [nodeId, inputId] = normalizeNodeId(input.value);
        if (processed.has(inputId)) return;
        if (!selectedNodes.some((sn) => sn.id === nodeId)) {
          const referencedNode = nodes.find((n) => n.id === nodeId);
          if (referencedNode) {
            const found = (referencedNode.data.outputs || []).find((o: any) => o.id === inputId);
            if (found) {
              processed.add(found.id);
              startNode.data.inputs.push({
                id: genId(),
                key: found.key,
                type: found.type || "String",
                value: { label: found.key, value: found.key },
              });
              startNode.data.outputs.push({ id: found.id, key: found.key, type: found.type || "String" });
            }
          }
        }
      });
      const updated = produce(subflowSelectedNodes, (draft) => {
        transformInputsToNewNodeOutputs(draft, new Set(subflowSelectedNodes.map((n) => n.id)), startNode.id);
      });
      return updated as Node[];
    },
    [nodes, selectedNodes]
  );

  const buildConfigFromSelection = useCallback(
    (selectedIds: Set<string>) => {
      if (!selectedNodes.length) return null;
      const config = produce(initialConfig, (draft: any) => {
        const connectedEdges = getConnectedEdges(edges, selectedIds);
        const selectedFullNodes: Node[] = nodes.filter((n) => selectedIds.has(n.id)).map((n) => ({ ...n, selected: false }));

        // in/out degree counts
        const inbound: Record<string, number> = {};
        const outbound: Record<string, number> = {};
        selectedIds.forEach((id) => {
          inbound[id] = 0;
          outbound[id] = 0;
        });
        connectedEdges.forEach((e) => {
          if (inbound[e.target] !== undefined) inbound[e.target] += 1;
          if (outbound[e.source] !== undefined) outbound[e.source] += 1;
        });
        const leftMost = selectedFullNodes.filter((n) => inbound[n.id] === 0);
        const rightMost = selectedFullNodes.filter((n) => outbound[n.id] === 0);
        if (rightMost.some((n) => n.type === "ifelse")) throw "If-Else nodes cannot be at the end of a subflow.";

        const minX = Math.min(...selectedFullNodes.map((n) => n.position.x));
        const maxX = Math.max(...selectedFullNodes.map((n) => n.position.x));
        const avgY = selectedFullNodes.reduce((acc, n) => acc + n.position.y, 0) / selectedFullNodes.length;

        const startNode: Node = {
          id: "node_0",
          type: "start",
          position: { x: minX - 300, y: avgY },
          data: createDefaultNodeData("start"),
          zIndex: 2,
        } as any;
        const endNode: Node = {
          id: genId().replace(/-/g, ""),
          type: "end",
          position: { x: maxX + 300, y: avgY },
          data: createDefaultNodeData("end"),
          zIndex: 2,
        } as any;

        const startEdges: Edge[] = leftMost.map((ln) => ({
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
        const endEdges: Edge[] = rightMost.map((rn) => ({
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

        const updatedSelectedNodes = processReferenceInputs(selectedFullNodes, startNode as any);
        const newNodes = [startNode, ...updatedSelectedNodes, endNode].map<Node>((n) => ({ ...n, selected: false }));
        const newEdges = [...startEdges, ...connectedEdges, ...endEdges];

        rightMost.forEach((r) => {
          endNode.data.inputs = r.data.outputs.map((o: any) => ({
            id: genId(),
            key: o.key,
            type: o.type,
            value: { type: o.type, isReference: true, label: o.key, value: r.id + "." + o.id },
          }));
          endNode.data.outputs = r.data.outputs.map((o: any) => ({ id: o.id, key: o.key, type: o.type }));
        });

        draft.config.parameters.nodes = newNodes;
        draft.config.parameters.edges = newEdges;
      });
      return config;
    },
    [edges, nodes, processReferenceInputs, selectedNodes]
  );

  const createSubflow = useCallback(
    async (renameAfter?: boolean) => {
      try {
        const selectedIds = new Set(selectedNodes.map((n) => n.id));
        const config = buildConfigFromSelection(selectedIds);
        if (!config) return;
        const newSub = await addSelectedSubflow(config as any);
        const newSubflowConfigId = (newSub as any).activeConfigurationId;
        const newSubflowId = newSub.id;
        if (newSubflowConfigId) {
          const avgPos = calculateAveragePosition(selectedNodes, nodes);
          const filteredNodes = nodes.filter((n) => !selectedIds.has(n.id));
          // sanitize ifelse references
          const sanitized = produce(filteredNodes, (draft) => {
            draft.forEach((node) => {
              if (node.type === "ifelse" && Array.isArray(node.data?.conditions)) {
                node.data.conditions = node.data.conditions.map((c: ConditionType) => ({
                  ...c,
                  then: Array.isArray(c.then) ? c.then.filter((id) => !selectedIds.has(id)) : c.then,
                }));
              }
            });
          });
          const connectedEdges = getConnectedEdges(edges, selectedIds);
          const filteredEdges = edges.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target));
          const connectedEdgeIds = new Set(connectedEdges.map((e) => e.id));
          const filteredEdgeIds = new Set(filteredEdges.map((e) => e.id));
          const remainingEdges = edges.filter((e) => !connectedEdgeIds.has(e.id) && !filteredEdgeIds.has(e.id));
          const newNodeId = genId().replace(/-/g, "");
          const subflowNode = createSubflowNode(newNodeId, avgPos, newSubflowConfigId || "", newSubflowId || "");
          const updatedFilteredNodes = produce(sanitized, (draft) => {
            transformInputsToNewNodeOutputs(draft, new Set(sanitized.map((n) => n.id)), subflowNode.id);
          });
          setNodes([...updatedFilteredNodes, subflowNode]);
          setEdges(filteredEdges);
          await updateNodeInternals(subflowNode.id);
          remainingEdges.forEach((edge) => {
            if (selectedIds.has(edge.source)) {
              const conn = { source: subflowNode.id, target: edge.target, sourceHandle: null, targetHandle: edge.targetHandle || null };
              if (isValidConnection(conn)) onConnect(conn as any);
            }
            if (selectedIds.has(edge.target)) {
              const conn = { source: edge.source, target: subflowNode.id, sourceHandle: edge.sourceHandle || null, targetHandle: null };
              if (isValidConnection(conn)) onConnect(conn as any);
            }
          });
          if (renameAfter) mitt.emit("node:double-click:focus-label", { nodeId: newNodeId });
        }
      } catch (err) {
        console.error(err);
        toast({
          title: "Error creating subflow",
          description: typeof err === "string" ? err : "Couldn't create subflow. try changing the selected arrangement.",
          variant: "destructive",
        });
      }
    },
    [
      addSelectedSubflow,
      buildConfigFromSelection,
      edges,
      isValidConnection,
      nodes,
      onConnect,
      selectedNodes,
      setEdges,
      setNodes,
      toast,
      updateNodeInternals,
    ]
  );

  return useMemo(
    () => ({
      canCreateSubflow: !createSubflowDisabled,
      createSubflow,
      createSubflowWithRenaming: () => createSubflow(true),
      createSubflowPending,
    }),
    [createSubflow, createSubflowDisabled, createSubflowPending]
  );
};

export default useCreateSubflow;
