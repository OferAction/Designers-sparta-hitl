import { useCallback, useEffect, useMemo, useState } from "react";

import { OnConnect, OnDelete, useNodesData, useStoreApi } from "@xyflow/react";

import { useGetAncestorsIds } from "./useGetAncestorsIds";
import { mitt } from "@/lib/mitt";
import { Node, Edge, RuleEntry } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

import { isChildNode } from "@/modules/flow/utils/isChildNode";

export const useAncestors = (nodeId: string) => {
  const { nodeLookup, parentLookup } = useStoreApi<Node, Edge>().getState();
  const getAncestorIdsUtil = useGetAncestorsIds();
  const [nodeIds, setNodeIds] = useState<string[]>([]);
  const onChange = useFlowStore((state) => state.onChange);
  const nodes = useNodesData<Node>(nodeIds);
  const isIteration = nodes[0]?.type === "iterator";
  const getAncestorIds = useCallback(
    (nodeId: string) => {
      queueMicrotask(() => {
        setNodeIds(getAncestorIdsUtil(nodeId));
      });
    },
    [getAncestorIdsUtil]
  );

  useEffect(() => {
    getAncestorIds(nodeId);
  }, [getAncestorIds, isIteration, nodeId, onChange]);

  useEffect(() => {
    const handleConnect: OnConnect = (connection) => {
      if (nodeIds.includes(connection.source) || nodeIds.includes(connection.target)) {
        getAncestorIds(nodeId);
      }
    };

    const handleDelete: OnDelete = ({ edges }) => {
      if (edges.some((edge) => nodeIds.includes(edge.source) || nodeIds.includes(edge.target))) {
        getAncestorIds(nodeId);
      }
    };

    mitt.on("flow:connect", handleConnect);
    mitt.on("flow:delete", handleDelete);

    return () => {
      mitt.off("flow:connect", handleConnect);
      mitt.off("flow:delete", handleDelete);
    };
  }, [nodeIds, getAncestorIds, nodeId]);

  return useMemo(() => {
    const node = nodeLookup.get(nodeId);
    return nodes.slice(1).map((n) => {
      const rules = n.data.rules?.non_system_rules || [];
      const enabledRules = rules.filter((rule: RuleEntry) => rule.enabled === undefined || rule.enabled === true);
      const sortedRules = [...enabledRules].sort((a, b) => (a.order || 0) - (b.order || 0));

      // Generate rule outputs with metadata
      const ruleOutputs = sortedRules.flatMap((rule) => {
        const rulePrefix = `${n.id}$${rule.id}`;
        const ruleMeta = {
          ruleId: rule.id,
          ruleName: rule.name || rule.id,
          ruleOrder: rule.order || 0,
          ruleType: rule.type || "built-in",
        };

        return [
          {
            id: `{{${rulePrefix}$satisfied}}`,
            key: `satisfied`,
            type: "Boolean",
            description: `Whether rule "${ruleMeta.ruleName}" was satisfied`,
            ...ruleMeta,
          },
          {
            id: `{{${rulePrefix}$message}}`,
            key: `message`,
            type: "String",
            description: `Message for rule "${ruleMeta.ruleName}"`,
            ...ruleMeta,
          },
          {
            id: `{{${rulePrefix}$additional}}`,
            key: `additional`,
            type: "Object",
            description: `Additional outputs from rule "${ruleMeta.ruleName}"`,
            ...ruleMeta,
          },
        ];
      });

      const baseOutputs = isChildNode(parentLookup, nodeLookup, node, n.id) ? [] : n.data.outputs || [];
      const iteratorOutputs = isChildNode(parentLookup, nodeLookup, node, n.id)
        ? [
            { id: "index", key: "index", type: "Number", value: `${n.id}.index` },
            { id: "item", key: "item", type: "Object", value: `${n.id}.item` },
            { id: "key", key: "key", type: "String", value: `${n.id}.key` },
            { id: "value", key: "value", type: "Object", value: `${n.id}.value` },
          ]
        : [];

      return {
        ...n,
        data: {
          ...n.data,
          outputs: [...iteratorOutputs, ...baseOutputs, ...ruleOutputs],
        },
      };
    });
  }, [nodeId, nodeLookup, nodes, parentLookup]);
};
