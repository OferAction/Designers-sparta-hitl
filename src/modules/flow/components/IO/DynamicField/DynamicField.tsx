import { useMemo } from "react";

import { CodeNode } from "@lexical/code";
import { ListItemNode, ListNode } from "@lexical/list";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";

import { CustomOnChangePlugin } from "./CustomOnChangePlugin";
import { DynamicFieldOnChange, DynamicFieldValue } from "./types";
import { VariableReferenceProvider, VariableReferenceVariant } from "./VariableReferenceContext";
import { VariableReferenceNode } from "./VariableReferenceNode";
import { flattenOptions, VariableReferencePlugin } from "./VariableReferencePlugin";
import { Option } from "@/components/ui/input-tag";
import { cn } from "@/utils";

function Placeholder({ placeholder }: { placeholder?: string }) {
  return (
    <div className="absolute text-muted-foreground top-0 px-3 py-2 text-sm pointer-events-none">
      {placeholder ?? "You can use ‘@’ to add dynamic data"}
    </div>
  );
}

interface DynamicFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value"> {
  onChange?: DynamicFieldOnChange;
  value?: DynamicFieldValue;
  namespace?: string;
  scope?: NonNullable<Option>[];
  placeholder?: string;
  variableVariant?: VariableReferenceVariant;
  portalContainer?: HTMLElement | null;
}

const theme = {
  paragraph: "editor-paragraph",
};

export const DynamicField: React.FC<React.PropsWithChildren<DynamicFieldProps>> = ({
  onChange,
  value,
  namespace,
  scope,
  placeholder,
  variableVariant,
  className,
  portalContainer,
  children,
  ...rest
}) => {
  const initialConfig = useMemo(
    () => ({
      namespace: namespace ?? "lexical-dynamic-field",
      onError(error: unknown) {
        console.error(error);
      },
      theme,
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode, VariableReferenceNode],
    }),
    [namespace]
  );

  const flatOptions = useMemo(() => flattenOptions(scope || []), [scope]);

  return (
    <VariableReferenceProvider value={{ flatOptions, variant: variableVariant }}>
      <LexicalComposer initialConfig={initialConfig}>
        <div className={cn("grid grid-rows-[auto_1fr] relative", className)} {...rest}>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                className="h-[120px] px-3 py-2 overflow-y-scroll focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background bg-background text-sm rounded-md p-4 outline-none border border-border"
              />
            }
            placeholder={<Placeholder placeholder={placeholder} />}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <CustomOnChangePlugin flatOptions={flatOptions} onChange={onChange} value={value} />
          <VariableReferencePlugin scope={scope} portalContainer={portalContainer} />
          <ClearEditorPlugin />
          {children}
        </div>
      </LexicalComposer>
    </VariableReferenceProvider>
  );
};
