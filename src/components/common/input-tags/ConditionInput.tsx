import { ConditionField, GROUPED_OPERATORS } from "./ConditionField";
import { conditionPartsToOptions, convertConditionToString, extractConditionParts, hasConditionReferences } from "./ConditionField/conversionUtils";
import { Option } from "@/components/ui/input-tag";
import { DynamicFieldOnChange, DynamicFieldValue } from "@/modules/flow/components/IO/DynamicField/types";

export { GROUPED_OPERATORS, conditionPartsToOptions, convertConditionToString, extractConditionParts, hasConditionReferences };

export interface ConditionInputProps {
  onChange?: DynamicFieldOnChange;
  value?: DynamicFieldValue;
  options?: NonNullable<Option>[];
  /** Pre-grouped operator options for the dropdown */
  operators?: NonNullable<Option>[];
  placeholder?: string;
  hasFunctions?: boolean;
  className?: string;
  validationErrors?: Array<{ message: string; index?: number }>;
}

export function ConditionInput({
  onChange,
  value,
  options,
  operators = GROUPED_OPERATORS,
  placeholder,
  hasFunctions = false,
  className,
  validationErrors,
}: ConditionInputProps) {
  return (
    <ConditionField
      onChange={onChange}
      value={value}
      scope={options}
      operators={operators}
      placeholder={placeholder}
      hasFunctions={hasFunctions}
      className={className}
      validationErrors={validationErrors}
    />
  );
}
