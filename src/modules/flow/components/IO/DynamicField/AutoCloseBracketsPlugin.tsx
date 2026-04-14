import { useEffect } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getSelection, $isRangeSelection, COMMAND_PRIORITY_LOW, KEY_DOWN_COMMAND } from "lexical";

const BRACKET_PAIRS: Record<string, string> = {
  "(": ")",
  "[": "]",
  "{": "}",
  '"': '"',
  "'": "'",
  "`": "`",
};

/**
 * Lexical plugin that automatically inserts closing brackets/parentheses
 * when an opening bracket is typed.
 */
export function AutoCloseBracketsPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerCommand(
      KEY_DOWN_COMMAND,
      (event: KeyboardEvent) => {
        const key = event.key;
        const closingBracket = BRACKET_PAIRS[key];

        if (!closingBracket) {
          return false; // Let other handlers process this
        }

        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          return false;
        }

        // Prevent the default key handling
        event.preventDefault();

        // Insert both opening and closing brackets
        selection.insertRawText(key + closingBracket);

        // Move cursor back one position (between the brackets)
        const anchorNode = selection.anchor.getNode();
        const anchorOffset = selection.anchor.offset;

        if (anchorOffset > 0) {
          selection.anchor.set(anchorNode.getKey(), anchorOffset - 1, "text");
          selection.focus.set(anchorNode.getKey(), anchorOffset - 1, "text");
        }

        return true; // We handled this command
      },
      COMMAND_PRIORITY_LOW
    );
  }, [editor]);

  return null;
}
