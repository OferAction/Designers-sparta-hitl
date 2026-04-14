import React, { useCallback } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  $getNodeByKey,
  $getSelection,
  $isNodeSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  NodeKey,
} from "lexical";

import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";

import { useEditVariableReferenceOptional } from "./EditVariableReferenceContext";
import { $isVariableReferenceNode, ReferenceNodeVariant } from "./VariableReferenceNode";
import WithTooltip from "@/components/common/WithTooltip";
import { VALUE_ICONS_MAP } from "@/constants";
import { useFlatOptions, useVariableReferenceVariant } from "@/modules/flow/components/IO/DynamicField/VariableReferenceContext";
import { cn } from "@/utils";

type VariableReferenceComponentProps = {
  nodeKey: NodeKey;
  value: string;
  text?: string;
  id?: string;
  /** Node variant: "variable" or "operator" */
  nodeVariant?: ReferenceNodeVariant;
  /** Error message to display in tooltip and style as error */
  errorMessage?: string;
};

const variantStyles = {
  variable: {
    base: "bg-muted border border-transparent",
    hover: "hover:bg-accent hover:border hover:border-input",
    selected: "ring-2 ring-primary ring-offset-2 ring-offset-background",
  },
  chatMessage: {
    base: "bg-secondary border border-border px-1.5 py-0.5 rounded-md leading-5 gap-1",
    hover: "",
    selected: "",
  },
  operator: {
    base: "p-1 text-sm rounded-md font-medium mr-2 border border-transparent text-muted-foreground",
    hover: "hover:bg-accent hover:border hover:border-input",
    selected: "ring-2 ring-purple-accent ring-offset-2 ring-offset-background bg-secondary ",
  },
  conditionVariable: {
    base: "p-1 text-sm text-purple-accent rounded-md mr-2 border border-transparent",
    hover: "hover:bg-purple-accent/20 hover:border hover:border-input",
    selected: "ring-2 ring-purple-accent ring-offset-2 ring-offset-background bg-secondary ",
  },
  conditionVariableError: {
    base: "p-1 text-sm text-destructive rounded-md mr-2",
    hover: "hover:bg-destructive/20 hover:border hover:border-input",
    selected: "ring-2 ring-destructive ring-offset-2 ring-offset-background bg-secondary ",
  },
};

const VariableReferenceComponent: React.FC<VariableReferenceComponentProps> = ({
  nodeKey,
  value,
  text,
  id,
  nodeVariant = "variable",
  errorMessage,
}) => {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
  const flatOptions = useFlatOptions();
  const variant = useVariableReferenceVariant();
  const editContext = useEditVariableReferenceOptional();

  const ref = React.useRef<HTMLSpanElement>(null);

  const type = (flatOptions?.get(id || value)?.type as string | undefined) || "";
  const TypeIcon = VALUE_ICONS_MAP(type);

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        event.preventDefault();
        const node = $getNodeByKey(nodeKey);
        if ($isVariableReferenceNode(node)) node.remove();
        return true;
      }
      return false;
    },
    [isSelected, nodeKey]
  );

  const onClick = useCallback(
    (event: MouseEvent) => {
      const el = ref.current;
      if (el && el.contains(event.target as Node)) {
        if (!event.shiftKey) clearSelection();
        setSelected(true);

        // Get position for the edit dropdown
        if (editContext && el) {
          const rect = el.getBoundingClientRect();
          editContext.startEditing({
            nodeKey,
            value,
            text,
            id,
            nodeVariant,
            position: {
              x: rect.left,
              y: rect.bottom + 4,
            },
          });
        }

        return true;
      }
      return false;
    },
    [clearSelection, setSelected, editContext, nodeKey, value, text, id, nodeVariant]
  );

  React.useEffect(() => {
    return mergeRegister(
      editor.registerCommand(CLICK_COMMAND, onClick, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_DELETE_COMMAND, onDelete, COMMAND_PRIORITY_LOW),
      editor.registerCommand(KEY_BACKSPACE_COMMAND, onDelete, COMMAND_PRIORITY_LOW)
    );
  }, [editor, onClick, onDelete]);

  const styleKey =
    nodeVariant === "operator" || nodeVariant === "function"
      ? "operator"
      : variant === "conditionVariable"
        ? errorMessage
          ? "conditionVariableError"
          : "conditionVariable"
        : variant === "chatMessage"
          ? "chatMessage"
          : "variable";

  const styles = variantStyles[styleKey];

  const variableComponent = (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-0.5 m-0.5 text-sm cursor-pointer select-none align-middle leading-none transition-colors",
        styles.base,
        styles.hover,
        isSelected && styles.selected
      )}
      {...(nodeVariant === "operator"
        ? { "data-operator-reference": value }
        : nodeVariant === "function"
          ? { "data-function-reference": value }
          : { "data-variable-reference": value, "data-variable-reference-id": id })}
    >
      <TypeIcon
        className={cn(
          "w-4 h-4 flex-shrink-0",
          (styleKey === "conditionVariable" || styleKey === "conditionVariableError" || styleKey === "operator") && "hidden"
        )}
      />
      <span className={cn("leading-none ", styleKey === "chatMessage" && "max-w-[120px] truncate")}>{text || value}</span>
    </span>
  );

  // Only show tooltip if there's an error message
  if (errorMessage) {
    return (
      <WithTooltip tooltip={errorMessage} withProvider={false} side="top">
        {variableComponent}
      </WithTooltip>
    );
  }

  return variableComponent;
};

export default VariableReferenceComponent;
