import { useCallback, useMemo, useState } from "react";

import { XIcon } from "@phosphor-icons/react";
import { useReactFlow, useStoreApi } from "@xyflow/react";
import { produce } from "immer";
import { useForm, FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { useRunWithSaveCheck } from "@/hooks/useConfirmationDialogs";

import { InputsSection } from "./InputsSection";
import { ScopeSection } from "./ScopeSection";
import { SourceSection } from "./SourceSection";
import { FormData, RunScope } from "./types";
import { flattenFormData, getRequiredInputs } from "./utils";
import { usePanelDialogContext } from "../../dialog";
import WithTooltip from "@/components/common/WithTooltip";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Option } from "@/components/ui/input-tag";
import { NODE_ICONS_MAP } from "@/constants";
import { isPydanticOrhasPydanticParent } from "@/modules/flow/components/IO";
import { useSubflowContext } from "@/modules/flow/contexts";
import { useConfigRun, useGetChildNodes, useRunSample, useSaveOrchestration } from "@/modules/flow/hooks";
import { useGetAncestorsIds } from "@/modules/flow/hooks";
import { Node, NodeVariant } from "@/modules/flow/types";
import { FlowStoreState, useFlowStore } from "@/store";

const createDatasetMappingPayload = (selectedDatasetMappingId: string | null, selectedDatasetRowIndex: number | null, configurationId: string) => {
  return selectedDatasetMappingId
    ? {
        singleRowSample: selectedDatasetRowIndex,
        configurationDatasetMappingId: selectedDatasetMappingId,
        configurationId: configurationId,
      }
    : undefined;
};

const selector = (state: FlowStoreState) => ({
  runDatasetSelection: state.runDatasetSelection,
});

