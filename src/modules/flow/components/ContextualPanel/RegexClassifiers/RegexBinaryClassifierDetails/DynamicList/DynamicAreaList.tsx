import InputListContainer from "./InputListContainer";
import { Option } from "@/components/ui/input-tag";
import { DynamicField, DynamicFieldValue } from "@/modules/flow/components/IO";

interface DynamicAreaListProps {
  value: { id: string; value: DynamicFieldValue }[];
  onChange: (value: { id: string; value: DynamicFieldValue }[]) => void;
  valueOptions: NonNullable<Option>[];
}

function DynamicAreaList({ value, onChange, valueOptions }: DynamicAreaListProps) {
  return (
    <InputListContainer
      value={value}
      onChange={onChange}
      defaultValue=""
      renderItem={(itemValue, onItemChange) => (
        <DynamicField
          value={itemValue}
          onChange={onItemChange}
          placeholder="Enter text, type @ to insert variables"
          className="h-10 rounded-md mt-1 border-input border overflow-hidden flex-1"
          scope={valueOptions}
        />
      )}
    />
  );
}

export default DynamicAreaList;
