import { useCallback, useEffect, useRef } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import * as Portal from "@radix-ui/react-portal";
import { $getNodeByKey, BLUR_COMMAND, COMMAND_PRIORITY_LOW } from "lexical";

import { useEditVariableReference } from "./EditVariableReferenceContext";
import { useAdjustedMenuPosition } from "./useAdjustedMenuPosition";
import { useFlatOptions } from "./VariableReferenceContext";
import { VariableReferenceDropdown } from "./VariableReferenceDropdown";
import { $isVariableReferenceNode, ReferenceNodeVariant } from "./VariableReferenceNode";
import { OptionsDropdownHandle } from "@/components/common/input-tags/OptionsDropdown";
import { Option } from "@/components/ui/input-tag";

type EditVariableReferencePluginProps = {
  /** The options to display in the dropdown */
  scope?: NonNullable<Option>[];
  /** Node variant filter: only show dropdown for specific variant */
  nodeVariant?: ReferenceNodeVariant;
};

export const EditVariableReferencePlugin: React.FC<EditVariableReferencePluginProps> = ({ scope = [], nodeVariant }) => {
  const [editor] = useLexicalComposerContext();
  const { editingNode, stopEditing } = useEditVariableReference();
  const flatOptions = useFlatOptions();
  const dropdownRef = useRef<OptionsDropdownHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter: only show if editing a node that matches the specified variant (or show for all if not specified)
  const shouldShow = editingNode && (!nodeVariant || editingNode.nodeVariant === nodeVariant);

  const adjustedPosition = useAdjustedMenuPosition({
    isOpen: !!shouldShow,
    position: editingNode?.position ?? null,
    dropdownRef,
  });

  const updateNode = useCallback(
    (selectedOption: NonNullable<Option>) => {
      if (!editingNode) return;

      editor.update(() => {
        const node = $getNodeByKey(editingNode.nodeKey);
        if (!$isVariableReferenceNode(node)) return;

        // Build the display label
        let displayLabel = selectedOption.label;
        if (flatOptions && editingNode.nodeVariant === "variable") {
          const ids = selectedOption.value.split(".");
          const labels: string[] = [];
          for (const id of ids) {
            const option = flatOptions.get(id);
            if (option) {
              labels.push(option.label);
            } else {
              labels.push(id);
            }
          }
          displayLabel = labels.join(".");
        }

        // Update the node's properties
        node.setValue(selectedOption.value);
        node.setDisplayLabel(displayLabel);
      });

      stopEditing();
    },
    [editor, editingNode, flatOptions, stopEditing]
  );

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    if (!shouldShow) return;

    const handleClickOutside = (event: MouseEvent) => {
      const container = containerRef.current;
      if (container && !container.contains(event.target as Node)) {
        stopEditing();
      }
    };

    // Use setTimeout to avoid the initial click that opened the dropdown
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [shouldShow, stopEditing]);

  // Handle escape key to close
  useEffect(() => {
    if (!shouldShow) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        stopEditing();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shouldShow, stopEditing]);

  // Close on editor blur
  useEffect(() => {
    if (!shouldShow) return;

    return editor.registerCommand(
      BLUR_COMMAND,
      () => {
        // Check if focus is moving to the dropdown
        setTimeout(() => {
          if (!containerRef.current?.contains(document.activeElement)) {
            stopEditing();
          }
        }, 0);
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor, shouldShow, stopEditing]);

  if (!shouldShow) {
    return null;
  }

  return (
    <Portal.Root>
      <div ref={containerRef}>
        <VariableReferenceDropdown
          ref={dropdownRef}
          options={scope}
          position={adjustedPosition || editingNode.position}
          onSelect={updateNode}
          searchValue={null}
        />
      </div>
    </Portal.Root>
  );
};