export const RunDialog = ({
  initialSelectedNode,
  scope: initialScope = "run-node",
  initialSource,
}: {
  initialSelectedNode?: string;
  scope: RunScope;
  initialSource?: string;
}) => {
  const [scope, setScope] = useState<RunScope>(initialScope);

  const { runDatasetSelection } = useFlowStore(useShallow(selector));

  const isSubflowNodeContext = useSubflowContext();
  const { closeDialog } = usePanelDialogContext();

  const reactFlowInstance = useStoreApi();
  const { getNode, getNodes, getEdges } = useReactFlow<Node>();

  const getAncestorIds = useGetAncestorsIds();
  const getChildNodes = useGetChildNodes();

  const { runWithSaveCheck } = useRunWithSaveCheck();
  const { onRunOrchestration, loading } = useRunSample();
  const { onRunOrchestration: onRunAllOrchestration } = useConfigRun();
  const { onSaveOrchestration } = useSaveOrchestration();

  const { configId: paramsConfigId = "", fileId = "", subflowConfigId = "" } = useParams();
  const configId = paramsConfigId || subflowConfigId;

  const formMethods = useForm<FormData>({
    defaultValues: {},
    mode: "all",
  });

  const {
    formState: { isValid, isSubmitting, errors },
    handleSubmit,
  } = formMethods;

  const endNode = useMemo(() => {
    const nodes = getNodes();
    const n = nodes.find((node) => node.data.type === "end");
    if (!n) return null;
    return {
      value: n?.id,
      label: n.data.label || n?.id,
      icon: NODE_ICONS_MAP(n?.data.name),
    };
  }, [getNodes]);

  const [selectedNode, setSelectedNode] = useState<Option | null>(() => {
    if (initialSelectedNode) {
      const node = getNode(initialSelectedNode);
      if (node) {
        return {
          value: node.id,
          label: node.data.label || node.id,
          icon: NODE_ICONS_MAP(node.data.name),
        };
      }
    }
    return endNode;
  });

  const onSubmit = (data: FormData) => {
    const flattenedData = flattenFormData(data);
    if (selectedNode?.value === endNode?.value) {
      handleRunAll(flattenedData);
      return;
    }

    const datasetMappingPayload = createDatasetMappingPayload(runDatasetSelection.mappingId, runDatasetSelection.rowIndex, configId);

    if (scope === "run-node") {
      onRunOrchestration(
        {
          ...(datasetMappingPayload && { datasetMapping: datasetMappingPayload }),
          inputs: flattenedData,
          configId,
          config: JSON.stringify({
            config: {
              parameters: {
                nodes: [getNode(selectedNode?.value || "")],
                edges: [],
              },
            },
          }),
          isSingleNode: true,
        },
        () => {
          closeDialog();
        }
      );
    }
    if (scope === "run-path") {
      const ancestorIds = getAncestorIds(selectedNode?.value || "", true);
      const childNodesIds = getChildNodes(selectedNode?.value || "");

      const nodeIds = ancestorIds.concat(childNodesIds);

      const nodesSet = new Set(nodeIds);
      const nodes = nodeIds
        .map((id) => {
          const orgNode = getNode(id);
          if (orgNode?.type === "start") {
            const node = produce(orgNode, (draft) => {
              draft.data.inputs.forEach((input) => {
                if (`${id}.${input.id}` in flattenedData) {
                  input.value.value = `{{ ${id}.${input.id} }}`;
                }
              });
            });
            return node;
          }
          return orgNode;
        })
        .filter((node) => node !== undefined);
      const edges = getEdges().filter((edge) => nodesSet.has(edge.source) && nodesSet.has(edge.target));
      onRunOrchestration(
        {
          ...(datasetMappingPayload && { datasetMapping: datasetMappingPayload }),
          inputs: flattenedData,
          configId,
          config: JSON.stringify({
            config: {
              parameters: {
                nodes,
                edges,
              },
            },
          }),
          isSingleNode: false,
        },
        () => {
          closeDialog();
        }
      );
    }
  };

  const handleClearFields = () => {
    const emptyValues = inputs.reduce((acc, opt) => {
      acc[opt.value] = "";
      return acc;
    }, {} as FormData);

    formMethods.reset(emptyValues);
  };

  const handleRunAll = useCallback(
    (data: FormData) => {
      reactFlowInstance.getState().resetSelectedElements();

      const runAllForConfig = (currentConfigId: string) => {
        const datasetMappingPayload = createDatasetMappingPayload(runDatasetSelection.mappingId, runDatasetSelection.rowIndex, currentConfigId);

        onRunAllOrchestration(
          {
            ...(datasetMappingPayload && { datasetMapping: datasetMappingPayload }),
            configId: currentConfigId,
            fileId: fileId || "",
            inputs: data,
          },
          () => closeDialog()
        );
      };

      if (isSubflowNodeContext) {
        runWithSaveCheck((newConfigId) => {
          runAllForConfig(newConfigId || subflowConfigId || configId);
        });
        return;
      }
      onSaveOrchestration({
        onSuccess: (data) => {
          runAllForConfig(data.id || subflowConfigId || configId);
        },
      });
    },
    [
      reactFlowInstance,
      isSubflowNodeContext,
      onSaveOrchestration,
      runDatasetSelection.mappingId,
      runDatasetSelection.rowIndex,
      onRunAllOrchestration,
      fileId,
      closeDialog,
      runWithSaveCheck,
      subflowConfigId,
      configId,
    ]
  );

  const onSelectedNodeChange = (node: Option | null) => {
    setSelectedNode(node);
  };

  const inputs = useMemo(() => {
    if (!selectedNode) return [];

    if (scope === "run-node") {
      const node = getNode(selectedNode.value);
      if (!node) return [];
      return getRequiredInputs(node);
    }

    const startNode = getNodes().find((node) => node.type === "start") as NodeVariant<"start">;
    if (!startNode) return [];

    return startNode.data.inputs
      .filter((input, _, list) => !isPydanticOrhasPydanticParent(input, list))
      .map((input) => ({
        id: input.id,
        label: input.key,
        value: `${startNode.id}.${input.id}`,
        inputValue: input.value.value || "",
        type: input.type,
      })) satisfies Option[];
  }, [selectedNode, getNode, getNodes, scope]);

  const isEndNodeWithNoOutputs = useMemo(() => {
    if (!selectedNode || selectedNode.value !== endNode?.value) return false;

    const realEndNode = getNode(selectedNode.value) as NodeVariant<"end">;
    const { outputs, inputs } = realEndNode?.data || {};
    return !outputs || outputs.length === 0 || inputs?.every((input) => !input.value?.value || !input.key);
  }, [selectedNode, endNode, getNode]);

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-[600px]">
        <DialogHeader className="-mx-6 px-6 py-3 bg-sidebar flex-shrink-0 border-b border-sidebar-border flex flex-row items-center justify-between">
          <DialogTitle>Run configuration</DialogTitle>
          <DialogClose className="p-1.5  rounded transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <XIcon className="h-4 w-4 " />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex min-h-0 -mx-6 flex-1">
          <div className="relative flex-1 px-6  pr-6 border-r border-sidebar-border bg-sidebar">
            <ScopeSection selectedNode={selectedNode} setSelectedNode={onSelectedNodeChange} scope={scope} setScope={setScope} />
            <div className="[&:not(:last-child)]:h-px [&:not(:last-child)]:bg-sidebar-border [&:not(:last-child)]:-mx-6 [&:not(:last-child)]:px-6" />
            <SourceSection inputs={inputs} runScope={scope} initialSource={initialSource} />
          </div>
          <div className="flex-1 p-6 flex flex-col justify-between max-w-full overflow-x-hidden">
            <InputsSection scope={scope} inputs={inputs} />
            <DialogFooter className="!justify-between flex-shrink-0 border-t pt-6 -mx-6 px-6 border-sidebar-border min-h-fit">
              <Button type="button" variant="secondary" onClick={handleClearFields}>
                Clear Fields
              </Button>
              <WithTooltip disableTooltip={!isEndNodeWithNoOutputs} tooltip={isEndNodeWithNoOutputs ? "The end node has no outputs to run." : ""}>
                <div>
                  <Button
                    type="submit"
                    variant="default"
                    disabled={!isValid || isEndNodeWithNoOutputs || Object.keys(errors).length > 0}
                    loading={isSubmitting || loading}
                  >
                    {isSubmitting ? "Running..." : "Run sample"}
                  </Button>
                </div>
              </WithTooltip>
            </DialogFooter>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
