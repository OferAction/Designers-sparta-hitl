import { useState, ReactNode, useCallback, useMemo } from "react";

import { VALUE_TYPE_ITEMS } from "../constants";
import { Option, GTMenuItem } from "../types";
import { InputTagContext, InputTagContextProps } from "./InputTagContext";

export interface InputTagProviderProps {
  children: ReactNode;
  initialValue?: string;
  initialPlaceholder?: string;
  onValueChange?: (value: string) => void;
  onTypeChange?: (type: Option) => void;
  onMetricsChange?: (metrics: { accuracyEnabled: boolean; accuracyMargin: number; selectedMetric: string }) => void;
  onGTItemChange?: (item: GTMenuItem | null) => void;
  onDetach?: () => void;
  variant?: "select" | "input";
  appearance?: "flat" | "emphasized";
  isGtConnectable?: boolean;
  disabled?: boolean;
  hasTypeTrigger?: boolean;
  hasDropdownArrow?: boolean;
  hideInputTrigger?: boolean;
  isError?: boolean;
  isFull?: boolean;
  isOperand?: boolean;
}

export function InputTagProvider({
  children,
  initialValue = "",
  initialPlaceholder = "Placeholder",
  onValueChange,
  onTypeChange,
  onMetricsChange,
  onGTItemChange,
  onDetach: onDetachProp,
  variant = "input",
  appearance = "flat",
  isGtConnectable = false,
  disabled = false,
  hasTypeTrigger = false,
  hasDropdownArrow = false,
  hideInputTrigger = false,
  isError = false,
  isFull = false,
  isOperand = false,
}: InputTagProviderProps) {
  // Basic values
  const [value, setValue] = useState(initialValue);
  const [placeholder] = useState(initialPlaceholder);

  const [inputDropdownOpen, setInputDropdownOpen] = useState(false);

  // Type Management
  const [selectedType, setSelectedType] = useState<Option>(VALUE_TYPE_ITEMS[0]);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);

  // GT Connection
  const [isGTMenuOpen, setIsGTMenuOpen] = useState(false);
  const [gtConnected, setGtConnected] = useState(false);
  const [connectedGTItem, setConnectedGTItem] = useState<GTMenuItem | null>(null);
  const [connectedTo, setConnectedTo] = useState("gt_toystory_eval");

  // Metrics
  const [isMetricsOpen, setIsMetricsOpen] = useState(false);
  const [accuracyEnabled, setAccuracyEnabled] = useState(false);
  const [accuracyMargin, setAccuracyMargin] = useState(10);
  const [selectedMetric, setSelectedMetric] = useState("Accuracy");

  // GT connection handlers
  const onSelectGTItem = useCallback((item: GTMenuItem) => {
    setIsGTMenuOpen(false);
    setGtConnected(true);
    setConnectedGTItem(item);
    setValue(item.value || "");

    if (item.type) {
      const matchingType = VALUE_TYPE_ITEMS.find((t) => t.value === item.type) || VALUE_TYPE_ITEMS[0];
      setSelectedType(matchingType);
    }
  }, []);

  const handleValueChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      onValueChange?.(newValue);
    },
    [onValueChange]
  );

  const handleTypeChange = useCallback(
    (newType: Option) => {
      setSelectedType(newType);
      onTypeChange?.(newType);
    },
    [onTypeChange]
  );

  const handleMetricsChange = useCallback(
    (enabled: boolean, margin: number, metric: string) => {
      setAccuracyEnabled(enabled);
      setAccuracyMargin(margin);
      setSelectedMetric(metric);
      onMetricsChange?.({
        accuracyEnabled: enabled,
        accuracyMargin: margin,
        selectedMetric: metric,
      });
    },
    [onMetricsChange]
  );

  const handleGTItemChange = useCallback(
    (item: GTMenuItem | null) => {
      setConnectedGTItem(item);
      onGTItemChange?.(item);
    },
    [onGTItemChange]
  );

  const handleDetach = useCallback(() => {
    setGtConnected(false);
    setConnectedGTItem(null);
    setIsGTMenuOpen(false);
    handleGTItemChange(null);
    onDetachProp?.();
  }, [handleGTItemChange, onDetachProp]);

  const setAccuracyEnabledCallback = useCallback(
    (enabled: boolean) => handleMetricsChange(enabled, accuracyMargin, selectedMetric),
    [handleMetricsChange, accuracyMargin, selectedMetric]
  );

  const setAccuracyMarginCallback = useCallback(
    (margin: number) => handleMetricsChange(accuracyEnabled, margin, selectedMetric),
    [handleMetricsChange, accuracyEnabled, selectedMetric]
  );

  const setSelectedMetricCallback = useCallback(
    (metric: string) => handleMetricsChange(accuracyEnabled, accuracyMargin, metric),
    [handleMetricsChange, accuracyEnabled, accuracyMargin]
  );

  const contextValue: InputTagContextProps = useMemo(
    () => ({
      value,
      setValue: handleValueChange,
      placeholder,
      onValueChange,

      inputDropdownOpen,
      setInputDropdownOpen,

      selectedType,
      setSelectedType: handleTypeChange,
      typeDropdownOpen,
      setTypeDropdownOpen,
      onTypeChange,

      isGTMenuOpen,
      setIsGTMenuOpen,
      gtConnected,
      setGtConnected,
      connectedGTItem,
      setConnectedGTItem: handleGTItemChange,
      connectedTo,
      setConnectedTo,
      onDetach: handleDetach,
      onSelectGTItem,
      onGTItemChange,

      isMetricsOpen,
      setIsMetricsOpen,
      accuracyEnabled,
      setAccuracyEnabled: setAccuracyEnabledCallback,
      accuracyMargin,
      setAccuracyMargin: setAccuracyMarginCallback,
      selectedMetric,
      setSelectedMetric: setSelectedMetricCallback,
      onMetricsChange,
      isError,
      variant,
      appearance,
      isGtConnectable,
      disabled,
      hasTypeTrigger,
      hasDropdownArrow,
      hideInputTrigger,
      isFull,
      isOperand,
    }),
    [
      value,
      handleValueChange,
      placeholder,
      onValueChange,
      inputDropdownOpen,
      selectedType,
      handleTypeChange,
      typeDropdownOpen,
      onTypeChange,
      isGTMenuOpen,
      gtConnected,
      connectedGTItem,
      handleGTItemChange,
      connectedTo,
      handleDetach,
      onSelectGTItem,
      onGTItemChange,
      isMetricsOpen,
      accuracyEnabled,
      setAccuracyEnabledCallback,
      accuracyMargin,
      setAccuracyMarginCallback,
      selectedMetric,
      setSelectedMetricCallback,
      onMetricsChange,
      isError,
      variant,
      appearance,
      isGtConnectable,
      disabled,
      hasTypeTrigger,
      isOperand,
      hasDropdownArrow,
      hideInputTrigger,
      isFull,
    ]
  );

  return <InputTagContext.Provider value={contextValue}>{children}</InputTagContext.Provider>;
}
