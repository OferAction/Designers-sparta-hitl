import { useState, useRef, useCallback, useLayoutEffect } from "react";

import { PlaceholderIcon } from "@phosphor-icons/react";

import useClickOutside from "@/hooks/useClickOutside";

import { ACTION_META } from "./constants";
import { RuleRouteDisplay } from "./RuleRouteDisplay";
import RouteIllustration from "@/assets/Rule-route-ill.svg";
import { InputLabel } from "@/components/common/InputLabel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";

export type RuleAction = "route" | "continue" | "terminate";

export interface RuleHandlingProps {
  action: RuleAction;
  onActionChange: (action: RuleAction) => void;
  terminateOnFail: boolean;
  onTerminateOnFailChange: (terminate: boolean) => void;
  className?: string;
  showRouteIllustration?: boolean;
  defaultRouteEnabled?: boolean;
  defaultRouteNodeId?: string;
  isDefault?: boolean;
  onDefaultChange?: (isDefault: boolean) => void;
  ruleHandleId?: string;
  selectedNodeId?: string;
}

export function RuleHandling({
  action,
  onActionChange,
  terminateOnFail,
  onTerminateOnFailChange,
  className,
  showRouteIllustration = true,
  defaultRouteEnabled,
  defaultRouteNodeId,
  isDefault,
  onDefaultChange,
  ruleHandleId,
  selectedNodeId,
}: RuleHandlingProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [failMenuOpen, setFailMenuOpen] = useState(false);
  const [menuPlacement, setMenuPlacement] = useState<"top" | "bottom">("top");
  const [failPlacement, setFailPlacement] = useState<"top" | "bottom">("top");
  const actionRef = useRef<HTMLDivElement | null>(null);
  const failRef = useRef<HTMLDivElement | null>(null);

  const decidePlacement = useCallback((el: HTMLElement | null): "top" | "bottom" => {
    if (!el) return "bottom";
    const rect = el.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedRowHeight = 28;
    const estimatedPadding = 12;
    const maxItemsPossible = 3;
    const estimatedHeight = maxItemsPossible * estimatedRowHeight + estimatedPadding;
    const enoughBelow = spaceBelow >= estimatedHeight;
    const enoughAbove = spaceAbove >= estimatedHeight;
    if (enoughBelow && !enoughAbove) return "bottom";
    if (enoughAbove && !enoughBelow) return "top";
    if (enoughAbove && enoughBelow) {
      if (spaceBelow >= spaceAbove * 0.95) return "bottom";
      return "top";
    }
    return spaceBelow >= spaceAbove ? "bottom" : "top";
  }, []);

  useLayoutEffect(() => {
    if (menuOpen) setMenuPlacement(decidePlacement(actionRef.current));
  }, [menuOpen, decidePlacement]);
  useLayoutEffect(() => {
    if (failMenuOpen) setFailPlacement(decidePlacement(failRef.current));
  }, [failMenuOpen, decidePlacement]);

  useClickOutside(actionRef, () => setMenuOpen(false));
  useClickOutside(failRef, () => setFailMenuOpen(false));

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between py-2 border-border/50">
        <span className="text-xs font-medium text-sidebar-foreground pr-4">Handling</span>
        <div ref={actionRef} className="relative inline-block text-left">
          <InputLabel
            variant="emphasized"
            size="md"
            onClick={() => setMenuOpen((o) => !o)}
            className={cn("cursor-pointer select-none pr-1 pl-2 min-w-[92px] justify-center", menuOpen && "border-border/60 bg-muted/50")}
            icon={action === "terminate" ? <PlaceholderIcon size={16} weight="fill" className="text-muted-foreground" /> : undefined}
            value={ACTION_META[action].label}
          />
          {menuOpen && (
            <div
              className={cn(
                "absolute right-0 z-20 overflow-hidden rounded-md border border-border bg-popover shadow-md backdrop-blur-sm",
                menuPlacement === "bottom" ? "mt-1" : "mb-1",
                menuPlacement === "top" ? "bottom-full" : "top-full"
              )}
            >
              <ul className="py-1 text-xs">
                {(Object.keys(ACTION_META) as RuleAction[]).map((k) => {
                  const active = action === k;
                  return (
                    <li key={k}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-2 px-2 py-1.5 text-left transition",
                          active ? "bg-primary/10 text-foreground" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => {
                          onActionChange(k);
                          setMenuOpen(false);
                        }}
                      >
                        {k === "terminate" && <PlaceholderIcon size={16} weight="fill" className="opacity-80" />}
                        {ACTION_META[k].label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
      {action === "route" && (
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputLabel
                variant="emphasized"
                size="lg"
                className={cn("select-none", defaultRouteEnabled ? "cursor-pointer" : "cursor-default opacity-80")}
              >
                <span className="text-sm">Workflow default {isDefault && defaultRouteEnabled ? "ON" : "OFF"}</span>
              </InputLabel>
            </DropdownMenuTrigger>
            {defaultRouteEnabled && (
              <DropdownMenuContent align="start" sideOffset={4} className="min-w-[180px]">
                <DropdownMenuItem onClick={() => onDefaultChange?.(true)} className="text-xs">
                  Workflow default (Auto) ON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDefaultChange?.(false)} className="text-xs">
                  OFF
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
          {defaultRouteEnabled && defaultRouteNodeId && (
            <RuleRouteDisplay
              action="route"
              handleId={ruleHandleId}
              sourceNodeId={selectedNodeId}
              isDefault={!!isDefault}
              targetNodeId={isDefault ? defaultRouteNodeId : undefined}
            />
          )}
        </div>
      )}
      {!(isDefault && defaultRouteEnabled) && (
        <>
          <p className="text-sm leading-5 text-muted-foreground">{ACTION_META[action].description}</p>
          {action === "route" && showRouteIllustration && <img src={RouteIllustration} alt="Route illustration" className="max-w-full h-auto" />}
        </>
      )}
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs font-medium text-sidebar-foreground pr-4">When rule fail</span>
        <div ref={failRef} className="relative inline-block text-left">
          <InputLabel
            variant="emphasized"
            size="md"
            onClick={() => setFailMenuOpen((o) => !o)}
            className={cn("cursor-pointer select-none pr-1 pl-2 min-w-[92px] justify-center", failMenuOpen && "border-border/60 bg-muted/50")}
            icon={terminateOnFail ? <PlaceholderIcon size={16} weight="fill" className="text-muted-foreground" /> : undefined}
            value={terminateOnFail ? "Terminate" : "Continue"}
          />
          {failMenuOpen && (
            <div
              className={cn(
                "absolute right-0 w-22 overflow-hidden rounded-md border border-border bg-popover shadow-md backdrop-blur-sm z-20",
                failPlacement === "bottom" ? "mt-1" : "mb-1",
                failPlacement === "top" ? "bottom-full" : "top-full"
              )}
            >
              <ul className="py-1 text-xs">
                {([false, true] as boolean[]).map((terminate) => {
                  const active = terminateOnFail === terminate;
                  return (
                    <li key={String(terminate)}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full items-center gap-2 px-2 py-1.5 text-left transition",
                          active ? "bg-primary/10 text-foreground" : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                        )}
                        onClick={() => {
                          onTerminateOnFailChange(terminate);
                          setFailMenuOpen(false);
                        }}
                      >
                        {terminate && <PlaceholderIcon size={16} weight="fill" className="opacity-80" />}
                        {terminate ? "Terminate" : "Continue"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </div>
      <p className="text-sm leading-5 text-muted-foreground">
        {terminateOnFail ? "workflow terminates when this rule fails." : "ignores rule failures and continue executing"}
      </p>
    </div>
  );
}

export default RuleHandling;
