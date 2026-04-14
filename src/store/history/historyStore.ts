import { applyPatches, Patch } from "immer";
import { StateCreator, StoreApi } from "zustand";

import { PathPattern } from "@/utils/pathMatch";

export interface HistoryOptions {
  limit?: number;
  exclude?: PathPattern[];
  debounceDelay?: number;
}

export type HistoryStore<T> = {
  undo: () => void;
  redo: () => void;
  flush: () => void;
  undoStack: Array<{ patches: Patch[]; inversePatches: Patch[] }>;
  redoStack: Array<{ patches: Patch[]; inversePatches: Patch[] }>;
  capturedState: Partial<T> | null;
  capturedChanges: Partial<T> | null;
  canUndo: boolean;
  canRedo: boolean;
  isPaused: boolean;
  addNewPatch: (patches: Patch[], inversePatches: Patch[]) => void;
  pause: () => void;
  resume: () => void;
};

export const historyStateCreator = <T extends object>(
  userSet: StoreApi<T>["setState"],
  userGet: StoreApi<T>["getState"],
  options: HistoryOptions = {}
) => {
  const stateCreator: StateCreator<HistoryStore<T>, [], []> = (set, get) => {
    // Default limit is 50 if not provided
    const limit = options.limit ?? 50;

    const addNewPatch = (patches: Patch[], inversePatches: Patch[]) => {
      const state = get();
      const newUndoStack = [...state.undoStack, { patches, inversePatches }];
      set(() => ({
        undoStack: newUndoStack.length > limit ? newUndoStack.slice(-limit) : newUndoStack,
        redoStack: [],
        canUndo: true,
        canRedo: false,
      }));
    };

    const undo = () => {
      const state = get();
      if (!state.canUndo) return;

      const { inversePatches, patches } = state.undoStack[state.undoStack.length - 1];
      const currentState = userGet();
      const nextState = applyPatches(currentState, inversePatches);

      const newUndoStack = state.undoStack.slice(0, -1);
      const newRedoStack = [...state.redoStack, { patches, inversePatches }];

      set(() => ({
        undoStack: newUndoStack,
        redoStack: newRedoStack.length > limit ? newRedoStack.slice(-limit) : newRedoStack,
        canUndo: newUndoStack.length > 0,
        canRedo: true,
        isPaused: true,
      }));

      userSet(() => nextState, true);
      setTimeout(() => {
        // deferring resuming history tracking after the side effects are done
        set(() => ({
          isPaused: false,
        }));
      });
    };

    const redo = () => {
      const state = get();
      if (!state.canRedo) return;
      const { patches, inversePatches } = state.redoStack[state.redoStack.length - 1];
      const currentState = userGet();
      const nextState = applyPatches(currentState, patches);

      const newRedoStack = state.redoStack.slice(0, -1);
      const newUndoStack = [...state.undoStack, { patches, inversePatches }];
      set(() => ({
        redoStack: newRedoStack,
        undoStack: newUndoStack.length > limit ? newUndoStack.slice(-limit) : newUndoStack,
        canUndo: true,
        canRedo: newRedoStack.length > 0,
        isPaused: true,
      }));

      userSet(() => nextState, true);

      setTimeout(() => {
        // deferring resuming history tracking after the side effects are done
        set(() => ({
          isPaused: false,
        }));
      });
    };

    const flush = () => {
      set(() => ({
        undoStack: [] as Array<{ patches: Patch[]; inversePatches: Patch[] }>,
        redoStack: [] as Array<{ patches: Patch[]; inversePatches: Patch[] }>,
        capturedState: null,
        capturedChanges: null,
        canUndo: false,
        canRedo: false,
      }));
    };

    return {
      undo,
      redo,
      flush,
      undoStack: [],
      redoStack: [],
      capturedState: null,
      capturedChanges: null,
      canUndo: false,
      canRedo: false,
      isPaused: false,
      pause: () => set({ isPaused: true }),
      resume: () => set({ isPaused: false }),
      addNewPatch,
    };
  };
  return stateCreator;
};
