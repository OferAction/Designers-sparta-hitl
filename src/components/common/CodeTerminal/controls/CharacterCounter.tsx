import React from "react";

import { cva } from "class-variance-authority";

import { useTerminal } from "../context/TerminalContext";
import { cn } from "@/lib/utils";

const textLimitVariants = cva("ml-auto text-md textforeground tabular-nums leading-5", {
  variants: {
    state: {
      default: "",
      error: "text-destructive",
    },
  },
  defaultVariants: {
    state: "default",
  },
});

interface CharacterCounterProps {
  className?: string;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({ className }) => {
  const { value, maxLength } = useTerminal();

  // If no maxLength is set, don't show the counter
  if (typeof maxLength !== "number") {
    return null;
  }

  const charCount = typeof value === "string" ? value.length : 0;
  const isOverLimit = charCount >= maxLength;

  return (
    <span
      className={cn(
        textLimitVariants({
          state: isOverLimit ? "error" : "default",
        }),
        className
      )}
    >
      {charCount}/{maxLength}
    </span>
  );
};
