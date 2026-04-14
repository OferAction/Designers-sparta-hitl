import React from "react";

import WithTooltip from "./WithTooltip";
import { cn } from "@/utils";

type Props = {
  enabled: boolean;
  onToggle: (next: boolean) => void;
  label?: string;
  className?: string;
  children?: React.ReactNode;
};

export default function DefaultRoutingToggle({ enabled, onToggle, label = "Default Routing", className, children }: Props) {
  return (
    <div className={cn("", className)}>
      <WithTooltip tooltip="Sets the default routing for all nodes" side="bottom">
        <button
          type="button"
          className={cn(
            "inline-flex w-fit items-center rounded-md py-2 px-2.5 text-sm font-medium ",
            enabled
              ? "bg-success/20 text-foreground"
              : "bg-destructive/20 text-foreground group/default-routing-toggle hover:bg-muted hover:text-muted-foreground"
          )}
          onClick={() => onToggle(!enabled)}
        >
          {label}
          <span className={cn("ml-1 group-hover/default-routing-toggle:text-foreground", enabled ? "text-success" : "text-destructive")}>
            {enabled ? "ON" : "OFF"}
          </span>
        </button>
      </WithTooltip>

      {enabled ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
