export const DEFAULT_ACCURACY_MARGIN = 0; // percent

// Utility functions for handling accuracy margin inputs
export const handleAccuracyMarginInputChange = (value: string, onAccuracyMarginChange: (margin: number) => void) => {
  if (value === "") {
    onAccuracyMarginChange(DEFAULT_ACCURACY_MARGIN);
    return;
  }

  const val = parseInt(value, 10);
  if (isNaN(val)) {
    return;
  }

  const clampedVal = Math.max(0, Math.min(100, val));
  onAccuracyMarginChange(clampedVal);
};

export const handleAccuracyMarginBlur = (value: string, onAccuracyMarginChange: (margin: number) => void) => {
  const val = parseInt(value, 10);
  if (isNaN(val)) {
    onAccuracyMarginChange(DEFAULT_ACCURACY_MARGIN);
  } else {
    const clampedVal = Math.max(0, Math.min(100, val));
    onAccuracyMarginChange(clampedVal);
  }
};

export interface MetricConfigurationProps {
  positives: string[];
  classes: string[];
  labels: string[];
  onPositivesChange: (positives: string[]) => void;
  onClassesChange: (classes: string[]) => void;
  onLabelsChange: (labels: string[]) => void;
}

export interface AccuracySectionProps {
  accuracyEnabled: boolean;
  onAccuracyToggle: (enabled: boolean) => void;
  accuracyMargin: number;
  onAccuracyMarginChange: (margin: number) => void;
}
