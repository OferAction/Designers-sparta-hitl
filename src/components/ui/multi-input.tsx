import * as React from "react";

import { XIcon } from "@phosphor-icons/react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface MultiInputRef {
  clear: () => void;
  focus: () => void;
  getValues: () => string[];
  setValues: (values: string[]) => void;
}

export interface MultiInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  defaultValue?: string[];
  onValueChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxItems?: number;
  allowDuplicates?: boolean;
  /** Separator(s) used to split pasted content into multiple items */
  pasteSeparator?: RegExp | string;
  /** Optional validator for each item (e.g., email). Return true when valid */
  validate?: (value: string) => boolean;
  /** Render tag chip. Defaults to Badge with remove button */
  renderTag?: (value: string, remove: () => void) => React.ReactNode;
  /** Error state */
  error?: boolean;
  /** Optional error message displayed below */
  errorMessage?: string | React.ReactNode;
  validationRegex?: RegExp;
}

export const MultiInput = React.forwardRef<MultiInputRef, MultiInputProps>(
  (
    {
      defaultValue = [],
      onValueChange,
      placeholder = "Type and press Enter",
      disabled = false,
      className,
      maxItems,
      allowDuplicates = false,
      pasteSeparator = /[\n,;\s]+/g,
      validate,
      renderTag,
      error = false,
      errorMessage,
      validationRegex,
      ...inputProps
    },
    ref
  ) => {
    const [values, setValues] = React.useState<string[]>(defaultValue);
    const [inputVal, setInputVal] = React.useState("");
    const inputRef = React.useRef<HTMLInputElement>(null);
    const prevDefaultRef = React.useRef<string[]>(defaultValue);

    const arraysEqual = React.useCallback((a: string[], b: string[]) => {
      if (a.length !== b.length) return false;
      const sa = [...a].sort();
      const sb = [...b].sort();
      return sa.every((v, i) => v === sb[i]);
    }, []);

    // Sync with defaultValue changes
    React.useEffect(() => {
      if (!arraysEqual(prevDefaultRef.current, defaultValue)) {
        setValues(defaultValue);
        prevDefaultRef.current = [...defaultValue];
      }
    }, [defaultValue, arraysEqual]);

    const commit = React.useCallback(
      (next: string[]) => {
        setValues(next);
        onValueChange(next);
      },
      [onValueChange]
    );

    const addValue = React.useCallback(
      (raw: string) => {
        const v = raw.trim();
        if (!v) return;
        if (maxItems !== undefined && values.length >= maxItems) return;
        if (!allowDuplicates && values.includes(v)) return;
        if (validate && !validate(v)) return;
        commit([...values, v]);
      },
      [values, commit, maxItems, allowDuplicates, validate]
    );

    const addMany = React.useCallback(
      (raw: string) => {
        const parts = (pasteSeparator instanceof RegExp ? raw.split(pasteSeparator) : raw.split(pasteSeparator)).map((p) => p.trim()).filter(Boolean);
        if (parts.length === 0) return;
        const next = [...values];
        for (const p of parts) {
          if (maxItems !== undefined && next.length >= maxItems) break;
          if (!allowDuplicates && next.includes(p)) continue;
          if (validate && !validate(p)) continue;
          next.push(p);
        }
        if (next.length !== values.length) commit(next);
      },
      [values, commit, pasteSeparator, maxItems, allowDuplicates, validate]
    );

    const removeAt = React.useCallback(
      (idx: number) => {
        const next = values.filter((_, i) => i !== idx);
        commit(next);
      },
      [values, commit]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addValue(inputVal);
        setInputVal("");
      } else if (e.key === "Backspace" && inputVal.length === 0 && values.length > 0) {
        e.preventDefault();
        removeAt(values.length - 1);
      }
    };

    const handleBlur = () => {
      if (disabled) return;
      if (inputVal.trim()) {
        addValue(inputVal);
        setInputVal("");
      }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (disabled) return;
      const text = e.clipboardData.getData("text");
      if (text) {
        e.preventDefault();
        addMany(text);
      }
    };

    React.useImperativeHandle(
      ref,
      () => ({
        clear: () => commit([]),
        focus: () => inputRef.current?.focus(),
        getValues: () => values,
        setValues: (vals: string[]) => commit(vals),
      }),
      [commit, values]
    );

    const Tag = ({ value, index }: { value: string; index: number }) => {
      const remove = () => removeAt(index);
      if (renderTag) return <>{renderTag(value, remove)}</>;
      return (
        <Badge
          variant="secondary"
          className={cn("inline-flex font-normal items-center gap-1 rounded-md text-xs", "px-1.5 py-0.5", "bg-muted text-foreground")}
        >
          {value}
          <button type="button" aria-label={`Remove ${value}`} onClick={remove} className="ml-1 inline-flex">
            <XIcon className="h-3 w-3" />
          </button>
        </Badge>
      );
    };

    // Check if any value does not match the regex
    const hasRegexError = React.useMemo(() => {
      if (!validationRegex) return false;
      return values.some((v) => !validationRegex.test(v));
    }, [values, validationRegex]);

    // Combine error prop with regex error
    const showError = error || hasRegexError;

    return (
      <div className="w-full space-y-1.5">
        <div
          className={cn(
            "group flex min-h-9 w-full flex-wrap items-center gap-1 rounded-md border bg-background px-2 py-1 text-sm",
            "transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
            disabled && "opacity-50 cursor-not-allowed",
            className,
            showError ? "border-destructive focus-within:ring-destructive" : "border-input focus-within:border-primary"
          )}
        >
          {values.map((v, i) => (
            <Tag key={`${v}-${i}`} value={v} index={i} />
          ))}
          <input
            ref={inputRef}
            className={cn(
              "flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none",
              "min-w-[6rem] py-1",
              "transition-[width]"
            )}
            placeholder={values.length === 0 ? placeholder : ""}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onPaste={handlePaste}
            disabled={disabled}
            {...inputProps}
          />
        </div>
        {showError && errorMessage && <p className="text-sm font-medium text-destructive leading-tight">{errorMessage}</p>}
      </div>
    );
  }
);

MultiInput.displayName = "MultiInput";

export default MultiInput;
