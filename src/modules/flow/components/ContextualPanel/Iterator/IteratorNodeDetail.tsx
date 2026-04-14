import { Fragment, useCallback, useMemo } from "react";

import { useShallow } from "zustand/react/shallow";

import { useAncestorValueOptions } from "@/modules/flow/hooks/useAncestorValueOptions";
import { useNodeOutputToggle } from "@/modules/flow/hooks/useNodeOutputToggle";
import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import { InputTagRow, SelectTag } from "@/components/common/input-tags";
import { SliderWithInput } from "@/components/common/slider-with-input";
import { InputTag, NonNullableOption } from "@/components/ui/input-tag";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NODE_CATEGORY_COLOR, NodeIconsMapping } from "@/constants";
import { VariableTag } from "@/modules/dataset/components/mapping-grid";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { IteratorNodeInputs, NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

export const IteratorNodeDetails = () => {
  const selectedNode = useSelectedNode() as NodeVariant<"iterator">;
  const inputs = useMemo(() => selectedNode?.data?.inputs || {}, [selectedNode]);
  const { max_iterations: maxIterations = 50, iterable, type = "for", exit_condition: exitCondition = [] } = inputs;
  const selectedNodeId = selectedNode?.id || "";
  const { onChange, nodes } = useFlowStore(
    useShallow((state) => ({
      onChange: state.onChange,
      nodes: state.nodes,
    }))
  );

  const { onToggle, isOutputActive } = useNodeOutputToggle();

  const nodesInsideIterator = useMemo(() => {
    return nodes.filter((node) => node.parentId === selectedNodeId);
  }, [nodes, selectedNodeId]);

  const options = useAncestorValueOptions(selectedNodeId);
  const optionsWithIterable = useMemo(() => {
    if (!iterable || !iterable.value) return options;
    return [
      {
        label: selectedNode.id,
        value: selectedNode.id,
        children: [
          {
            label: "Item",
            value: selectedNode.id + "." + "item",
            keywords: [selectedNode.id, "item", `${selectedNode.id}.item`],
            isReference: true,
          },
          {
            label: "Index",
            value: selectedNode.id + "." + "index",
            keywords: [selectedNode.id, "index", `${selectedNode.id}.index`],
            isReference: true,
          },
        ],
      },
      ...options,
    ];
  }, [iterable, selectedNode, options]);

  const handleIteratorChange = useCallback(
    (iterableValue: NonNullableOption) => {
      const inputData: IteratorNodeInputs = { ...inputs, iterable: iterableValue };
      onChange(selectedNodeId, "inputs", inputData);
    },
    [inputs, onChange, selectedNodeId]
  );

  const handleChangeCondition = useCallback(
    (conditionValues: NonNullableOption[]) => {
      const inputData: IteratorNodeInputs = { ...inputs, exit_condition: conditionValues };
      onChange(selectedNodeId, "inputs", inputData);
    },
    [inputs, onChange, selectedNodeId]
  );

  return (
    <div className="flex flex-col">
      <SectionContainer>
        <SectionTitle title="Iteration type" />
        <div className="flex items-center pb-3">
          <Tabs
            defaultValue={type}
            value={type}
            onValueChange={(value: string) => {
              onChange(selectedNodeId, "inputs", { ...inputs, type: value });
            }}
            className="flex items-start"
          >
            <TabsList className="w-full h-fit flex items-center justify-start p-1 rounded-lg bg-secondary">
              <TabsTrigger
                value="for"
                className="max-w-[61px] min-w-[56px] data-[state=active]:bg-background data-[state=active]:rounded-md py-1.5 px-3"
              >
                For
              </TabsTrigger>
              <TabsTrigger
                value="while"
                className="max-w-[62px] min-w-[56px] data-[state=active]:bg-background data-[state=active]:rounded-md py-1.5 px-3"
              >
                While
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </SectionContainer>
      <SectionContainer>
        <SectionTitle title="Iterable" />
        <div className="flex items-center pb-3">
          <InputTag.Root variant="emphasized">
            <SelectTag selectedOption={iterable} options={options} onOptionChange={(data) => handleIteratorChange(data)} />
          </InputTag.Root>
        </div>
      </SectionContainer>
      {type === "while" && (
        <>
          <SectionContainer>
            <SectionTitle title="Max Iterations" tooltip="The maximum number of iterations for the loop." />
            <div className="flex items-center gap-3">
              <SliderWithInput
                className="w-full"
                key="whileIterations"
                value={maxIterations}
                onChange={(value) => {
                  const inputData = { ...inputs, max_iterations: value };
                  onChange(selectedNodeId, "inputs", inputData);
                }}
                min={1}
                max={99}
                step={1}
              />
            </div>
          </SectionContainer>
          <SectionContainer>
            <SectionTitle title="Execution Condition" />
            <div className="flex items-start gap-2">
              <div className="flex gap-9 items-center">
                <span className="text-sm font-medium tracking-wide w-12">While</span>
                <div className="flex flex-col w-full gap-y-2 pl-2">
                  <InputTagRow initialDataRow={exitCondition} options={optionsWithIterable} onDataChange={(data) => handleChangeCondition(data)} />
                </div>
              </div>
            </div>
          </SectionContainer>
        </>
      )}
      <SectionContainer>
        <SectionTitle title="Output From Iterator" tooltip="The output generated by the iterator" />
        <div className="flex flex-col justify-center pb-3">
          {nodesInsideIterator.length === 0 ? (
            <span className="text-sm text-muted-foreground">No nodes inside the iterator.</span>
          ) : (
            nodesInsideIterator.map((node) => {
              const name = node.data.name;
              const Icon = name ? NodeIconsMapping[name] : null;
              const colorVar = NODE_CATEGORY_COLOR[name] || "var(--foreground)";
              return (
                <Fragment key={node.id}>
                  <div className="flex items-center gap-2 pt-3">
                    {Icon && (
                      <Icon
                        className="size-6 duration-[800ms] ease-in-out flex-shrink-0"
                        style={{
                          color: `hsl(${colorVar})`,
                        }}
                      />
                    )}
                    <span className="text-sm">{node.data.label || node.id}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 py-2">
                    {node.data.outputs?.length === 0 ? (
                      <span className="text-sm text-muted-foreground">No Outputs Found</span>
                    ) : (
                      node.data.outputs
                        ?.filter((o) => o.key)
                        .map((o) => {
                          const refKey = `${node.id}.${o.originalOutputId || ""}.${o.id}`;
                          const label = o.key;
                          const isActive = isOutputActive(selectedNode.data.outputs || [], o, node.id);
                          return (
                            <button key={refKey} onClick={() => onToggle(node, o)} className="cursor-pointer">
                              <VariableTag key={refKey} label={label} isActive={isActive} type={o.type} />
                            </button>
                          );
                        })
                    )}
                  </div>
                </Fragment>
              );
            })
          )}
        </div>
      </SectionContainer>
    </div>
  );
};

export default IteratorNodeDetails;
