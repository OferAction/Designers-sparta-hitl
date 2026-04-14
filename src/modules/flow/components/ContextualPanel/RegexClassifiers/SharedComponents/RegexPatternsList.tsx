import { useState } from "react";

import { InputItem } from "../../../IO";
import { cn } from "@/lib/utils";
import { TreeInputItem } from "@/modules/flow/hooks";

type RegexPatternsListProps = {
  items: string[];
  onChange: (next: string[]) => void;
  onRemove?: (idx: number, value: string) => void;
  addPlaceholder?: string;
  className?: string;
};

export default function RegexPatternsList({ items, onChange, onRemove, addPlaceholder = "add regex pattern", className }: RegexPatternsListProps) {
  const [typingIndex, setTypingIndex] = useState<number | null>(null);
  const setItem = (idx: number, val: string) => {
    const next = [...items];
    next[idx] = val;
    onChange(next);
  };

  const removeItem = (idx: number) => {
    const removedValue = items[idx];
    const next = items.filter((_, i) => i !== idx);
    onChange(next);
    onRemove?.(idx, removedValue);
  };

  return (
    <div className={cn("flex flex-col w-full gap-3 pl-2 border-l border-border/50 overflow-x-hidden", className)}>
      {items.map((p, idx) => {
        const node: TreeInputItem = {
          id: String(idx),
          key: "",
          type: "String",
          value: { label: p, value: p },
          children: [],
        };

        return (
          <div key={idx} className={cn("flex items-center gap-2 w-full")}>
            <InputItem
              item={node}
              onValueChange={(_, next) => {
                const nextVal = next.label || next.value || "";
                setItem(idx, nextVal);
              }}
              placeholder={addPlaceholder}
              hidden={{ key: true, description: true, optional: true, type: true }}
              className="border border-muted/50 rounded-sm"
              autoFocus={idx === typingIndex}
              onAutoFocusComplete={() => setTypingIndex(null)}
              onRemove={() => removeItem(idx)}
            />
          </div>
        );
      })}

      <div className="flex items-center w-full border border-muted hover:bg-muted/80 hover:border-border/50 rounded-md">
        <input
          className={cn("h-6 px-2 w-full py-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground/70 focus-within:truncate")}
          placeholder={addPlaceholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const val = e.currentTarget.value.trim();
              if (val && typingIndex === null) {
                onChange([...items, val]);
                setTypingIndex(items.length);
                e.currentTarget.value = "";
              }
            }
          }}
          onChange={(e) => {
            const val = e.currentTarget.value;
            const trimmed = val.trim();
            if (typingIndex === null && trimmed) {
              onChange([...items, trimmed]);
              setTypingIndex(items.length);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}
