import { useCallback } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as Portal from "@radix-ui/react-portal";
import { $createTextNode } from "lexical";

import { useKeyboardCommands } from "./useKeyboardCommands";
import { useVariableReferenceMenu } from "./useVariableReferenceMenu";
import { useFlatOptions } from "./VariableReferenceContext";
import { VariableReferenceDropdown } from "./VariableReferenceDropdown";
import { $createVariableReferenceNode, ReferenceNodeVariant } from "./VariableReferenceNode";
import { Option } from "@/components/ui/input-tag";

export function flattenOptions(options: NonNullable<Option>[]): Map<string, NonNullable<Option>> {
  const result: Map<string, NonNullable<Option>> = new Map();

  const traverse = (opts: NonNullable<Option>[]) => {
    for (const opt of opts) {
      result.set(opt.id || opt.value, opt);
      if (opt.children && opt.children.length > 0) {
        traverse(opt.children);
      }
    }
  };

  traverse(options);
  return result;
}

type VariableReferencePluginProps = {
  /** The options to display in the dropdown */
  scope?: NonNullable<Option>[];
  /** The trigger character (default: '@') */
  trigger?: string;
  /** Node variant: "variable" (default) or "operator" */
  nodeVariant?: ReferenceNodeVariant;
  /** Optional container element to render the portal within */
  portalContainer?: HTMLElement | null;
};

export const VariableReferencePlugin: React.FC<VariableReferencePluginProps> = ({
  scope = [],
  trigger = "@",
  nodeVariant = "variable",
  portalContainer,
}) => {
  const [editor] = useLexicalComposerContext();
  const { searchValue, menuPosition, triggerNodeRef, dropdownRef, closeMenu, shouldOpenDropdown, queryStartIndex, cursorOffset } =
    useVariableReferenceMenu({ trigger, portalContainer });
  const flatOptions = useFlatOptions();

  const insertReference = useCallback(
    (selectedOption: NonNullable<Option>) => {
      editor.update(() => {
        if (!triggerNodeRef.current || queryStartIndex === null || cursorOffset === null) {
          return;
        }

        const node = triggerNodeRef.current;
        const textContent = node.getTextContent();
        const beforeText = textContent.substring(0, queryStartIndex);
        const afterText = textContent.substring(cursorOffset);

        // Create the reference node with the specified variant
        const referenceNode = $createVariableReferenceNode(
          selectedOption,
          nodeVariant === "variable" ? flatOptions || undefined : undefined,
          nodeVariant
        );

        // Create text nodes
        const beforeNode = beforeText ? $createTextNode(beforeText) : null;
        const afterNode = afterText ? $createTextNode(afterText) : $createTextNode("");

        // Replace the text node
        if (beforeNode) {
          node.replace(beforeNode);
          beforeNode.insertAfter(referenceNode);
        } else {
          node.replace(referenceNode);
        }
        referenceNode.insertAfter(afterNode);
        referenceNode.selectEnd();

        closeMenu();
      });
    },
    [editor, closeMenu, flatOptions, nodeVariant, triggerNodeRef, queryStartIndex, cursorOffset]
  );

  useKeyboardCommands({
    shouldOpenDropdown,
    dropdownRef,
    onClose: closeMenu,
  });

  if (!shouldOpenDropdown) {
    return null;
  }

  return (
    <Portal.Root container={portalContainer}>
      <VariableReferenceDropdown ref={dropdownRef} options={scope} position={menuPosition} onSelect={insertReference} searchValue={searchValue} />
    </Portal.Root>
  );
};
