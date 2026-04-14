import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot, $isParagraphNode, TextNode } from "lexical";

import { ValidationError } from "@/components/common/input-tags/ConditionField/constants";
import { $isVariableReferenceNode } from "@/modules/flow/components/IO/DynamicField/VariableReferenceNode";

interface ValidationStatePluginProps {
  errors?: ValidationError[];
}

/**
 * Plugin that sets error messages on variable reference nodes based on validation
 */
export default function ValidationStatePlugin({ errors = [] }: ValidationStatePluginProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Get condition parts to map indices to nodes
    const editorState = editor.getEditorState();
    editorState.read(() => {
      try {
        // Create a map of index to error
        const errorMap = new Map<number, ValidationError>();

        errors.forEach((error) => {
          if (error.index !== undefined) {
            errorMap.set(error.index, error);
          }
        });

        // Update nodes with error state
        editor.update(() => {
          const root = $getRoot();
          let partIndex = 0;

          root.getChildren().forEach((paragraph) => {
            if ($isParagraphNode(paragraph)) {
              paragraph.getChildren().forEach((node) => {
                // Only process variable reference nodes
                if ($isVariableReferenceNode(node)) {
                  const error = errorMap.get(partIndex);

                  // Update node with error message
                  if (error) {
                    node.setErrorMessage(error.message);
                  } else {
                    // Clear error if none exists
                    node.setErrorMessage(undefined);
                  }

                  partIndex++;
                } else if (node.getType() === "text") {
                  // Text nodes are also condition parts
                  const textContent = (node as TextNode).getTextContent?.() || "";
                  if (textContent.trim()) {
                    partIndex++;
                  }
                }
              });
            }
          });
        });
      } catch (error) {
        console.error("Error setting validation state:", error);
      }
    });
  }, [editor, errors]);

  return null;
}
