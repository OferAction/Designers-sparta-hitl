import { useCallback } from "react";

import { XIcon } from "@phosphor-icons/react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { useUpdateNodeInternals } from "@xyflow/react";
import { useParams } from "react-router-dom";

import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import SystemRulesList from "./SystemRulesList";
import { RuleRouteDisplay } from "../shared";
import { openSystemRulesConfiguration, systemRuleHandleId } from "../shared/utils";
import { InputLabel } from "@/components/common/InputLabel";
import { Dialog } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { PanelDialogWrapper } from "@/modules/flow/components/dialog/PanelDialogWrapper";
import { useGetFileRoutingConfig } from "@/services/fileService/fileService";
import { useFlowStore } from "@/store";

export function SystemRulesHandlingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const selectedNode = useSelectedNode();
  const { fileId = "" } = useParams();
  const onChange = useFlowStore((s) => s.onChange);
  const updateNodeInternals = useUpdateNodeInternals();

  const { data: routingConfig } = useGetFileRoutingConfig(fileId);

  const defaultRouteDestination = routingConfig?.defaultSystemRoute;
  const systemRoutingEnabled = !!routingConfig?.systemRoutingEnabled;

  const isUsingDefault = selectedNode?.data?.rules?.isDefault ?? true;
  const nodeCustomRoute = selectedNode?.data?.rules?.route_on_system_rules;

  const handleToggleDefault = useCallback(
    (enabled: boolean) => {
      if (!selectedNode) return;
      const currentRules = selectedNode.data?.rules || {};
      const currentRouteHandles = Array.isArray(selectedNode.data?.routeHandles) ? selectedNode.data.routeHandles : [];
      const handleId = systemRuleHandleId(selectedNode.id);

      let updatedHandles: string[];
      if (enabled) {
        // Using default - set route to default destination node id, remove handle from routeHandles
        updatedHandles = currentRouteHandles.filter((h) => h !== handleId);
      } else {
        updatedHandles = currentRouteHandles.includes(handleId) ? currentRouteHandles : [...currentRouteHandles, handleId];
      }
      onChange(selectedNode.id, "routeHandles", updatedHandles);
      onChange(selectedNode.id, "rules", {
        ...currentRules,
        isDefault: enabled,
        route_on_system_rules: !enabled ? handleId : undefined,
      });
      queueMicrotask(() => updateNodeInternals(selectedNode.id));
    },
    [selectedNode, onChange, updateNodeInternals]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <PanelDialogWrapper
        position="none"
        className={cn(
          "w-[320px] border-border bg-ocr-modal-bg/30 backdrop-blur-[10px] left-auto top-start translate-x-0 translate-y-0 origin-center p-0"
        )}
      >
        <DialogTitle className="sr-only">System rules</DialogTitle>
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <h3 className="text-sm font-medium">System rules</h3>
          <button onClick={() => onOpenChange(false)} className="text-muted-foreground hover:text-foreground">
            <XIcon size={16} />
          </button>
        </div>
        <div className="flex flex-col overflow-y-auto max-h-[70vh]">
          <SystemRulesList />

          {systemRoutingEnabled && (
            <div className="border-t py-3 mt-3 px-4 space-y-3">
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <InputLabel variant="emphasized" size="lg" className="cursor-pointer select-none">
                      <span className="text-sm">Workflow default {isUsingDefault ? "ON" : "OFF"}</span>
                    </InputLabel>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" sideOffset={4} className="min-w-[180px]">
                    <DropdownMenuItem onClick={() => handleToggleDefault(true)} className="text-xs">
                      Workflow default (Auto) ON
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleDefault(false)} className="text-xs">
                      OFF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                {((isUsingDefault && !!defaultRouteDestination) || !isUsingDefault) && (
                  <RuleRouteDisplay
                    onClick={openSystemRulesConfiguration}
                    isDefault={isUsingDefault}
                    action="route"
                    targetNodeId={isUsingDefault ? defaultRouteDestination : undefined}
                    sourceNodeId={selectedNode?.id}
                    handleId={!isUsingDefault ? nodeCustomRoute : undefined}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </PanelDialogWrapper>
    </Dialog>
  );
}
