import { SelectItem } from "@/components/ui/select";
import { AncestorValueOption } from "@/modules/flow/types";

interface OutputListProps {
  outputs: AncestorValueOption[];
}

export const OutputList = ({ outputs }: OutputListProps) => {
  return (
    <>
      {outputs.map((output) => {
        const IconComponent = output.icon;
        return (
          <SelectItem key={output.value} value={output.value}>
            <div className="flex items-center gap-2">
              {IconComponent && <IconComponent className="h-4 w-4" />}
              <span>{output.label}</span>
            </div>
          </SelectItem>
        );
      })}
    </>
  );
};
