import { useCallback, useEffect, useMemo, useRef } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { $getRoot, $isElementNode, CLEAR_EDITOR_COMMAND, EditorState, SerializedEditorState } from "lexical";
import debounce from "lodash.debounce";

import { parseStringToDynamicFieldValue } from "./conversionUtils";
import { Option } from "@/components/ui/input-tag";
import { DynamicFieldOnChange, DynamicFieldValue } from "@/modules/flow/components/IO/DynamicField/types";

type CustomOnChangePluginProps = {
  onChange?: DynamicFieldOnChange;
  value?: DynamicFieldValue;
  flatOptions?: Map<string, NonNullable<Option>>;
};

export const CustomOnChangePlugin: React.FC<CustomOnChangePluginProps> = ({ onChange, value, flatOptions }) => {
  const [editor] = useLexicalComposerContext();
  const lastEmittedStateRef = useRef<string>("");
  const isChangeFromExternalState = useRef<boolean>(false);

  // Convert string values with {{variable}} syntax to SerializedEditorState
  const normalizedValue = useMemo<SerializedEditorState | string | undefined>(() => {
    if (!value) return value;

    // If it's already a SerializedEditorState object, return as is
    if (typeof value === "object") {
      return value;
    }

    // If it's a string, check if it's a JSON string or plain text with {{variables}}
    if (typeof value === "string") {
      // Try to parse as JSON first (it might be a stringified SerializedEditorState)
      try {
        const parsed = JSON.parse(value);
        // If it has a root property, it's likely a SerializedEditorState
        if (parsed && typeof parsed === "object" && "root" in parsed) {
          return value; // Return the JSON string as is
        }
      } catch {
        // Not valid JSON, continue to check for {{variable}} syntax
      }

      // Check if the string contains {{variable}} syntax
      return parseStringToDynamicFieldValue(value, flatOptions);
    }

    return value;
  }, [value, flatOptions]);

  const updateEditorState = useCallback(() => {
    if (!normalizedValue) {
      editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined);
      return;
    }
    const newJSON = typeof normalizedValue === "string" ? normalizedValue : JSON.stringify(normalizedValue);
    const newEditorState = editor.parseEditorState(newJSON);
    editor.setEditorState(newEditorState);
  }, [editor, normalizedValue]);

  // Sync external state changes back to the editor
  useEffect(() => {
    const currentState = editor.getEditorState();
    const currentJSON = JSON.stringify(currentState.toJSON());
    const newJSON = typeof normalizedValue === "string" ? normalizedValue : JSON.stringify(normalizedValue);

    // Only update if the external state is different from current state
    if (currentJSON !== newJSON) {
      queueMicrotask(() => {
        try {
          // Mark that we're updating from external state
          isChangeFromExternalState.current = true;

          updateEditorState();
          setTimeout(() => {
            isChangeFromExternalState.current = false;
          }, 0);
        } catch (error) {
          console.error("Failed to parse editor state:", error);
          isChangeFromExternalState.current = false;
        }
      });
    }
  }, [editor, normalizedValue, updateEditorState]);

  const debouncedOnChange = useMemo(
    () =>
      debounce((editorStateJSON: SerializedEditorState) => {
        const stateString = JSON.stringify(editorStateJSON);

        // Only emit if the state is actually different from what we last emitted
        if (stateString === lastEmittedStateRef.current) {
          return;
        }

        lastEmittedStateRef.current = stateString;
        onChange?.(editorStateJSON);
      }, 200),
    [onChange]
  );

  function handleChange(editorState: EditorState) {
    if (isChangeFromExternalState.current) {
      // Skip emitting onChange for changes originating from external state updates
      return;
    }

    const currentExternalState = normalizedValue ? (typeof normalizedValue === "string" ? normalizedValue : JSON.stringify(normalizedValue)) : "";
    const newState = editorState.toJSON();
    const newStateString = JSON.stringify(newState);

    if (newStateString === currentExternalState) {
      // Skipping onChange - matches external state
      return;
    }

    const isEmpty = editorState.read(() => {
      const root = $getRoot();

      const hasNoChildren = root.getChildren().length === 0;
      if (hasNoChildren) return true;

      const firstChild = root.getFirstChild();
      const hasOnlyEmptyChild = $isElementNode(firstChild) && firstChild.isEmpty();
      return hasOnlyEmptyChild;
    });

    if (isEmpty && !normalizedValue) {
      // Skipping onChange - both states are empty
      return;
    }

    debouncedOnChange(newState);
  }

  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  return <OnChangePlugin onChange={handleChange} />;
};
