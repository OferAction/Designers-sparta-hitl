import { AccuracySectionProps, handleAccuracyMarginInputChange, handleAccuracyMarginBlur } from "./utils";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils";

export const AccuracySection = ({ accuracyEnabled, onAccuracyToggle, accuracyMargin, onAccuracyMarginChange }: AccuracySectionProps) => {
  return (
    <div className={cn("hover:bg-blue-accent/20", accuracyEnabled && "bg-blue-accent/20")} onClick={(e) => e.stopPropagation()}>
      <div className="px-3 py-3 flex items-center justify-between">
        <span className="text-xs">Accuracy</span>
        <Switch
          checked={accuracyEnabled}
          onCheckedChange={onAccuracyToggle}
          className={cn(
            "relative inline-flex h-5 data-[state=unchecked]:bg-muted shrink-0 cursor-pointer rounded-full border border-border transition-colors ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-accent",
            accuracyEnabled && "bg-primary"
          )}
        ></Switch>
      </div>

      {accuracyEnabled && (
        <div className="px-3 pb-3 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Accuracy margins</span>
          </div>
          <div className="relative flex items-center justify-end w-14 h-9 px-2 rounded-[8px] border border-border-blue bg-background">
            <input
              type="number"
              min="0"
              max="100"
              value={accuracyMargin}
              onChange={(e) => handleAccuracyMarginInputChange(e.target.value, onAccuracyMarginChange)}
              onBlur={(e) => handleAccuracyMarginBlur(e.target.value, onAccuracyMarginChange)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-background text-muted-foreground text-sm outline-none appearance-none"
              style={{ MozAppearance: "textfield" }}
            />
            <span className="absolute right-2 text-sm text-muted-foreground pointer-events-none">%</span>
          </div>
        </div>
      )}
    </div>
  );
};
