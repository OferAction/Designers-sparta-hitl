import { forwardRef, useCallback, useEffect, useRef, useState } from "react";

import { CaretDownIcon as ChevronDown, CaretUpIcon as ChevronUp } from "@phosphor-icons/react";

import { Input } from "./input";
import { cn } from "@/lib/utils";

export interface NumberInputProps {
  stepper?: number; // custom increment amount
  step?: number; // alias for stepper (HTML attr compatibility)
  placeholder?: string;
  defaultValue?: number;
  min?: number;
  max?: number;
  value?: number; // controlled value
  suffix?: string;
  prefix?: string;
  onValueChange?: (value: number | undefined) => void; // preferred callback
  onChange?: (value: number | undefined) => void; // alias for RHF usage
  decimalScale?: number; // maximum decimal places when formatting
  fixedDecimalScale?: boolean; // if true always show trailing zeros
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export const NumberStepper = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      stepper,
      step,
      placeholder,
      defaultValue,
      min = -Infinity,
      max = Infinity,
      value: controlledValue,
      onValueChange,
      onChange,
      suffix,
      prefix,
      decimalScale = 0,
      fixedDecimalScale = false,
      disabled,
      className,
      id,
      name,
    },
    ref
  ) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;
    const [value, setValue] = useState<number | undefined>(controlledValue ?? defaultValue);
    const incrementAmount = stepper ?? step ?? 1;

    // Sync controlled value
    useEffect(() => {
      if (controlledValue !== undefined) setValue(controlledValue);
    }, [controlledValue]);

    const clamp = useCallback(
      (n: number) => {
        if (n < min) return min;
        if (n > max) return max;
        return n;
      },
      [min, max]
    );

    const emit = useCallback(
      (n: number | undefined) => {
        onValueChange?.(n);
        onChange?.(n);
      },
      [onValueChange, onChange]
    );

    const formatToScale = useCallback(
      (n: number) => {
        if (decimalScale == null) return String(n);
        return fixedDecimalScale
          ? n?.toFixed(decimalScale)
          : n.toLocaleString(undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: decimalScale,
            });
      },
      [decimalScale, fixedDecimalScale]
    );

    const apply = useCallback(
      (next: number | undefined) => {
        setValue(next);
        emit(next);
      },
      [emit]
    );

    const handleIncrement = useCallback(() => {
      apply(clamp((value ?? 0) + incrementAmount));
    }, [apply, clamp, value, incrementAmount]);

    const handleDecrement = useCallback(() => {
      apply(clamp((value ?? 0) - incrementAmount));
    }, [apply, clamp, value, incrementAmount]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === "") {
        apply(undefined);
        return;
      }
      const parsed = Number(raw);
      if (!Number.isFinite(parsed)) return;
      apply(parsed);
    };

    const handleBlur = () => {
      if (value === undefined) return;
      const clamped = clamp(value);
      if (clamped !== value) apply(clamped);
      if (inputRef.current) inputRef.current.value = formatToScale(clamped);
    };

    return (
      <div
        className={cn("relative inline-block", disabled && "opacity-60 cursor-not-allowed", className)}
        role="group"
        aria-disabled={disabled || undefined}
      >
        {prefix && <span className="pointer-events-none absolute left-2 top-1/2 z-10 -translate-y-1/2 text-xs text-muted-foreground">{prefix}</span>}
        <Input
          ref={inputRef as any}
          id={id}
          name={name}
          type="number"
          inputMode="decimal"
          disabled={disabled}
          min={min === -Infinity ? undefined : min}
          max={max === Infinity ? undefined : max}
          step={incrementAmount}
          placeholder={placeholder}
          className={cn("text-left bg-background")}
          value={value === undefined ? "" : value}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              handleIncrement();
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              handleDecrement();
            }
          }}
        />
        {suffix && <span className="pointer-events-none absolute right-12 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">{suffix}</span>}

        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col gap-1">
          <button
            type="button"
            aria-label="Increase value"
            className="flex h-3 w-3 items-center justify-center rounded-xs bg-secondary text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground active:bg-accent/60 disabled:cursor-not-allowed disabled:opacity-40"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleIncrement}
            disabled={disabled || value === max}
            tabIndex={-1}
          >
            <ChevronUp className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Decrease value"
            className="flex h-3 w-3 items-center justify-center rounded-xs bg-secondary text-muted-foreground shadow-sm transition-colors hover:bg-accent hover:text-foreground active:bg-accent/60 disabled:cursor-not-allowed disabled:opacity-40"
            onMouseDown={(e) => e.preventDefault()}
            onClick={handleDecrement}
            disabled={disabled || value === min}
            tabIndex={-1}
          >
            <ChevronDown className="size-4" />
          </button>
        </div>
      </div>
    );
  }
);

NumberStepper.displayName = "NumberStepper";
