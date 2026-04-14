import { ChangeEvent, useCallback, useMemo } from "react";

import {
  CopyButton,
  ExpandButton,
  Terminal,
  TerminalContent,
  TerminalControls,
  TerminalEditor,
  TerminalHeader,
  TerminalTitle,
  TerminalCopyBadge,
} from "@/components/common/CodeTerminal";
import { ChangeLanguage } from "@/components/common/CodeTerminal/controls/ChangeLanguage";
import { UploadButton } from "@/components/common/CodeTerminal/controls/UploadButton";
import { Option } from "@/components/ui/input-tag/old-deprecated/InputTag/types";
import { Textarea } from "@/components/ui/textarea";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";
import { cn } from "@/utils";

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

export const CodeSection = () => {
  const selectedNode = useSelectedNode() as NodeVariant<"agent", "customCodeAgent">;
  const selectedNodeInputs = selectedNode?.data.inputs;
  const selectedNodeId = selectedNode?.id;
  const onChange = useFlowStore((state) => state.onChange);

  const dependencies = useMemo(() => {
    return selectedNodeInputs.dependencies.join("\n");
  }, [selectedNodeInputs.dependencies]);

  const onChangeCode = useCallback(
    (value: string) => {
      onChange(selectedNodeId, "inputs", {
        ...selectedNodeInputs,
        code: value,
      });
    },
    [onChange, selectedNodeId, selectedNodeInputs]
  );

  const onChangeDependencies = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(selectedNodeId, "inputs", {
        ...selectedNodeInputs,
        dependencies: e.target.value.split("\n"),
      });
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
    <>
      <SectionContainer>
        <Terminal variant="input" className="h-full flex flex-1 bg-sidebar border-none max-h-[80vh]">
          <TerminalHeader className="relative px-0 flex items-center border-none">
            <TerminalTitle>
              <SectionTitle title="Code" />
            </TerminalTitle>
            <TerminalCopyBadge className="absolute -top-8 -right-3 bg-background px-3 py-1 font-normal text-popover-foreground border border-border" />
            <TerminalControls>
              <ChangeLanguage iconClassName="rotate-90" value={selectedNodeInputs.language} options={LANGUAGES} onChange={handleChangeLanguage} />
              <ExpandButton />
              <CopyButton value={selectedNodeInputs.code} />
            </TerminalControls>
          </TerminalHeader>
          <TerminalContent>
            <TerminalEditor
              language={selectedNodeInputs.language}
              value={selectedNodeInputs.code}
              onChange={onChangeCode}
              className="resize-y h-[200px] rounded-lg my-1.5 border-input border overflow-hidden max-h-[70vh]"
            />
          </TerminalContent>
        </Terminal>
      </SectionContainer>

      <SectionContainer>
        <Terminal variant="input" className="h-full flex flex-1 bg-sidebar border-none">
          <TerminalHeader className="px-0 flex items-center border-none">
            <TerminalTitle className="flex items-center gap-1">
              <SectionTitle title="Dependencies" />
            </TerminalTitle>
            <TerminalControls>
              <ExpandButton />
              <UploadButton value={dependencies} className={cn(!dependencies && "opacity-50 pointer-events-none")} />
            </TerminalControls>
          </TerminalHeader>
          <TerminalContent>
            <Textarea
              value={dependencies}
              rows={2}
              placeholder={"Add dependencies here\ne.g. azure-storage-blob==12.24.0"}
              className="rounded-lg my-1 border-input border overflow-scroll"
              onChange={onChangeDependencies}
            />
          </TerminalContent>
        </Terminal>
      </SectionContainer>
    </>
  );
};
