import { pathExistsInTree, findTypeByPathInTrees, isTypeMismatch } from "./utils";
import type { TreeItem } from "@/components/ui/tree-view";
import { NodeMapping, OutputDatasetMapping, InputListItem } from "@/modules/dataset/types/dataset";
import { buildBackendMetricPayload, DEFAULT_ACCURACY_MARGIN, MetricType } from "@/modules/dataset/types/metrics";
import { Node, NodeOutput } from "@/modules/flow/types";

import type { RowItemData } from "./mappingtable";

/**
 * Find output by ID in flat outputs array
 */
export const findOutputById = (outputs: NodeOutput[], targetId: string): NodeOutput | undefined => {
  return outputs.find((output) => output.id === targetId);
};

/**
 * Check if output exists in node structure
 */
const outputExistsInNode = (outputs: NodeOutput[] | undefined, outputId: string): boolean => {
  return outputs?.some((output) => output.id === outputId) ?? false;
};

/**
 * Check if mapping output still exists in node structure
 */
export const mappingOutputStillExists = (mapping: { nodeId: string; outputId: string }, nodeLookup: Map<string, Node>): boolean => {
  const node = nodeLookup.get(mapping.nodeId);
  if (!node) return false;

  if (node.data.name === "start") {
    return node.data.inputs?.some((inp) => inp.id === mapping.outputId) ?? false;
  }

  return outputExistsInNode(node.data.outputs, mapping.outputId);
};

/**
 * Get output key for a given node and output ID
 */
export const getOutputKey = (nodeId: string, outputId: string, nodeLookup: Map<string, Node>): string => {
  const node = nodeLookup.get(nodeId);
  if (!node) return outputId;

  if (node.data.name === "start") {
    const input = node.data.inputs?.find((inp) => inp.id === outputId);
    return input?.key || outputId;
  }

  const output = findOutputById(node.data.outputs || [], outputId);
  return output?.key || outputId;
};

/**
 * Validate that all mapped outputs have metrics assigned
 */
export const validateMappingMetrics = (
  mappings: Array<{ nodeId: string; outputId: string; jsonPath: string; metrics?: any[] }>,
  nodeLookup: Map<string, Node>
): Array<{ nodeId: string; outputId: string; label: string }> => {
  const offenders: Array<{ nodeId: string; outputId: string; label: string }> = [];

  for (const m of mappings) {
    const node = nodeLookup.get(m.nodeId);
    if (!node || node.data.name === "start") continue;

    if (m.jsonPath && (!m.metrics || m.metrics.length === 0)) {
      const label = node.data?.title || node.data?.label || node.data?.name || m.nodeId;
      const outputKey = getOutputKey(m.nodeId, m.outputId, nodeLookup);
      offenders.push({ nodeId: m.nodeId, outputId: m.outputId, label: `${label}:${outputKey}` });
    }
  }

  return offenders;
};

/**
 * Build outputs dataset mapping from valid mappings
 */
export const buildOutputsDatasetMapping = (
  mappings: NodeMapping[],
  startNodeIds: Set<string>,
  nodeLookup: Map<string, Node>
): OutputDatasetMapping[] => {
  return mappings
    .filter((m) => !startNodeIds.has(m.nodeId))
    .map((mapping) => {
      const outputKey = getOutputKey(mapping.nodeId, mapping.outputId, nodeLookup);

      const metrics =
        mapping.metrics && mapping.metrics.length > 0
          ? mapping.metrics
              .map((metricName) => {
                const p = mapping.metricParams || {};
                const positives = Array.isArray(p.positives) ? p.positives : [];
                const classes = Array.isArray(p.classes) ? p.classes : [];
                const labels = Array.isArray(p.labels) ? p.labels : [];

                let r: number | undefined = undefined;
                if (metricName === MetricType.Accuracy) {
                  const margin = typeof p.accuracyMargin === "number" && p.accuracyMargin >= 0 ? p.accuracyMargin : DEFAULT_ACCURACY_MARGIN;
                  r = margin / 100;
                }
                return buildBackendMetricPayload(metricName, { r, positives, classes, labels });
              })
              .filter((metric) => metric !== undefined)
          : undefined;

      const preprocessingFunctions =
        mapping.preprocessingFunctions && mapping.preprocessingFunctions.length > 0
          ? mapping.preprocessingFunctions.map((fn) => {
              const result: { name: string; params?: Record<string, string> } = {
                name: fn.functionName,
              };

              if (fn.parameters) {
                if (fn.parameterType === "List") {
                  const values = fn.parameters.split(",").map((v) => v.trim());
                  result.params = values.reduce(
                    (acc, val, idx) => {
                      acc[`param${idx + 1}`] = val;
                      return acc;
                    },
                    {} as Record<string, string>
                  );
                } else if (fn.parameterType === "Regex" || fn.parameterType === "Number") {
                  result.params = { param1: fn.parameters };
                }
              }

              return result;
            })
          : undefined;

      return {
        nodeId: mapping.nodeId,
        outputId: mapping.outputId,
        outputKey,
        jsonPathId: mapping.jsonPath,
        ...(metrics && metrics.length > 0 && { metrics }),
        ...(preprocessingFunctions && preprocessingFunctions.length > 0 && { preprocessingFunctions }),
      };
    });
};

