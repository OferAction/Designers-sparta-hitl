import { useState, useEffect } from "react";

import { YjsCollaborationManager } from "@/services/hocusPocus/yjsCollaboration";

export const useUndoRedo = (collaborationManager: YjsCollaborationManager | null | undefined) => {
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const undoManager = collaborationManager?.undoManager;

  useEffect(() => {
    if (!undoManager) {
      setCanUndo(false);
      setCanRedo(false);
      return;
    }

    // Initial state
    setCanUndo(undoManager.canUndo());
    setCanRedo(undoManager.canRedo());

    // Listen for stack changes
    const updateUndoRedoState = () => {
      setCanUndo(undoManager.canUndo());
      setCanRedo(undoManager.canRedo());
    };

    // UndoManager emits 'stack-item-added' and 'stack-item-popped' events
    undoManager.on("stack-item-added", updateUndoRedoState);
    undoManager.on("stack-item-popped", updateUndoRedoState);

    return () => {
      undoManager.off("stack-item-added", updateUndoRedoState);
      undoManager.off("stack-item-popped", updateUndoRedoState);
    };
  }, [undoManager]);

  const undo = () => {
    if (undoManager && undoManager.canUndo()) {
      collaborationManager.undo();
    }
  };

  const redo = () => {
    if (undoManager && undoManager.canRedo()) {
      collaborationManager.redo();
    }
  };

  return {
    canUndo,
    canRedo,
    undo,
    redo,
  };
};
