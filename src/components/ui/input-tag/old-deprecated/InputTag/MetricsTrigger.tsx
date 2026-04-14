import { InputTagContextProps, useInputTagContextSelector } from "./contexts";
import { buttonFocus, buttonHover, buttonIdle, numberHovered, numberIdle } from "./variants";
import { AccuracyTypeIcon as Accuracy } from "@/lib/icons";
import { cn } from "@/utils";

const selector = (ctx: InputTagContextProps) => ({
  isMetricsOpen: ctx.isMetricsOpen,
  setIsMetricsOpen: ctx.setIsMetricsOpen,
  isError: ctx.isError,
});

export const MetricsTrigger = () => {
  const { isMetricsOpen, setIsMetricsOpen, isError } = useInputTagContextSelector(selector);

  return (
    <div
      tabIndex={0}
      className={cn(
        "relative flex items-center justify-center w-6 h-6 rounded-r-md border border-border-blue border-opacity-50 transition-colors duration-200",
        isMetricsOpen ? buttonFocus : cn(buttonIdle, buttonHover)
      )}
      onClick={(e) => {
        e.stopPropagation();
        setIsMetricsOpen(true);
      }}
    >
      <Accuracy className={isError ? "h-4 w-4 text-destructive" : "h-4 w-4"} />
      <span
        className={cn(
          "absolute right-[3px] bottom-[2px] flex items-center justify-center bg-background text-[6.4px] text-foreground rounded-full w-1.5 h-2",
          isError ? "bg-destructive text-background" : cn(numberIdle, numberHovered)
        )}
      >
        1
      </span>
    </div>
  );
};
