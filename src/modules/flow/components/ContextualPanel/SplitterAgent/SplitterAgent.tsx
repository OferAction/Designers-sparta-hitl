import { useCallback, useMemo } from "react";

import { CaretDownIcon } from "@phosphor-icons/react";
import { produce } from "immer";

import useAncestorValueOptions from "@/modules/flow/hooks/useAncestorValueOptions";
import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";

import { SectionContainer } from "../SectionContainer";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import NodeIOSection from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { useSelectedNode } from "@/modules/flow/hooks";
import type { NodeInputItem, NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

export const SplitterAgent = () => {
  const onChange = useFlowStore((state) => state.onChange);
  const selectedNode = useSelectedNode<NodeVariant<"agent", "splitterAgent">>();
  const selectedNodeId = selectedNode?.id;
  const options = useAncestorValueOptions(selectedNodeId || "");

  const handleValueChange = useCallback(
    (selectedInput: NodeInputItem[]) => {
      if (!selectedNodeId) return;

      const currentInputs = selectedNode?.data?.inputs || {};

      if (!selectedInput || selectedInput.length === 0) {
        const newInputs = produce(currentInputs, (draft) => {
          draft.pdf_url.value = { label: "", value: "" };
        });
        onChange(selectedNodeId, "inputs", newInputs);
        return;
      }

      const newOption = selectedInput[0];

      const newInputs = produce(currentInputs, (draft) => {
        draft.pdf_url.value = {
          ...newOption.value,
          isReference: true,
        };
      });
      onChange(selectedNodeId, "inputs", newInputs);
    },
    [selectedNodeId, onChange, selectedNode?.data?.inputs]
  );

  const items: NodeInputItem[] = useMemo(() => {
    return [
      {
        id: "items",
        key: "items",
        type: "List",
        value: selectedNode?.data?.inputs?.pdf_url?.value || { label: "", value: "" },
      },
    ];
  }, [selectedNode?.data?.inputs]);

  const { treeRoots, onValueChange } = useNodeIOItem({
    items,
    onChange: handleValueChange,
  });

  if (!selectedNode || !selectedNodeId) {
    return null;
  }

  return (
    <>
      <NodeIOSection
        title="Iterable"
        roots={treeRoots}
        handlers={{
          onValueChange,
        }}
        selectedNode={selectedNode}
        getItemProps={() => {
          return {
            readOnly: { key: true, type: true },
            hidden: { key: true },
            className: "text-white w-fit  max-w-48",
            placeholder: "type a value or @",
          };
        }}
        valueOptions={options}
      />
      <SectionContainer>
        <SectionTitle title="Settings" className="text-sidebar-foreground"></SectionTitle>
        <div className="flex gap-3">
          <div className="w-full flex flex-col gap-2">
            <span className="text-muted-foreground font-semibold text-xs">DPI value</span>
            <Input
              variant="tag"
              className="bg-background rounded-lg"
              placeholder="Enter DPI value"
              type="number"
              defaultValue={selectedNode?.data?.inputs?.dpi || ""}
              onChange={(e) => {
                onChange(selectedNodeId, "inputs.dpi", Number(e.target.value));
              }}
            />
          </div>
          <div className="w-full flex flex-col gap-2">
            <span className="text-muted-foreground font-semibold text-xs">Image Format</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="max-h-10 text-muted-foreground  border-input bg-background text-sm rounded-md justify-between focus:outline focus:outline-foreground focus:outline-offset-2 data-[state=open]:outline data-[state=open]:outline-foreground data-[state=open]:outline-offset-2"
                >
                  {selectedNode?.data?.inputs?.output_format || "Select format"}
                  <CaretDownIcon className="h-4 w-4 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[var(--radix-dropdown-menu-trigger-width)] rounded-md border-border bg-background shadow-md"
              >
                <DropdownMenuItem
                  onClick={() => {
                    onChange(selectedNodeId, "inputs.output_format", "PNG");
                  }}
                  className="rounded-md focus:bg-accent focus:text-accent-foreground"
                >
                  PNG
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onChange(selectedNodeId, "inputs.output_format", "JPG");
                  }}
                  className="rounded-md focus:bg-accent focus:text-accent-foreground"
                >
                  JPG
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    onChange(selectedNodeId, "inputs.output_format", "JPEG");
                  }}
                  className="rounded-md focus:bg-accent focus:text-accent-foreground"
                >
                  JPEG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SectionContainer>
    </>
  );
};

export default SplitterAgent;
