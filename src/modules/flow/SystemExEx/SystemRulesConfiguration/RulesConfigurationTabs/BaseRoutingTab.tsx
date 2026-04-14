import { ReactNode, useMemo } from "react";

import { QuestionIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { OutlookConfiguration, shouldRenderOutlookConfiguration } from "../outlookRouting";
import RouteDestinationSelect, { ConnectorTemplate } from "../RouteDestinationSelect";
import DefaultRoutingToggle from "@/components/common/DefaultRoutingToggle";
import WithTooltip from "@/components/common/WithTooltip";
import { Button } from "@/components/ui/button";
import type { ConnectorNode } from "@/modules/flow/types";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (routeDestination: string) => (state: FlowStoreState) => ({
  node: state.nodes.find((n) => n.id === routeDestination),
});

type BaseRoutingTabProps = {
  title?: string;
  tooltip?: string;
  routingDescription?: string;
  routeValue: string | undefined;
  routingEnabled: boolean;
  connectorTemplates: ConnectorTemplate[];
  onToggle: (enabled: boolean) => void;
  onSelectConnector: (connectorName: ConnectorNode) => void;
  onSelectExistingNode?: (nodeId: string) => void;
  additionalContent?: ReactNode;
  className?: string;
};

export const BaseRoutingTab: React.FC<BaseRoutingTabProps> = ({
  title,
  tooltip,
  routingDescription,
  routeValue,
  routingEnabled,
  connectorTemplates,
  onToggle,
  onSelectConnector,
  onSelectExistingNode,
  additionalContent,
  className = "space-y-4 max-h-[70vh] h-full overflow-y-auto thin-scrollbar px-6",
}) => {
  const selectorCallback = useMemo(() => selector(routeValue ?? ""), [routeValue]);
  const { node } = useFlowStore(useShallow(selectorCallback));
  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {title && <h2 className="text-lg font-semibold text-primary">{title}</h2>}
        {tooltip && (
          <WithTooltip tooltip={tooltip} side="right">
            <Button variant="ghost" className="!p-1.5px size-fit">
              <QuestionIcon className="size-4 text-sidebar-foreground/70" />
            </Button>
          </WithTooltip>
        )}
      </div>

      {additionalContent}

      <div className="mt-2">
        <div className="text-sm mb-2.5">Configure routing</div>
        <p className="text-sm text-muted-foreground mb-4">{routingDescription}</p>
      </div>

      <DefaultRoutingToggle enabled={routingEnabled} onToggle={onToggle}>
        <div className="w-full">
          <label className="text-xs font-medium mb-1 block text-sidebar-foreground/70">Set route destination</label>
          <RouteDestinationSelect
            value={routeValue}
            connectorTemplates={connectorTemplates}
            onSelectConnector={onSelectConnector}
            onSelectExistingNode={onSelectExistingNode}
          />
        </div>
        {routeValue && shouldRenderOutlookConfiguration(routeValue, node) && <OutlookConfiguration nodeId={routeValue} />}
      </DefaultRoutingToggle>
    </div>
  );
};
