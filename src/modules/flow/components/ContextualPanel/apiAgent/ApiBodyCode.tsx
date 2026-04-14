import { useCallback } from "react";

import {
  CopyButton,
  ExpandButton,
  Terminal,
  TerminalContent,
  TerminalControls,
  TerminalCopyBadge,
  TerminalEditor,
  TerminalHeader,
  TerminalTitle,
} from "@/components/common/CodeTerminal";
import { ChangeLanguage } from "@/components/common/CodeTerminal/controls/ChangeLanguage";
import { Option } from "@/components/ui/input-tag/old-deprecated/InputTag/types";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const LANGUAGES = [
  {
    label: "Python",
    value: "python",
  },
  {
    label: "JSON",
    value: "json",
  },
  {
    label: "YAML",
    value: "yaml",
  },
];

export const ApiBodyCode = () => {
  const selectedNode = useSelectedNode() as NodeVariant<"agent", "APIAgent">;
  const onChange = useFlowStore((state) => state.onChange);
  const selectedNodeId = selectedNode?.id;
  const selectedNodeInputs = selectedNode?.data.inputs;

  const onChangeCode = useCallback(
    (value: string) => {
      try {
        onChange(selectedNodeId, "inputs", {
          ...selectedNodeInputs,
          data: value,
        });
      } catch (error) {
        console.warn("Invalid JSON format:", error);
      }
    },
    [onChange, selectedNodeId, selectedNodeInputs]
  );
  const handleChangeLanguage = useCallback(
    (language: Option) => {
      onChange(selectedNodeId, "inputs", { ...selectedNodeInputs, language: language.value });
    },
    [onChange, selectedNodeId, selectedNodeInputs]
  );
  return (
    <SectionContainer>
      <Terminal variant="input" className="h-full flex flex-1 bg-sidebar border-none">
        <TerminalHeader className="relative px-0 flex items-center border-none">
          <TerminalTitle>
            <SectionTitle title="Body" />
          </TerminalTitle>
          <TerminalCopyBadge className="absolute -top-8 -right-3 bg-background px-3 py-1 font-normal text-popover-foreground border border-border" />
          <TerminalControls>
            <ChangeLanguage iconClassName="rotate-90" value={selectedNodeInputs.language} options={LANGUAGES} onChange={handleChangeLanguage} />
            <ExpandButton />
            <CopyButton value={selectedNodeInputs.data} />
          </TerminalControls>
        </TerminalHeader>
        <TerminalContent>
          <TerminalEditor
            onChange={onChangeCode}
            className="h-[200px] rounded-lg my-1.5 border-input border overflow-hidden"
            language="json"
            value={selectedNodeInputs.data}
          />
        </TerminalContent>
      </Terminal>
    </SectionContainer>
  );
};
