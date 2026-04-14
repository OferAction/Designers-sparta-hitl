import { TreeItem } from "@/components/ui/tree-view";
import { extractFieldNameFromPath, findMetaByPath } from "@/modules/dataset/components/mapping-grid/utils";
import { DatasetInfo, DatasetStructureItem, DatasetMappingResponse, NodeMapping } from "@/modules/dataset/types";
import { getMetricTypeFromString, MetricType } from "@/modules/dataset/types/metrics";
import type { PreprocessingFunctionWithParams, ParameterType } from "@/modules/dataset/types/preprocessing";

const convertToTreeItem = (item: DatasetStructureItem): TreeItem => {
  // Normalize primitive boolean flags incorrectly represented as literal 'true'/'false' types to 'boolean'
  const originalType = typeof item.type === "string" ? item.type : String(item.type ?? "");
  const lowered = originalType.toLowerCase();
  const normalizedType = lowered === "true" || lowered === "false" ? "boolean" : originalType;

  const currentPath = item.id || "";

  return {
    name: item.name,
    type: normalizedType,
    sample: typeof item.sample === "object" ? JSON.stringify(item.sample) : String(item.sample || ""),
    path: currentPath,
    isArrayItem: normalizedType === "array",
    parentPath: "",
    children: item.children?.map((child) => convertToTreeItem(child)) || [],
  };
};

const getCounts = (datasetInfo: DatasetInfo) => {
  const counts = {
    labelsCount: 0,
    dataItemsCount: 0,
    samplesCount: 0,
  };

  if (datasetInfo) {
    counts.labelsCount = datasetInfo.labelsCount || 0;
    counts.dataItemsCount = datasetInfo.dataItemsCount || 0;
    counts.samplesCount = datasetInfo.samplesCount || 0;
  }

  return counts;
};

const transformDatasetInfoToTreeData = (datasetInfo: DatasetInfo) => {
  const extractDataFromStructure = (items?: DatasetStructureItem[]) => {
    if (!items) {
      return { datasetTreeData: [], rawFilesData: [] };
    }
    // Find labels item
    const labelsItem = items.find((item) => item.name === "labels");
    const labelsData = labelsItem?.children ? labelsItem.children.map((child) => convertToTreeItem(child)) : [];

    // Find inputs item
    const inputsItem = items.find((item) => item.name === "inputs");
    const inputsData = inputsItem?.children ? inputsItem.children.map((child) => convertToTreeItem(child)) : [];

    return { datasetTreeData: labelsData, rawFilesData: inputsData };
  };

  const headerInfo = datasetInfo.headerInfo;
  const result = extractDataFromStructure(headerInfo);

  const counts = getCounts(datasetInfo);
  return { ...result, ...counts };
};

interface TransformedDatasetMapping {
  id: string;
  mappings: Record<string, NodeMapping>;
  inputsDict: Record<string, string>;
  alignmentKeys: Array<{ nodeId: string; outputId: string }>;
  flaggedNodesOutputsFrontend: DatasetMappingResponse["flaggedNodesOutputsFrontend"];
  datasetVersionId: string;
}