/**
 * Build inputs list from inputs dictionary and start node mappings
 */
export const buildInputsList = (
  inputsDict: Record<string, string>,
  startNodeMappings: NodeMapping[],
  nodeLookup: Map<string, Node>
): InputListItem[] => {
  const inputsList: InputListItem[] = [];

  // Process inputsDict
  Object.entries(inputsDict).forEach(([key, jsonPath]) => {
    const [nodeId, outputId] = key.split(".");
    if (!nodeId || !outputId) return;

    const node = nodeLookup.get(nodeId);
    if (!node) return;

    // Check if output exists
    const exists =
      node.data.name === "start" ? node.data.inputs?.some((inp) => inp.id === outputId) : outputExistsInNode(node.data.outputs, outputId);

    if (!exists) return;

    const outputKey = getOutputKey(nodeId, outputId, nodeLookup);
    if (!outputKey || outputKey === "undefined" || outputKey.trim() === "") return;

    inputsList.push({
      nodeId,
      outputId,
      outputKey,
      jsonPathId: jsonPath,
    });
  });

  // Process start node mappings
  startNodeMappings.forEach((m) => {
    const outputKey = getOutputKey(m.nodeId, m.outputId, nodeLookup);
    if (!outputKey || outputKey === "undefined" || outputKey.trim() === "") return;

    const alreadyExists = inputsList.some((item) => item.outputId === m.outputId && item.outputKey === outputKey);
    if (!alreadyExists) {
      inputsList.push({
        nodeId: m.nodeId,
        outputId: m.outputId,
        outputKey,
        jsonPathId: m.jsonPath,
      });
    }
  });

  return inputsList;
};

/**
 * Recursively check if any output in the tree has a missing path in the dataset
 */
export const hasOutputPathMissing = (
  output: RowItemData,
  actualNodeId: string,
  mappings: Record<string, { jsonPath: string }>,
  inputsDict: Record<string, string>,
  datasetTreeData: TreeItem[]
): boolean => {
  if (!output) return false;

  const jsonPath = mappings[`${actualNodeId}-${output.id}`]?.jsonPath || inputsDict[`${actualNodeId}.${output.id}`] || null;

  if (jsonPath && !pathExistsInTree(datasetTreeData, jsonPath)) return true;

  // Check nested outputs (only NodeOutputRowData has outputs property with nested items)
  if (output.rowType === "output" && output.outputs && output.outputs.length > 0) {
    for (const nestedOutput of output.outputs) {
      if (hasOutputPathMissing(nestedOutput, actualNodeId, mappings, inputsDict, datasetTreeData)) return true;
    }
  }

  return false;
};

/**
 * Recursively check if any output in the tree has a type mismatch
 */
export const hasOutputTypeMismatch = (
  output: RowItemData,
  actualNodeId: string,
  mappings: Record<string, { jsonPath: string }>,
  inputsDict: Record<string, string>,
  datasetTreeData: TreeItem[],
  rawFilesData: TreeItem[]
): boolean => {
  if (!output) return false;

  if (output.rowType === "output") {
    const expected = String(output.type || "");
    const jsonPath = mappings[`${actualNodeId}-${output.id}`]?.jsonPath || inputsDict[`${actualNodeId}.${output.id}`] || null;
    const selectedType = findTypeByPathInTrees(datasetTreeData, rawFilesData, jsonPath);

    if (isTypeMismatch(selectedType, expected)) return true;

    if (output.outputs && output.outputs.length > 0) {
      for (const nestedOutput of output.outputs) {
        if (hasOutputTypeMismatch(nestedOutput, actualNodeId, mappings, inputsDict, datasetTreeData, rawFilesData)) return true;
      }
    }
  }

  return false;
};

/**
 * Check if any output under a node (including nested) is mapped
 */
export const hasAnyOutputMapped = (output: RowItemData, nodeId: string, mappings: Record<string, { jsonPath: string }>): boolean => {
  if (!output) return false;

  const key = `${nodeId}-${output.id}`;
  if (mappings[key]?.jsonPath) return true;

  // Check nested outputs (only NodeOutputRowData has outputs with nested items)
  if (output.rowType === "output" && output.outputs && output.outputs.length > 0) {
    return output.outputs.some((nested) => hasAnyOutputMapped(nested, nodeId, mappings));
  }

  return false;
};
