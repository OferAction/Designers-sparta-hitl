import { useState, useMemo } from "react";

import CommandNodeSections from "@/components/common/CommandNodeSections";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandList } from "@/components/ui/command";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Select, SelectTrigger } from "@/components/ui/select";
import type { ConnectorNode } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

export type ConnectorTemplate = { name: ConnectorNode; title: string };

type Props = {
  value?: string;
  onSelectConnector: (connector: ConnectorNode) => void;
  onSelectExistingNode?: (nodeId: string) => void;
  connectorTemplates: ConnectorTemplate[];
  label?: string;
  className?: string;
  disabled?: boolean;
};

export default function RouteDestinationSelect({ value, onSelectConnector, onSelectExistingNode, connectorTemplates, className, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const nodes = useFlowStore((state) => state.nodes);

  const selectedLabel = useMemo(() => {
    if (!value) return "Select destination...";
    const connector = connectorTemplates.find((c) => c.name === value);
    if (connector) return connector.title;
    const node = nodes.find((n) => n.id === value);
    if (node?.data?.label) return node.data.label as string;
    return value;
  }, [nodes, value, connectorTemplates]);

  const hiddenConnectorNodes = useMemo(() => {
    return nodes.filter((node) => node.hidden === true && node.type === "connector" && node.data?.name);
  }, [nodes]);

  const connectorSection = {
    title: "Connectors",
    options: connectorTemplates.map((c) => ({
      label: c.title,
      value: c.title,
      typeName: c.name,
      onSelect: () => {
        onSelectConnector(c.name);
        setOpen(false);
      },
    })),
  };

  const hiddenConnectorsSection =
    hiddenConnectorNodes.length > 0
      ? {
          title: "Other created connectors",
          options: hiddenConnectorNodes.map((node) => ({
            label: (node.data?.label as string) || (node.data?.name as string) || node.id,
            value: node.id,
            typeName: node.data?.name,
            onSelect: () => {
              if (onSelectExistingNode) {
                onSelectExistingNode(node.id);
              }
              setOpen(false);
            },
          })),
        }
      : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Select value={value} onValueChange={() => {}}>
        <PopoverTrigger asChild>
          <SelectTrigger className={className ?? "w-[80%]"} disabled={disabled}>
            <div className="flex items-center justify-between w-full">
              <span className="truncate text-sm">{selectedLabel}</span>
            </div>
          </SelectTrigger>
        </PopoverTrigger>

        <PopoverContent className="p-0" disablePortal>
          <Command>
            <CommandInput placeholder="Search connectors..." autoFocus />
            <CommandEmpty>No connectors found.</CommandEmpty>
            <CommandList>
              <CommandGroup>
                <CommandNodeSections sections={[connectorSection, hiddenConnectorsSection].filter(Boolean) as any[]} />
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Select>
    </Popover>
  );
}