const transformDatasetMappingResponse = (
  response: DatasetMappingResponse,
  datasetTreeData?: TreeItem[],
  rawFilesData?: TreeItem[]
): TransformedDatasetMapping => {
  if (!datasetTreeData || !rawFilesData) {
    return {
      id: response.id,
      alignmentKeys: [],
      inputsDict: {},
      mappings: {},
      flaggedNodesOutputsFrontend: response.flaggedNodesOutputsFrontend,
      datasetVersionId: response.datasetVersionId,
    };
  }
  const newMappings: Record<string, NodeMapping> = {};

  const buildDataItem = (jsonPath: string): NodeMapping["dataItem"] => {
    const fieldName = extractFieldNameFromPath(String(jsonPath || ""));
    const metaLabels = findMetaByPath(datasetTreeData, jsonPath);
    const metaInputs = findMetaByPath(rawFilesData, jsonPath);
    const meta = metaLabels || metaInputs;
    return {
      name: fieldName,
      type: meta?.type || "Unknown",
      sample: meta?.sample || `Sample: ${fieldName}`,
    };
  };

  // Process outputsDatasetMapping with embedded metrics
  const outputsMappings = response.outputsDatasetMapping || [];
  outputsMappings.forEach((item) => {
    const { nodeId, outputId, jsonPathId, metrics: itemMetrics, preprocessingFunctions: rawPreprocessingFunctions } = item;
    if (!nodeId || !outputId || !jsonPathId) return;

    const key = `${nodeId}-${outputId}`;
    const dataItem = buildDataItem(jsonPathId);

    // Convert metrics to internal format (MetricType enum values)
    const metricNames: MetricType[] = [];
    const metricParams: NodeMapping["metricParams"] = {};

    if (Array.isArray(itemMetrics)) {
      itemMetrics.forEach((entry) => {
        const metricValue = entry.metric;
        let typeName: MetricType | null = null;

        // Metric should be a string (MetricType enum value)
        if (typeof metricValue === "string") {
          typeName = getMetricTypeFromString(metricValue);
        }

        if (typeName) {
          metricNames.push(typeName);

          // Extract metric parameters
          if (Array.isArray(entry.list_of_positives)) {
            metricParams.positives = entry.list_of_positives;
          }
          if (Array.isArray(entry.list_of_classes)) {
            metricParams.classes = entry.list_of_classes;
          }
          if (Array.isArray(entry.class_labels)) {
            metricParams.classes = entry.class_labels;
          }
          if (Array.isArray(entry.labels)) {
            metricParams.labels = entry.labels;
          }
          if (typeName === MetricType.Accuracy && typeof entry.r === "number") {
            const computed = Math.round(entry.r * 100);
            const clamped = Math.max(0, Math.min(100, computed));
            metricParams.accuracyMargin = clamped;
          }
        }
      });
    }

    const parsedPreprocessingFunctions: PreprocessingFunctionWithParams[] = [];
    if (Array.isArray(rawPreprocessingFunctions)) {
      rawPreprocessingFunctions.forEach((fn) => {
        if (!fn.name) return;

        let parameters: string | undefined = undefined;
        let parameterType: ParameterType = "None";

        if (fn.params) {
          const paramValues = Object.values(fn.params);
          if (paramValues.length === 1 && fn.params.param1) {
            parameters = fn.params.param1;
            parameterType = "Regex"; // We will determine the exact type in the UI based on the content
          } else if (paramValues.length > 0) {
            // List parameters - join with commas
            parameters = paramValues.join(", ");
            parameterType = "List";
          }
        }

        parsedPreprocessingFunctions.push({
          functionId: fn.name,
          functionName: fn.name,
          parameterType,
          ...(parameters && { parameters }),
        });
      });
    }

    newMappings[key] = {
      nodeId,
      outputId,
      dataItem,
      jsonPath: jsonPathId,
      metrics: metricNames,
      ...(Object.keys(metricParams).length > 0 ? { metricParams } : {}),
      ...(parsedPreprocessingFunctions.length > 0 ? { preprocessingFunctions: parsedPreprocessingFunctions } : {}),
    };
  });

  // Process inputsList (data items mapping)
  const convertedInputsDict: Record<string, string> = {};
  const inputsList = response.inputsList || [];
  inputsList.forEach((item) => {
    const { nodeId, outputId, jsonPathId } = item;
    if (!nodeId || !outputId || !jsonPathId) return;

    convertedInputsDict[`${nodeId}.${outputId}`] = jsonPathId;
  });

  // Process alignment keys - store as-is with outputId
  const convertedAlignmentKeys: Array<{ nodeId: string; outputId: string }> = response.alignmentKeys
    .map((item) => {
      const { nodeId, outputId } = item;
      if (!nodeId || !outputId) return null;
      return { nodeId, outputId };
    })
    .filter((item) => item !== null);

  return {
    id: response.id,
    mappings: newMappings,
    inputsDict: convertedInputsDict,
    alignmentKeys: convertedAlignmentKeys,
    flaggedNodesOutputsFrontend: response.flaggedNodesOutputsFrontend,
    datasetVersionId: response.datasetVersionId,
  };
};

export { transformDatasetInfoToTreeData, transformDatasetMappingResponse };
