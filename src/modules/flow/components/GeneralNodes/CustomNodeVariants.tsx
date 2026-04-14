import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils"; // or clsx if you're using that

/*Places Thant conrol states and style
1/in function getNodeBorderVariant({type:"start",state:"default"})
2/ in this places
data-selected={selected}
data-ground-truth-connected={false}
getIconOfState({state:"success"});
*/

// 1. Define base shapes
const baseShapes = {
  default: "rounded-2xl",
  start: "rounded-l-[100px] rounded-r-[48px]",
  end: "rounded-l-[48px] rounded-r-[100px]",
  subflow: "rounded-2xl",
  condition: "rounded-2xl",
  iteration: "rounded-2xl",
};

// 2. Define base border styles per type (can customize these)
const typeBaseBorders = {
  default: "border", // Default border class
  start: "border", // Customize e.g., "border border-blue-500"
  end: "border", // Customize e.g., "border border-gray-500"
  subflow: "border", // Specific default for subflow
  condition: "border", // Customize e.g., "border border-yellow-500"
  iteration: "border", // Customize e.g., "border border-orange-500"
};

// 3. Define state-specific border colors (applied on top of base border)
const stateBorderColors = {
  default: "", // No override for default state color
  success: "border-success",
  error: "border-destructive",
  reliabilityRule: "border-warning",
  systemRule: "border-destructive",
};

// 4. Define hover/selected outline styles (remains similar)
const hoverAndSelectedStyles = {
  default: cn(
    "hover:outline-ring",
    "group-data-[selected=true]:outline-foreground group-data-[selected=true]:hover:outline-foreground",
    "border-transparent"
  ),
  subflow: cn("hover:outline-node-subflow group-data-[selected=true]:outline-node-subflow"),
};

const interactiveOutline =
  "outline outline-1 outline-transparent group-data-[selected=false]:hover:outline-1" +
  "group-data-[selected=true]:outline group-data-[selected=true]:outline-2 group-data-[selected=true]:outline-offset-[2px]";

export const nodeContentVariants = cva(
  cn(
    "overflow-hidden flex flex-col relative h-full justify-center py-1 px-2 max-w-[280px]",
    "[&>*]:truncate [&>*]:overflow-hidden [&>*]:text-ellipsis [&>*]:whitespace-nowrap",
    interactiveOutline
  ),
  {
    variants: {
      type: {
        default: cn("min-h-14", baseShapes.default, typeBaseBorders.default, hoverAndSelectedStyles.default),
        start: cn("min-h-14", baseShapes.start, typeBaseBorders.start, hoverAndSelectedStyles.default),
        end: cn("min-h-14", baseShapes.end, typeBaseBorders.end, hoverAndSelectedStyles.default),
        subflow: cn("min-h-14", baseShapes.subflow, typeBaseBorders.subflow, hoverAndSelectedStyles.subflow),
        condition: cn("min-h-20", baseShapes.condition, typeBaseBorders.condition, hoverAndSelectedStyles.default),
        iteration: cn("flex gap-1 p-1 max-w-none", baseShapes.iteration, typeBaseBorders.iteration, hoverAndSelectedStyles.default),
      },
      state: {
        default: "",
        success: cn(stateBorderColors.success),
        error: cn(stateBorderColors.error),
        reliabilityRule: cn(stateBorderColors.reliabilityRule),
        systemRule: cn(stateBorderColors.systemRule),
        running: "",
        pruned: "",
      },
      groundTruthConnected: { true: "", false: "" },
      running: { true: "", false: "" },
      actOneRunning: { true: "", false: "" },
    },
    compoundVariants: [
      // ActOne running takes precedence
      { groundTruthConnected: true, actOneRunning: true, className: "gt-node-gradient node-actone-gradient-animated" },
      { groundTruthConnected: false, actOneRunning: true, className: "node-actone-gradient-animated" },

      // Ground truth connected states (when actOneRunning is false)
      { groundTruthConnected: true, running: true, actOneRunning: false, className: "gt-node-gradient node-gradient-animated" },
      { groundTruthConnected: true, running: false, actOneRunning: false, className: "bg-blue-background" },

      // Default states (when actOneRunning is false)
      { groundTruthConnected: false, running: true, actOneRunning: false, className: "node-gradient-animated" },
      { groundTruthConnected: false, running: false, actOneRunning: false, className: "bg-sidebar-accent" },
    ],
    defaultVariants: {
      state: "default",
      type: "default",
      groundTruthConnected: false,
      running: false,
      actOneRunning: false,
    },
  }
);

export const mainIconCardVariants = cva("flex justify-center items-center p-2", {
  variants: {
    type: {
      default: "rounded-lg",
      start: "rounded-l-3xl rounded-r-lg",
      end: "rounded-l-lg rounded-r-3xl order-last",
      subflow: "rounded-lg",
    },
  },
  defaultVariants: {
    type: "default",
  },
});

export type NodeVariantBorderProps = VariantProps<typeof nodeContentVariants>;
export type MainIconVariantProps = VariantProps<typeof mainIconCardVariants>;
