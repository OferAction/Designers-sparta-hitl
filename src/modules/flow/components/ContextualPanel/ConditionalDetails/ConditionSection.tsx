import { ReactNode } from "react";

interface ConditionSectionProps {
  children: ReactNode;
  showDivider?: boolean;
}

/**
 * Wrapper component for condition sections with consistent styling
 */
export const ConditionSection = ({ children, showDivider = true }: ConditionSectionProps) => {
  return <>{showDivider ? <div className="border-b border-border/30">{children}</div> : children}</>;
};

export default ConditionSection;
