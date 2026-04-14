import { createContext, useContextSelector } from "use-context-selector";

import { Option, GTMenuItem } from "../types";

export interface InputTagContextProps {
  // Basic values
  value: string;
  setValue: (value: string) => void;
  placeholder: string;
  onValueChange?: (value: string) => void;

  inputDropdownOpen: boolean;
  setInputDropdownOpen: (open: boolean) => void;

  // Type Management
  selectedType: Option;
  setSelectedType: (type: Option) => void;
  typeDropdownOpen: boolean;
  setTypeDropdownOpen: (open: boolean) => void;
  onTypeChange?: (type: Option) => void;

  // GT Connection
  isGTMenuOpen: boolean;
  setIsGTMenuOpen: (open: boolean) => void;
  gtConnected: boolean;
  setGtConnected: (connected: boolean) => void;
  connectedGTItem: GTMenuItem | null;
  setConnectedGTItem: (item: GTMenuItem | null) => void;
  connectedTo: string;
  setConnectedTo: (connectedTo: string) => void;
  onDetach: () => void;
  onSelectGTItem: (item: GTMenuItem) => void;
  onGTItemChange?: (item: GTMenuItem | null) => void;

  // Metrics
  isMetricsOpen: boolean;
  setIsMetricsOpen: (open: boolean) => void;
  accuracyEnabled: boolean;
  setAccuracyEnabled: (enabled: boolean) => void;
  accuracyMargin: number;
  setAccuracyMargin: (margin: number) => void;
  selectedMetric: string;
  setSelectedMetric: (metric: string) => void;
  onMetricsChange?: (metrics: { accuracyEnabled: boolean; accuracyMargin: number; selectedMetric: string }) => void;

  // Error handling
  isError: boolean;

  variant?: "select" | "input";
  appearance?: "flat" | "emphasized";
  isGtConnectable?: boolean;
  disabled?: boolean;
  hasTypeTrigger?: boolean;
  hasDropdownArrow?: boolean;
  hideInputTrigger?: boolean;
  isFull?: boolean;
  isOperand?: boolean;
}

export const InputTagContext = createContext<InputTagContextProps>({} as InputTagContextProps);

export const useInputTagContextSelector = <T,>(selector: (value: InputTagContextProps) => T): T => {
  const context = useContextSelector(InputTagContext, selector);
  if (context === undefined) {
    throw new Error("InputTagContent must be used within an InputTag");
  }
  return context;
};
