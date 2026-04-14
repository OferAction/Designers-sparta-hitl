import React, { useMemo } from "react";

import { KEYBOARD_SHORTCUTS } from "../../../constants/KeyboardShortcuts";
import hocusPocusService from "@/services/hocusPocus/collaborativeService";

import Shortcut, { type ShortcutDefinition } from "@/utils/Shortcut";

export const UndoRedoControls: React.FC = () => {
  const shortcuts = useMemo<ShortcutDefinition[]>(
    () => [
      {
        id: "undo-redo-undo",
        keys: KEYBOARD_SHORTCUTS.UNDO.keys,
        handler: () => hocusPocusService.collaborationManager?.undo(),
        options: { preventDefault: true },
      },
      {
        id: "undo-redo-redo",
        keys: KEYBOARD_SHORTCUTS.REDO.keys,
        handler: () => hocusPocusService.collaborationManager?.redo(),
        options: { preventDefault: true },
      },
    ],
    []
  );

  return <Shortcut shortcuts={shortcuts} />;
};
