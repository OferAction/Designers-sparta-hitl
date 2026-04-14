import { useMemo, useCallback, useEffect } from "react";

import { CodeNode } from "@lexical/code";
import { ListItemNode, ListNode } from "@lexical/list";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { InitialConfigType, LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $getSelection, $isRangeSelection, Klass, LexicalNode } from "lexical";

import { extractConditionParts } from "./conversionUtils";
import InsertTypesPlugin from "./InsertTypesPlugin";
import { GROUPED_OPERATORS } from "./operators";
import { PlaceholderNode } from "./PlaceholderNode";
import { TypesSelectionNode, $createTypesSelectionNode } from "./TypesSelectionNode";
import { Option } from "@/components/ui/input-tag";
import {
  FUNCTION_OPTIONS as FILTER_FUNCTION_OPTIONS,
  TYPE_OPTIONS as FILTER_TYPE_OPTIONS,
} from "@/modules/flow/components/ContextualPanel/FilterAgent/types";
import { AutoCloseBracketsPlugin } from "@/modules/flow/components/IO/DynamicField/AutoCloseBracketsPlugin";
import { CustomOnChangePlugin } from "@/modules/flow/components/IO/DynamicField/CustomOnChangePlugin";
import { EditVariableReferenceProvider } from "@/modules/flow/components/IO/DynamicField/EditVariableReferenceContext";
import { EditVariableReferencePlugin } from "@/modules/flow/components/IO/DynamicField/EditVariableReferencePlugin";
import { DynamicFieldOnChange, DynamicFieldValue } from "@/modules/flow/components/IO/DynamicField/types";
import ValidationStatePlugin from "@/modules/flow/components/IO/DynamicField/ValidationStatePlugin";
import { VariableReferenceProvider, VariableReferenceVariant } from "@/modules/flow/components/IO/DynamicField/VariableReferenceContext";
import { VariableReferenceNode } from "@/modules/flow/components/IO/DynamicField/VariableReferenceNode";
import { flattenOptions, VariableReferencePlugin } from "@/modules/flow/components/IO/DynamicField/VariableReferencePlugin";
import { cn } from "@/utils";

export { GROUPED_OPERATORS };

// Define nodes at module scope to prevent HMR issues with Lexical node registration
const CONDITION_FIELD_NODES: ReadonlyArray<Klass<LexicalNode>> = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  CodeNode,
  VariableReferenceNode,
  PlaceholderNode,
  TypesSelectionNode,
];

export type OperatorOption = {
  value: string;
  label: string;
  keywords?: string[];
};

export const DEFAULT_OPERATORS: Option[] = [
  { value: "== True", label: "Is true", keywords: ["Is true", "true", "yes", "1"] },
  { value: "== False", label: "Is false", keywords: ["Is false", "false", "no", "0"] },
  { value: "and", label: "And", keywords: ["and", "&&"] },
  { value: "or", label: "Or", keywords: ["or", "||"] },
  { value: "not", label: "Not", keywords: ["not", "!"] },
  { value: ">", label: "Greater than", keywords: [">", "gt", "greater"] },
  { value: ">=", label: "Greater than or equal", keywords: [">=", "gte"] },
  { value: "<", label: "Less than", keywords: ["<", "lt", "less"] },
  { value: "<=", label: "Less than or equal", keywords: ["<=", "lte"] },
  { value: "==", label: "Equals to", keywords: ["==", "=", "equal", "equals"] },
  { value: "!=", label: "Not equal to", keywords: ["!=", "neq", "not equal"] },
  { value: "contains", label: "Contains", keywords: ["contains", "include"] },
  { value: "not_contains", label: "Not contains", keywords: ["not contains", "exclude"] },
  { value: "starts_with", label: "Starts with", keywords: ["starts", "prefix"] },
  { value: "ends_with", label: "Ends with", keywords: ["ends", "suffix"] },
  { value: "in", label: "In", keywords: ["in", "within"] },
  { value: "not_in", label: "Not in", keywords: ["not in"] },
  { value: "is_empty", label: "Is empty", keywords: ["is empty", "empty"] },
  { value: "is_not_empty", label: "Is not empty", keywords: ["is not empty", "not empty"] },
];

export const FUNCTION_OPTIONS: OperatorOption[] = FILTER_FUNCTION_OPTIONS as OperatorOption[];
export const TYPE_OPTIONS: OperatorOption[] = FILTER_TYPE_OPTIONS as OperatorOption[];

const FUNCTION_OPTIONS_AS_OPTIONS: NonNullable<Option>[] = FUNCTION_OPTIONS.map((fn) => ({
  value: fn.value,
  label: fn.label,
  id: fn.value,
  type: "function",
  keywords: fn.keywords,
}));

