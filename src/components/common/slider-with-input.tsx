import React from "react";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface SliderWithInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  className?: string;
}

export function SliderWithInput({ label, value, onChange, min, max, step, className }: SliderWithInputProps) {
  const handleSliderChange = (values: number[]) => {
    onChange(values[0]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(e.target.value);
    if (!isNaN(numValue)) {
      onChange(numValue);
    }
  };

  return (
    <div className={cn("flex items-center", className)}>
      {!!label && <div className="w-[120px] text-sm font-medium py-3">{label}</div>}
      <div className="flex-1 px-2">
        <Slider value={[value]} min={min} max={max} step={step} onValueChange={handleSliderChange} className="cursor-pointer" />
      </div>
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        className={cn(
          "flex justify-center text-center items-center w-8 px-1.5 py-0.5 h-6 bg-background/30 border-border rounded-md",
          value < min || value > max ? "focus-visible:ring-destructive border-destructive" : "border-input"
        )}
        step={step}
        min={min}
        max={max}
      />
    </div>
  );
}
