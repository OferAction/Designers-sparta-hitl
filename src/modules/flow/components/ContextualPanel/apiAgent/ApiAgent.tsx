import { useCallback, useMemo } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import useAncestorValueOptions from "@/modules/flow/hooks/useAncestorValueOptions";
import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";

import ApiAgentSet from "./ApiAgentSet";
import { ApiBodyCode } from "./ApiBodyCode";
import { SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import NodeIOSection, { IOSectionConfig } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeInputItem, NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const headersConfig: IOSectionConfig = {
  title: "Headers",
  headerActions: ({ handlers: { handleAddInput } }) => (
    <SectionTitleButton onClick={() => handleAddInput?.({ label: "String", value: "String" })}>
      <PlusIcon />
    </SectionTitleButton>
  ),
};

const paramsConfig: IOSectionConfig = {
  title: "Parameters",
  headerActions: ({ handlers: { handleAddInput } }) => (
    <SectionTitleButton onClick={() => handleAddInput?.({ label: "String", value: "String" })}>
      <PlusIcon />
    </SectionTitleButton>
  ),
};

function ApiAgent() {
  const selectedNode = useSelectedNode<NodeVariant<"agent", "APIAgent">>()!;
  const valueOptions = useAncestorValueOptions(selectedNode?.id);

  const onChange = useFlowStore((state) => state.onChange);
  const handleChange = useCallback(
    (field: string) => (next: NodeInputItem[]) => {
      if (!selectedNode) return;
      onChange(selectedNode.id, `inputs.${field}`, next);
    },
    [onChange, selectedNode]
  );

  const handleChangeHeaders = useMemo(() => handleChange("headers"), [handleChange]);
  const handleChangeParams = useMemo(() => handleChange("params"), [handleChange]);

  const { treeRoots: headersTreeRoots, ...headersHandlers } = useNodeIOItem({
    items: selectedNode?.data.inputs.headers,
    onChange: handleChangeHeaders,
    addTemporaryPlaceholder: true,
  });

  const { treeRoots: paramsTreeRoots, ...paramsHandlers } = useNodeIOItem({
    items: selectedNode?.data.inputs.params,
    onChange: handleChangeParams,
    addTemporaryPlaceholder: true,
  });

  return (
    <>
      <ApiAgentSet />
      <NodeIOSection roots={headersTreeRoots} handlers={headersHandlers} valueOptions={valueOptions} selectedNode={selectedNode} {...headersConfig} />
      <NodeIOSection roots={paramsTreeRoots} handlers={paramsHandlers} valueOptions={valueOptions} selectedNode={selectedNode} {...paramsConfig} />
      <ApiBodyCode />
    </>
  );
}

export default ApiAgent;
