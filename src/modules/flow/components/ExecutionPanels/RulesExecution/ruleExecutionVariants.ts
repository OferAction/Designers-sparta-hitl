import { cva } from "class-variance-authority";

import { RuleStatus } from "../types";

// Variant-based styling for rule items
export const ruleItemVariants = cva("m-1 flex flex-col gap-1 px-3 py-1.5 cursor-pointer transition-colors rounded-sm", {
  variants: {
    ruleType: {
      custom: "",
      "built-in": "",
      system: "",
    },
    status: {
      idle: "bg-muted/40 hover:bg-muted/50",
      running: "bg-muted/40 hover:bg-muted/50",
      notExecuted: "bg-muted/40 hover:bg-muted/30",
      [RuleStatus.Satisfied]: "bg-success/20 border border-success/30 hover:bg-success/30",
      [RuleStatus.NotSatisfied]: "bg-warning/10 border border-warning/20 hover:bg-warning/20",
      [RuleStatus.Failed]: "bg-destructive/20 border border-destructive/20 hover:bg-destructive/30",
    },
  },
  defaultVariants: {
    ruleType: "custom",
    status: "idle",
  },
});

// Variant for rule name text color
export const ruleNameVariants = cva("text-sm font-medium truncate", {
  variants: {
    status: {
      idle: "text-muted-foreground",
      running: "text-muted-foreground",
      notExecuted: "text-muted-foreground/50",
      [RuleStatus.Satisfied]: "text-success",
      [RuleStatus.NotSatisfied]: "text-warning",
      [RuleStatus.Failed]: "text-destructive",
    },
  },
  defaultVariants: {
    status: "idle",
  },
});

// Variant for status badge and icon color
export const statusColorVariants = cva("text-sm", {
  variants: {
    status: {
      idle: "text-muted-foreground",
      running: "text-muted-foreground",
      notExecuted: "text-muted-foreground/50",
      [RuleStatus.Satisfied]: "text-success",
      [RuleStatus.NotSatisfied]: "text-warning",
      [RuleStatus.Failed]: "text-destructive",
    },
  },
  defaultVariants: {
    status: "idle",
  },
});
