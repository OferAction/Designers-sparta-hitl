import { useMemo } from "react";

import { RunNodeSectionProps, ScopeSectionProps } from "./types";
import { Combobox } from "@/components/ui/combobox";
import { NonNullableOption as Option } from "@/components/ui/input-tag";
import { NODE_ICONS_MAP } from "@/constants";
import { useFlowStore } from "@/store";

export const ScopeSection = ({ selectedNode, setSelectedNode, scope }: ScopeSectionProps) => {
  return (
    <div className="py-6 flex flex-col gap-2">
      <h2 className="text-xs text-sidebar-foreground/70 pb-3">{`Run ${scope === "run-path" ? "scope" : "node"}`}</h2>
      <div className="py-1.5">
        {scope === "run-path" && <RunPathSection selectedNode={selectedNode} setSelectedNode={setSelectedNode} />}
        {scope === "run-node" && <RunNodeSection selectedNode={selectedNode} setSelectedNode={setSelectedNode} />}
      </div>
    </div>
  );
};

const RunPathSection = ({ selectedNode, setSelectedNode }: RunNodeSectionProps) => {
  const nodes = useFlowStore((state) => state.nodes);
  const options: Option[] = useMemo(() => {
    return nodes.map((node) => ({
      value: node.id,
      label: node.data.label || node.id,
      icon: NODE_ICONS_MAP(node.data.name),
    }));
  }, [nodes]);

  const startNode = useMemo(() => {
    const n = nodes.find((node) => node.data.type === "start");
    if (!n) return null;
    return {
      value: n?.id,
      // label: n?.id ,
      label: "Start",
      icon: NODE_ICONS_MAP(n?.data.name),
    };
  }, [nodes]);

  return (
    <span className="text-sm">
      <div className="w-fit flex items-center gap-1.5">
        <Combobox disabled options={[]} value={startNode} onChange={() => {}} placeholder="Select node..." />
        <span className="text-muted-foreground">till</span>

        <div className="max-w-[300px] flex-1 ">
          <Combobox
            options={options}
            value={selectedNode}
            onChange={(opt) => setSelectedNode(opt)}
            placeholder="Select node..."
            contentClassName="max-w-[320px] min-w-[180px]"
          />
        </div>
      </div>
    </span>
  );
};

const RunNodeSection = ({ selectedNode, setSelectedNode }: RunNodeSectionProps) => {
  const nodes = useFlowStore((state) => state.nodes);
  const options: Option[] = useMemo(() => {
    return nodes.map((node) => ({
      value: node.id,
      label: node.data.label || node.id,
      icon: NODE_ICONS_MAP(node.data.name),
    }));
  }, [nodes]);

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-sm text-muted-foreground">Run only</span>
      <div className="flex-1 max-w-[300px]">
        <Combobox
          options={options}
          value={selectedNode}
          onChange={(opt) => setSelectedNode(opt)}
          placeholder="Select node..."
          contentClassName="max-w-[320px] min-w-[180px]"
        />
      </div>
    </div>
  );
};
