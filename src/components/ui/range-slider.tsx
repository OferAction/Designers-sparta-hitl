import { useCallback, useEffect, useState } from "react";

import { Slider } from "@/components/ui/slider";

interface RangeSliderProps {
  totalSamples?: number;
  value?: number;
  onValueChange?: (absoluteValue: number) => void;
}

export default function RangeSlider({ totalSamples = 0, value, onValueChange }: RangeSliderProps) {
  const [percentage, setPercentage] = useState(value && totalSamples > 0 ? Math.round((value / totalSamples) * 100) : 0);
  const [absoluteValue, setAbsoluteValue] = useState(value || 0);

  /** Converts a percentage into its absolute sample count based on the current total. */
  const toAbsolute = useCallback(
    (rawPercentage: number) => {
      const clampedPercentage = Math.max(0, Math.min(100, rawPercentage));
      return Math.floor((clampedPercentage / 100) * totalSamples);
    },
    [totalSamples]
  );

  /** Updates both percentage and absolute values when percentage changes. */
  const updateFromPercentage = useCallback(
    (newPercentage: number) => {
      const clampedPercentage = Math.max(0, Math.min(100, Math.round(newPercentage)));
      const newAbsoluteValue = toAbsolute(clampedPercentage);

      setPercentage(clampedPercentage);
      setAbsoluteValue(newAbsoluteValue);
      onValueChange?.(newAbsoluteValue);
    },
    [toAbsolute, onValueChange]
  );

  /** Updates both absolute and percentage values when absolute value changes. */
  const updateFromAbsolute = useCallback(
    (newAbsoluteValue: number) => {
      const clampedAbsolute = Math.max(0, Math.min(totalSamples, newAbsoluteValue));
      const newPercentage = totalSamples > 0 ? Math.round((clampedAbsolute / totalSamples) * 100) : 0;

      setAbsoluteValue(clampedAbsolute);
      setPercentage(newPercentage);
      onValueChange?.(clampedAbsolute);
    },
    [totalSamples, onValueChange]
  );

  /** Handles percentage input field changes. */
  const handlePercentageInput = (value: string) => {
    const numValue = Number.parseInt(value, 10) || 0;
    updateFromPercentage(numValue);
  };

  /** Handles absolute samples input field changes. */
  const handleAbsoluteInput = (value: string) => {
    const numValue = Number.parseInt(value, 10) || 0;
    updateFromAbsolute(numValue);
  };

  /** Keeps internal slider state synchronized when parent value or total sample count changes. */
  useEffect(() => {
    const nextAbsolute = Math.max(0, Math.min(totalSamples, value || 0));
    const nextPercentage = totalSamples > 0 ? Math.round((nextAbsolute / totalSamples) * 100) : 0;

    setAbsoluteValue(nextAbsolute);
    setPercentage(nextPercentage);
  }, [value, totalSamples]);

  return (
    <div className="flex items-center gap-3 w-full">
      <Slider
        min={0}
        max={100}
        step={1}
        value={[percentage]}
        onValueChange={([val]) => updateFromPercentage(val)}
        className="flex-1"
        aria-label="Sample percentage"
      />

      <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background shrink-0">
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-r border-border w-[56px]">
          <input
            type="number"
            value={percentage}
            min={0}
            max={100}
            onChange={(e) => handlePercentageInput(e.target.value)}
            className="bg-transparent text-sm text-muted-foreground focus:text-white outline-none w-full text-right [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="0"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>

        <div className="px-2 py-1.5 w-[56px]">
          <input
            type="number"
            value={absoluteValue}
            min={0}
            max={totalSamples}
            onChange={(e) => handleAbsoluteInput(e.target.value)}
            className="bg-transparent text-sm text-muted-foreground focus:text-white outline-none w-full text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );
}
