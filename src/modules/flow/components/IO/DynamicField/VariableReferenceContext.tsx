import { createContext, useContext } from "react";

import { Option } from "@/components/ui/input-tag";

export const VARIABLE_REFERENCE_VARIANTS = {
  default: "default",
  conditionVariable: "conditionVariable",
  chatMessage: "chatMessage",
} as const;

export type VariableReferenceVariant =
  (typeof VARIABLE_REFERENCE_VARIANTS)[keyof typeof VARIABLE_REFERENCE_VARIANTS];

type VariableReferenceContextType = {
  flatOptions: Map<string, NonNullable<Option>>;
  /** Visual style variant for variable references */
  variant?: VariableReferenceVariant;
};

const VariableReferenceContext = createContext<VariableReferenceContextType | null>(null);

export const VariableReferenceProvider = VariableReferenceContext.Provider;

export const useFlatOptions = () => {
  const context = useContext(VariableReferenceContext);
  if (!context) {
    return null;
  }
  return context.flatOptions;
};

export const useVariableReferenceVariant = (): VariableReferenceVariant => {
  const context = useContext(VariableReferenceContext);
  return context?.variant ?? "default";
};
