import React from "react";

import { DynamicField, DynamicFieldValue } from "@/modules/flow/components/IO";
import { useAllValueOptions } from "@/modules/flow/hooks";
import { cn } from "@/utils";

interface MessageContentProps {
  expression?: DynamicFieldValue;
  fallbackText?: string;
  className?: string;
}

const MessageContent: React.FC<MessageContentProps> = ({ expression, fallbackText, className }) => {
  const allValueOptions = useAllValueOptions();

  const value: DynamicFieldValue = expression ?? (fallbackText ?? "");
  return (
    <DynamicField
      value={value}
      scope={allValueOptions}
      variableVariant="chatMessage"
      className={cn(
        "pointer-events-none [&_.editor-paragraph]:m-0 [&>div]:min-h-0 [&>div]:max-h-none [&>div]:h-auto [&>div]:px-0 [&>div]:py-0 [&>div]:border-none [&>div]:bg-transparent [&>div]:focus-within:ring-0 [&>div]:focus-within:ring-offset-0 [&>div]:rounded-md [&>div]:overflow-visible",
        className
      )}
    />
  );
};

export default MessageContent;
