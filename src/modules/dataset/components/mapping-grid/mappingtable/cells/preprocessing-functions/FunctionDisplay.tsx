import { InputTag } from "@/components/ui/input-tag";
import { type PreprocessingFunction, type PreprocessingFunctionWithParams } from "@/modules/dataset/types/preprocessing";

interface FunctionDisplayProps {
  existingFunction: PreprocessingFunctionWithParams;
  availableFunctions: PreprocessingFunction[];
  isLast: boolean;
  onStartEdit: () => void;
}

/** Renders a read-only display badge for an applied preprocessing function */
export function FunctionDisplay({ existingFunction, availableFunctions, isLast, onStartEdit }: FunctionDisplayProps) {
  const functionDef = availableFunctions.find((fn) => fn.id === existingFunction.functionId || fn.name === existingFunction.functionId);
  const actualParamType = functionDef?.parameterType || existingFunction.parameterType;
  const hasRegexParam = existingFunction.parameters && actualParamType === "Regex";

  return (
    <span className="inline-flex items-center">
      <InputTag.Root variant="flat" className="cursor-pointer group-hover/row:border-muted group-hover/row:divide-muted" onClick={onStartEdit}>
        <InputTag.List>
          <div className="inline-flex items-center gap-1 px-2 py-0.5 max-w-full">
            <span className="text-sm break-all text-blue-foreground">
              {existingFunction.functionName}
              {existingFunction.parameters && (
                <>[{hasRegexParam ? <span className="text-purple-accent">regex_pattern</span> : existingFunction.parameters}]</>
              )}
            </span>
          </div>
        </InputTag.List>
      </InputTag.Root>
      {!isLast && <span className="text-sm text-muted-foreground">,</span>}
    </span>
  );
}
