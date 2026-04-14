import React from "react";

import ConnectionDots from "@/components/common/ConnectionDots";
import { InputLabel } from "@/components/common/InputLabel";

export interface FieldRowProps {
  label: React.ReactNode;
  value: React.ReactNode;
}

export function FieldRow({ label, value }: FieldRowProps) {
  return (
    <div className="flex items-center w-full">
      <div className="flex-1 min-w-0 rounded-sm bg-muted/40 border border-muted p-1">
        <InputLabel as="label" variant="emphasized" size="sm" className="max-w-[70%]">
          {label}
        </InputLabel>
      </div>
      <ConnectionDots />
      <div className="shrink-0 max-w-[340px] rounded-sm bg-muted/40 border border-border/20 p-1">
        <InputLabel as="label" variant="emphasized" size="sm" className="max-w-[240px]">
          {value}
        </InputLabel>
      </div>
    </div>
  );
}

export default FieldRow;
