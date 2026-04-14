import { useMemo } from "react";

import { QuestionIcon } from "@phosphor-icons/react";
import { useParams } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";

import { useSystemRulesConfiguration } from "@/modules/flow/hooks/useSystemRulesConfiguration";
import { useUpdateFileRouting } from "@/modules/flow/hooks/useUpdateFileRouting";

import { OutlookConfiguration, shouldRenderOutlookConfiguration } from "../outlookRouting";
import RouteDestinationSelect from "../RouteDestinationSelect";
import { SystemRulesList } from "./SystemRulesList";
import DefaultRoutingToggle from "@/components/common/DefaultRoutingToggle";
import WithTooltip from "@/components/common/WithTooltip";
import { Button } from "@/components/ui/button";
import { ConnectorNode } from "@/modules/flow/types/BaseNodeTypes";
import { useGetFileRoutingConfig } from "@/services/fileService/fileService";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (routeDestination: string) => (state: FlowStoreState) => ({
  node: state.nodes.find((n) => n.id === routeDestination),
});

export const SystemRulesTab: React.FC = () => {
  const { fileId = "" } = useParams();
  const { data: routingConfig } = useGetFileRoutingConfig(fileId);

  const routeDestination = routingConfig?.defaultSystemRoute || "";
  const systemRoutingEnabled = routingConfig?.systemRoutingEnabled || false;

  const callbackSelector = useMemo(() => selector(routeDestination), [routeDestination]);
  const { node } = useFlowStore(useShallow(callbackSelector));
  const { updateRouting } = useUpdateFileRouting();

  const { connectorTemplates, handleConnectorSelection, hasRouting } = useSystemRulesConfiguration();

  const handleToggle = (enabled: boolean) => {
    updateRouting({ systemRoutingEnabled: enabled });
  };

  const handleConnectorSelectWrapper = (connectorName: ConnectorNode) => {
    handleConnectorSelection(connectorName, (id: string) => {
      updateRouting({ defaultSystemRoute: id });
    });
  };

  const handleSelectExistingNode = (nodeId: string) => {
    updateRouting({ defaultSystemRoute: nodeId });
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto thin-scrollbar">
      <div className="flex items-center gap-2 px-6">
        <h2 className="text-lg font-semibold text-primary">System rules</h2>
        <WithTooltip tooltip={"Configure system rules and routing options"} side="right">
          <Button variant="ghost" className="!p-1.5px size-fit">
            <QuestionIcon className="size-4 text-sidebar-foreground/70" />
          </Button>
        </WithTooltip>
      </div>

      <SystemRulesList />

      <div className="my-2" />

      {hasRouting ? (
        <div className="mt-4 px-8">
          <div className="text-sm mb-2.5">Configure routing</div>
          <p className="text-sm text-muted-foreground mb-4">Define default routing for all system exceptions</p>

          <DefaultRoutingToggle enabled={systemRoutingEnabled} onToggle={handleToggle}>
            <div className="w-full">
              <label className="text-xs font-medium mb-1 block text-sidebar-foreground/70">Set route destination</label>
              <RouteDestinationSelect
                value={routeDestination}
                connectorTemplates={connectorTemplates}
                onSelectConnector={handleConnectorSelectWrapper}
                onSelectExistingNode={handleSelectExistingNode}
              />
            </div>

            {shouldRenderOutlookConfiguration(routeDestination, node) && <OutlookConfiguration nodeId={routeDestination} />}
          </DefaultRoutingToggle>
        </div>
      ) : null}
    </div>
  );
};
