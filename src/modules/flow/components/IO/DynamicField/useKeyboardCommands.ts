import { useEffect, RefObject } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  COMMAND_PRIORITY_CRITICAL,
  KEY_ARROW_DOWN_COMMAND,
  KEY_ARROW_UP_COMMAND,
  KEY_ENTER_COMMAND,
  KEY_ESCAPE_COMMAND,
  KEY_TAB_COMMAND,
} from "lexical";

import { OptionsDropdownHandle } from "@/components/common/input-tags/OptionsDropdown";

type UseKeyboardCommandsProps = {
  shouldOpenDropdown: boolean;
  dropdownRef: RefObject<OptionsDropdownHandle>;
  onClose: () => void;
};

export const useKeyboardCommands = ({ shouldOpenDropdown, dropdownRef, onClose }: UseKeyboardCommandsProps) => {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        KEY_ARROW_DOWN_COMMAND,
        (event) => {
          if (shouldOpenDropdown) {
            event?.preventDefault();
            dropdownRef.current?.selectNext();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        KEY_ARROW_UP_COMMAND,
        (event) => {
          if (shouldOpenDropdown) {
            event?.preventDefault();
            dropdownRef.current?.selectPrevious();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        KEY_TAB_COMMAND,
        (event) => {
          if (shouldOpenDropdown) {
            event?.preventDefault();
            dropdownRef.current?.selectCurrent();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          if (shouldOpenDropdown) {
            event?.preventDefault();
            event?.stopPropagation();
            dropdownRef.current?.selectCurrent();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        (event) => {
          if (shouldOpenDropdown) {
            event?.preventDefault();
            onClose();
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [editor, shouldOpenDropdown, dropdownRef, onClose]);
};
