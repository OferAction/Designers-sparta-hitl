import React from "react";

import { Check } from "@phosphor-icons/react";

import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { InputTagContextProps, useInputTagContextSelector } from "@/components/ui/input-tag/old-deprecated/InputTag/contexts";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface MetricsDropdownProps {
  trigger: React.ReactNode;
}

const OTHER_METRICS = ["Regression", "Binary Classification", "MultiClass Classification", "MultiLabel Classification"];

const selector = (ctx: InputTagContextProps) => ({
  isMetricsOpen: ctx.isMetricsOpen,
  setIsMetricsOpen: ctx.setIsMetricsOpen,
  accuracyEnabled: ctx.accuracyEnabled,
  setAccuracyEnabled: ctx.setAccuracyEnabled,
  accuracyMargin: ctx.accuracyMargin,
  setAccuracyMargin: ctx.setAccuracyMargin,
  selectedMetric: ctx.selectedMetric,
  setSelectedMetric: ctx.setSelectedMetric,
});

export function MetricsDropdown({ trigger }: MetricsDropdownProps) {
  const {
    isMetricsOpen: open,
    setIsMetricsOpen: onOpenChange,
    accuracyEnabled,
    setAccuracyEnabled: onToggleAccuracy,
    accuracyMargin,
    setAccuracyMargin: onChangeMargin,
    selectedMetric,
    setSelectedMetric: onSelectMetric,
  } = useInputTagContextSelector(selector);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange} modal={false}>
      <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-60 p-0 bg-popover text-popover-foreground rounded-md shadow-lg overflow-hidden border border-border"
      >
        <div className="px-3 py-2 text-sm font-medium border-b border-border">Metrics</div>

        {/* Accuracy row */}
        <div className="px-3 py-3 flex items-center justify-between">
          <span className="text-xs">Accuracy</span>
          <Switch
            checked={accuracyEnabled}
            onCheckedChange={onToggleAccuracy}
            className={cn(
              // Track
              "relative inline-flex h-5 w-10 data-[state=unchecked]:bg-muted shrink-0 cursor-pointer rounded-full border border-border transition-colors ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-accent",
              accuracyEnabled && "bg-primary"
            )}
          >
            <span
              // Thumb
              className={cn(
                "pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-background shadow transition-transform ease-in-out",
                accuracyEnabled ? "translate-x-1.5" : "translate-x-0"
              )}
            />
          </Switch>
        </div>

        {/* Accuracy margins */}
        {accuracyEnabled && (
          <div className="px-2 flex items-center justify-between mb-1 rounded">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-primary" weight="bold" />
              <span className="text-xs text-muted-foreground">Accuracy margins</span>
            </div>
            {/* input container */}
            <div className="relative flex items-center justify-end w-14 h-9 px-2 rounded-[8px] border border-border bg-background">
              <input
                type="number"
                min="0"
                max="100"
                value={accuracyMargin}
                onChange={(e) => {
                  let val = parseInt(e.target.value, 10);

                  if (e.target.value === "") {
                    onChangeMargin(0);
                    return;
                  }

                  if (isNaN(val)) {
                    return;
                  }
                  val = Math.max(0, Math.min(100, val));

                  onChangeMargin(val);
                }}
                onBlur={(e) => {
                  // Ensure display is updated if user types and tabs away
                  let val = parseInt(e.target.value, 10);
                  if (isNaN(val)) {
                    onChangeMargin(0);
                  } else {
                    val = Math.max(0, Math.min(100, val));
                    onChangeMargin(val);
                  }
                }}
                className="w-full bg-transparent text-muted-foreground text-sm outline-none appearance-none"
                style={{ MozAppearance: "textfield" }}
              />
              <span className="absolute right-2 text-sm text-muted-foreground pointer-events-none">%</span>
            </div>
          </div>
        )}

        {/* Other metrics list */}
        <div>
          {OTHER_METRICS.map((m) => {
            const selected = m === selectedMetric;
            return (
              <div
                key={m}
                onClick={() => onSelectMetric(m)}
                className={cn(
                  "bg-muted border-t px-3 py-2.5 flex items-center justify-between cursor-pointer text-xs text-muted-foreground",
                  "hover:bg-muted/50",
                  selected && "bg-muted/50"
                )}
              >
                <span>{m}</span>
                {/* Custom Radio Button */}
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border flex items-center justify-center bg-background",
                    selected ? "border-primary bg-primary" : "border-muted-foreground"
                  )}
                >
                  {/* Inner dot for selected */}
                  {selected && <div className="w-2 h-2 rounded-full bg-background"></div>}
                </div>
              </div>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
