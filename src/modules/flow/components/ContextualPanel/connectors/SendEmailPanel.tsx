import { useMemo } from "react";

import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react";

import useAncestorValueOptions from "@/modules/flow/hooks/useAncestorValueOptions";

import { DynamicField } from "../../IO";
import {
  CopyButton,
  ExpandButton,
  Terminal,
  TerminalContent,
  TerminalControls,
  TerminalCopyBadge,
  TerminalHeader,
  TerminalTitle,
} from "@/components/common/CodeTerminal";
import WithTooltip from "@/components/common/WithTooltip";
import { Input } from "@/components/ui/input";
import { Option } from "@/components/ui/input-tag";
import { Label } from "@/components/ui/label";
import MultiInput from "@/components/ui/multi-input";
import { useSelectedNode } from "@/modules/flow/hooks";
import { getDefaultExceptionMessage } from "@/modules/flow/SystemExEx/SystemRulesConfiguration/constants";
import { usePortalContainer } from "@/modules/flow/SystemExEx/SystemRulesConfiguration/PortalContainerContext";
import { NodeVariant, OutlookInputType } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

function SendEmailPanel({
  nodeId,
  systemVariables,
  showRestoreDefault = false,
}: {
  nodeId?: string;
  systemVariables?: Option[];
  showRestoreDefault?: boolean;
}) {
  const onChange = useFlowStore((state) => state.onChange);
  const nodes = useFlowStore((state) => state.nodes);
  const selectedFromStore = useSelectedNode<NodeVariant<"connector", "outlook">>();
  const selectedNode = nodeId ? (nodes.find((n) => n.id === nodeId) as NodeVariant<"connector", "outlook"> | undefined) : selectedFromStore;
  const inputs = selectedNode?.data.inputs;
  const ancestorOptions = useAncestorValueOptions(selectedNode?.id);
  const portalContainer = usePortalContainer();
  const defaultExecptionMessage = getDefaultExceptionMessage();

  const valueOptions = useMemo(() => {
    const options = systemVariables ? [...ancestorOptions, ...systemVariables] : ancestorOptions;
    return options.filter((opt): opt is NonNullable<typeof opt> => opt !== null);
  }, [ancestorOptions, systemVariables]);

  // Memoize input indices for direct access
  const inputIndices = useMemo(() => {
    if (!inputs) return {};

    const indices: Partial<Record<OutlookInputType["key"], number>> = {};
    inputs.forEach((input, index) => {
      indices[input.key] = index;
    });
    return indices;
  }, [inputs]);

  const getInputByKey = <K extends OutlookInputType["key"]>(key: K): Extract<OutlookInputType, { key: K }> | undefined => {
    const index = inputIndices[key];
    if (index !== undefined && inputs?.[index]) {
      return inputs[index] as Extract<OutlookInputType, { key: K }>;
    }
    return undefined;
  };

  function handleChange<T = string>(key: OutlookInputType["key"], value: T) {
    const index = inputIndices[key];
    if (selectedNode?.id && index !== undefined) {
      onChange(selectedNode.id, `inputs.${index}.value.value`, value);
    }
  }

  function handleRestoreDefault() {
    if (defaultExecptionMessage) {
      handleChange("body", defaultExecptionMessage);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="space-y-1">
        <Label>Send To</Label>
        <MultiInput
          placeholder="Type email and press Enter, supports multiple"
          className="bg-background"
          defaultValue={(getInputByKey("to")?.value?.value as string[]) ?? []}
          onValueChange={(vals) => handleChange("to", vals)}
          validationRegex={/.+@.+\..+/}
        />
      </div>
      <div className="space-y-1">
        <Label>Subject</Label>
        <Input
          placeholder="Ex: Invoices"
          className="bg-background"
          onChange={(e) => handleChange("subject", e.target.value)}
          value={(getInputByKey("subject")?.value?.value as string) ?? ""}
        />
      </div>
      <div className="space-y-1">
        <Terminal className="h-full border-none">
          <TerminalHeader className="relative !bg-sidebar !border-none pl-0">
            <TerminalTitle>Body</TerminalTitle>
            <TerminalCopyBadge className="absolute -top-8 -right-3 bg-background px-3 py-1 font-normal text-popover-foreground border border-border" />
            <TerminalControls>
              <ExpandButton />
              <CopyButton value={(getInputByKey("body")?.value?.value as string) ?? ""} />
            </TerminalControls>
          </TerminalHeader>
          <TerminalContent>
            <DynamicField
              className="min-h-[80px]"
              scope={valueOptions}
              onChange={(val) => handleChange("body", val)}
              value={(getInputByKey("body")?.value?.value as string) ?? ""}
              portalContainer={portalContainer?.current}
            >
              {showRestoreDefault && defaultExecptionMessage && (
                <WithTooltip tooltip="Restore to default message">
                  <ArrowCounterClockwiseIcon
                    onClick={handleRestoreDefault}
                    className="absolute top-2 right-2 z-10 size-4 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  />
                </WithTooltip>
              )}
            </DynamicField>
          </TerminalContent>
        </Terminal>
      </div>
    </div>
  );
}

export default SendEmailPanel;