function InsertTypesNodeOnIsinstance() {
  const [editor] = useLexicalComposerContext();

  const checkIfShouldOpen = useCallback(() => {
    const editorState = editor.getEditorState();
    let should = false;
    editorState.read(() => {
      const json = editorState.toJSON();
      try {
        // Prevent duplicate types selection nodes
        const hasTypesNode = (function scan(n: any): boolean {
          if (!n) return false;
          if (Array.isArray(n)) return n.some(scan);
          if (typeof n === "object") {
            if (n.type === "typesSelection") return true;
            // children may exist on element nodes
            return scan(n.children);
          }
          return false;
        })(json.root);
        if (hasTypesNode) {
          should = false;
          return;
        }
        const parts = extractConditionParts(json);
        if (parts.length === 0) return;
        // Look at the last occurrence of [operator:isinstance, variable] near the end
        for (let i = parts.length - 1; i >= 1; i--) {
          const a = parts[i - 1];
          if (a.type === "operator" && String(a.value).toLowerCase() === "isinstance") {
            should = true;
            break;
          }
        }
      } catch {
        should = false;
      }
    });
    return should;
  }, [editor]);

  useEffect(() => {
    const el = editor.getRootElement();
    if (!el) return;

    const tryInsert = () => {
      if (checkIfShouldOpen()) {
        editor.update(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = $createTypesSelectionNode([]);
            selection.insertNodes([node]);
            node.selectEnd();
          }
        });
      }
    };

    const onClick = () => tryInsert();
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === " " || ev.key === "Enter") {
        tryInsert();
      }
    };

    el.addEventListener("click", onClick);
    el.addEventListener("keydown", onKeyDown as any);

    return () => {
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKeyDown as any);
    };
  }, [editor, checkIfShouldOpen]);
  return null;
}

function Placeholder({ placeholder }: { placeholder?: string }) {
  return (
    <div className="absolute text-muted-foreground top-0 px-3 py-2 text-sm pointer-events-none">
      {placeholder ?? "Use '@' for variables, '$' for functions, '#' for operators"}
    </div>
  );
}

interface ConditionFieldProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange" | "value"> {
  onChange?: DynamicFieldOnChange;
  value?: DynamicFieldValue;
  namespace?: string;
  scope?: NonNullable<Option>[];
  /** Pre-grouped operator options for the dropdown */
  operators?: NonNullable<Option>[];
  placeholder?: string;
  /** Style variant for variable references */
  variableVariant?: VariableReferenceVariant;
  hasFunctions?: boolean;
  validationErrors?: Array<{ message: string; index?: number }>;
}

const theme = {
  paragraph: "editor-paragraph",
};
export const ConditionField: React.FC<ConditionFieldProps> = ({
  onChange,
  value,
  namespace,
  scope,
  operators = GROUPED_OPERATORS,
  placeholder,
  variableVariant = "conditionVariable",
  hasFunctions = false,
  className,
  validationErrors,
  ...rest
}) => {
  const initialConfig = useMemo<InitialConfigType>(
    () => ({
      namespace: namespace ?? "lexical-condition-field",
      onError(error: unknown) {
        console.error(error);
      },
      theme,
      nodes: [...CONDITION_FIELD_NODES],
    }),
    [namespace]
  );

  const flatOptions = useMemo(() => flattenOptions(scope || []), [scope]);

  return (
    <VariableReferenceProvider value={{ flatOptions, variant: variableVariant }}>
      <LexicalComposer initialConfig={initialConfig}>
        <EditVariableReferenceProvider>
          <div className={cn("grid grid-rows-[auto_1fr] relative align-middle", className)} {...rest}>
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="min-h-8 w-full px-3 py-1.5  overflow-y-auto text-sm rounded-md outline-none border-none"
                />
              }
              placeholder={<Placeholder placeholder={placeholder} />}
              ErrorBoundary={LexicalErrorBoundary}
            />
            <CustomOnChangePlugin flatOptions={flatOptions} onChange={onChange} value={value} />
            <InsertTypesNodeOnIsinstance />
            <InsertTypesPlugin />
            <ValidationStatePlugin errors={validationErrors} />
            {/* Variables: triggered by '@' */}
            <VariableReferencePlugin scope={scope} />
            {/* Operators: triggered by '#' with operator variant */}
            <VariableReferencePlugin trigger="#" scope={operators} nodeVariant="operator" />
            {/* Functions: triggered by '$' with operator variant */}
            {hasFunctions && <VariableReferencePlugin trigger="$" scope={FUNCTION_OPTIONS_AS_OPTIONS} nodeVariant="function" />}
            {/* Edit plugins for clicking on existing references - order matters for operator variants */}
            <EditVariableReferencePlugin scope={scope} nodeVariant="variable" />
            <EditVariableReferencePlugin scope={FUNCTION_OPTIONS_AS_OPTIONS} nodeVariant="function" />
            <EditVariableReferencePlugin scope={operators} nodeVariant="operator" />
            <AutoCloseBracketsPlugin />
            <ClearEditorPlugin />
          </div>
        </EditVariableReferenceProvider>
      </LexicalComposer>
    </VariableReferenceProvider>
  );
};
