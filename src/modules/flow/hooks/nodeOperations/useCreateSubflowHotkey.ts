import { useCallback } from "react";

import { useHotkeys } from "react-hotkeys-hook";

import { useCreateSubflow } from "@/modules/flow/hooks/useCreateSubflow";

import { KEYBOARD_SHORTCUTS } from "@/constants";

const HOTKEY_OPTIONS = {
  preventDefault: true,
  enableOnFormTags: false,
  enableOnContentEditable: false,
};

export const useCreateSubflowHotkey = () => {
  const { canCreateSubflow, createSubflowWithRenaming } = useCreateSubflow();

  const handleCreateSubflow = useCallback(() => {
    if (canCreateSubflow) {
      createSubflowWithRenaming();
    }
  }, [canCreateSubflow, createSubflowWithRenaming]);

  useHotkeys(KEYBOARD_SHORTCUTS.CREATE_SUBFLOW.keys, handleCreateSubflow, HOTKEY_OPTIONS, [handleCreateSubflow]);

  return handleCreateSubflow;
};
