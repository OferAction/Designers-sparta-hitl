import { InputRenderer } from "./InputRenderer";
import { InputsSectionProps } from "./types";

export const InputsSection = ({ inputs, scope }: InputsSectionProps) => {
  if (!inputs) return null;

  return (
    <div className="flex flex-col gap-2 max-h-full max-w-full px-1 pb-2 overflow-y-auto overflow-x-hidden styled-scrollbar ">
      <h2 className="text-xs text-sidebar-foreground/70 pb-3">Sample Inputs</h2>

      {inputs.length > 0 && (
        <div className="flex flex-col gap-3">
          {inputs.map((input) => (
            <InputRenderer key={input.value} input={input} scope={scope} />
          ))}
        </div>
      )}
      {inputs.length === 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-xs text-sidebar-foreground/70 text-center">There are no inputs to fill</span>
        </div>
      )}
    </div>
  );
};
