import { useShallow } from "zustand/shallow";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant } from "@/modules/flow/types";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  onChange: state.onChange,
});

function ApiAgentSet() {
  const { onChange } = useFlowStore(useShallow(selector));
  const selectedNode = useSelectedNode() as NodeVariant<"agent", "APIAgent">;
  const inputs = selectedNode?.data.inputs;
  const id = selectedNode?.id;

  return (
    <SectionContainer>
      <SectionTitle title="Set" tooltip="Set the API request method and URL" />
      <div className="flex items-center gap-2">
        <Select onValueChange={(value) => onChange(id, "inputs", { ...inputs, method: value })} defaultValue={inputs?.method || "GET"}>
          <SelectTrigger className="bg-background w-fit text-sm text-foreground border border-input">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="bg-background flex-grow text-sm text-foreground border border-input"
          placeholder="/ set URL"
          onChange={(e) => onChange(id, "inputs", { ...inputs, url: e.target.value })}
          value={inputs?.url || ""}
        />
      </div>
    </SectionContainer>
  );
}

export default ApiAgentSet;
