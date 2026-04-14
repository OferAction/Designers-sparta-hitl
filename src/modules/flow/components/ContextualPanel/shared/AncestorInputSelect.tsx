import { useMemo } from "react";

import { useAncestorValueOptions } from "@/modules/flow/hooks/useAncestorValueOptions";

import { OutputList } from "./OutputList";
import { InputLabel } from "@/components/common/InputLabel";
import { Option } from "@/components/ui/input-tag";
import { Select, SelectContent, SelectGroup, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AncestorValueOption } from "@/modules/flow/types";

interface AncestorInputSelectProps {
  selectedNodeId: string;
  currentValue: string;
  onValueChange: (option: Option) => void;
  placeholder?: string;
}

export const AncestorInputSelect = ({ selectedNodeId, currentValue, onValueChange, placeholder = "Select input..." }: AncestorInputSelectProps) => {
  const ancestorOutputOptions = useAncestorValueOptions(selectedNodeId);

  const selectedOption = useMemo(() => {
    if (!currentValue) return null;

    for (const group of ancestorOutputOptions) {
      // Check regular outputs and rule groups
      for (const child of group.children) {
        // If it's a rule group (has children property)
        if ("children" in child && Array.isArray(child.children)) {
          const ruleOutput = child.children.find((output: AncestorValueOption) => output.value === currentValue);
          if (ruleOutput) {
            return {
              ...ruleOutput,
              nodeTitle: group.label,
              ruleGroup: child.label,
            };
          }
        } else {
          // Regular output
          if (child.value === currentValue) {
            return {
              ...child,
              nodeTitle: group.label,
            };
          }
        }
      }
    }
    return null;
  }, [currentValue, ancestorOutputOptions]);

  const handleValueChange = (value: string) => {
    if (!value) {
      onValueChange(null);
      return;
    }

    // Find the full option object for the selected value
    for (const group of ancestorOutputOptions) {
      for (const child of group.children) {
        // If it's a rule group
        if ("children" in child && Array.isArray(child.children)) {
          const option = child.children.find((output: AncestorValueOption) => output.value === value);
          if (option) {
            onValueChange({ ...option, isReference: true });
            return;
          }
        } else {
          // Regular output
          if (child.value === value) {
            onValueChange({ ...child, isReference: true });
            return;
          }
        }
      }
    }

    onValueChange(null);
  };

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-full h-10 bg-background border-border data-[state=open]:ring-2 data-[state=open]:ring-offset-2 data-[state=open]:ring-ring">
        {selectedOption ? (
          <InputLabel
            variant="active"
            size="sm"
            as="label"
            icon={selectedOption.icon && <selectedOption.icon className="h-3 w-3" />}
            value={`${selectedOption.label}`}
          />
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {ancestorOutputOptions.length === 0 ? (
          <div className="px-2 py-1.5 text-sm text-muted-foreground">No ancestor outputs available</div>
        ) : (
          ancestorOutputOptions.map((group) => (
            <SelectGroup key={group.value}>
              {group.children.length > 0 && <SelectLabel className="text-xs text-muted-foreground">{group.label}</SelectLabel>}
              {group.children.map((child) => {
                if ("children" in child && Array.isArray(child.children)) {
                  return (
                    <div key={child.value}>
                      <SelectLabel className="text-xs text-muted-foreground pl-3 flex items-center gap-1.5">
                        {child.icon && <child.icon className="h-3 w-3" />}
                        {child.label}
                      </SelectLabel>
                      <div className="pl-2">
                        <OutputList outputs={child.children} />
                      </div>
                    </div>
                  );
                }
                return <OutputList key={child.value} outputs={[child as AncestorValueOption]} />;
              })}
            </SelectGroup>
          ))
        )}
      </SelectContent>
    </Select>
  );
};
