import { useCallback, useReducer } from "react";

import { extractParameters, updateFunctionsList } from "./utils";
import type { Option } from "@/components/ui/input-tag";
import type { ParameterType, PreprocessingFunction, PreprocessingFunctionWithParams } from "@/modules/dataset/types/preprocessing";

export type SelectedFunction = { id: string; name: string; parameterType: ParameterType };

type EditingState =
  | { mode: "idle" }
  | { mode: "adding"; searchValue: Option; selectedFunction: SelectedFunction | null }
  | { mode: "editing"; functionId: string; searchValue: Option; selectedFunction: SelectedFunction | null };

type EditingAction =
  | { type: "START_ADD" }
  | { type: "START_EDIT"; functionId: string; searchValue: Option; selectedFunction: SelectedFunction | null }
  | { type: "SELECT_FUNCTION"; selectedFunction: SelectedFunction; searchValue: Option }
  | { type: "UPDATE_SEARCH"; searchValue: Option }
  | { type: "CLEAR_SELECTION" }
  | { type: "RESET" };

const initialState: EditingState = { mode: "idle" };

/** Manages state transitions for function editing modes (idle, adding, editing) */
function editingReducer(state: EditingState, action: EditingAction): EditingState {
  switch (action.type) {
    case "START_ADD":
      return { mode: "adding", searchValue: null, selectedFunction: null };
    case "START_EDIT":
      return { mode: "editing", functionId: action.functionId, searchValue: action.searchValue, selectedFunction: action.selectedFunction };
    case "SELECT_FUNCTION":
      if (state.mode === "idle") return state;
      return { ...state, selectedFunction: action.selectedFunction, searchValue: action.searchValue };
    case "UPDATE_SEARCH":
      if (state.mode === "idle") return state;
      return { ...state, searchValue: action.searchValue };
    case "CLEAR_SELECTION":
      if (state.mode === "idle") return state;
      return { ...state, selectedFunction: null, searchValue: null };
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

/** Find function by ID or name (backend-loaded functions use name as ID) */
const findFunctionDef = (functions: PreprocessingFunction[], idOrName: string) => functions.find((f) => f.id === idOrName || f.name === idOrName);

interface UseFunctionEditingParams {
  availableFunctions: PreprocessingFunction[];
  existingFunctions: PreprocessingFunctionWithParams[];
  onSave: (updatedFunctions: PreprocessingFunctionWithParams[]) => void;
}

/**
 * Manages the full lifecycle of preprocessing function editing.
 * Handles adding, editing, selecting, and submitting preprocessing functions
 * via a reducer-based state machine.
 */
export function useFunctionEditing({ availableFunctions, existingFunctions, onSave }: UseFunctionEditingParams) {
  const [state, dispatch] = useReducer(editingReducer, initialState);

  const searchValue = state.mode !== "idle" ? state.searchValue : null;
  const selectedFunction = state.mode !== "idle" ? state.selectedFunction : null;
  const editingFunctionId = state.mode === "editing" ? state.functionId : null;
  const isAddingNew = state.mode === "adding";

  /** Persists a function (add or update) and resets editing state */
  const saveFunction = useCallback(
    (newFunction: PreprocessingFunctionWithParams) => {
      const updated = updateFunctionsList(existingFunctions, newFunction, editingFunctionId);
      onSave(updated);
      dispatch({ type: "RESET" });
    },
    [existingFunctions, editingFunctionId, onSave]
  );

  /** Handles function selection — auto-saves parameterless functions, otherwise enters parameter input mode */
  const handleSelectOption = useCallback(
    (option: Option) => {
      if (!option) return;

      const fn = availableFunctions.find((f) => f.id === option.value);
      if (!fn) return;

      if (fn.parameterType === "None") {
        saveFunction({ functionId: fn.id, functionName: fn.name, parameterType: fn.parameterType });
      } else {
        dispatch({
          type: "SELECT_FUNCTION",
          selectedFunction: { id: fn.id, name: fn.name, parameterType: fn.parameterType },
          searchValue: { label: `${fn.name}[]`, value: fn.id },
        });
      }
    },
    [availableFunctions, saveFunction]
  );

  /** Updates the search input value in the editing state */
  const handleSearchChange = useCallback((value: Option) => {
    dispatch({ type: "UPDATE_SEARCH", searchValue: value });
  }, []);

  /** Clears the currently selected function, returning to search mode */
  const handleClearSelection = useCallback(() => {
    dispatch({ type: "CLEAR_SELECTION" });
  }, []);

  /** Validates and submits the function with its parameters */
  const handleSubmit = useCallback(() => {
    if (!selectedFunction || !searchValue?.label?.trim()) return;

    const parameters = extractParameters(searchValue.label);
    const needsParams = selectedFunction.parameterType !== "None";

    if (!parameters && needsParams) {
      dispatch({ type: "CLEAR_SELECTION" });
      return;
    }

    saveFunction({
      functionId: selectedFunction.id,
      functionName: selectedFunction.name,
      parameterType: selectedFunction.parameterType,
      parameters: parameters || undefined,
    });
  }, [selectedFunction, searchValue, saveFunction]);

  /** Resets the editing state back to idle mode */
  const handleReset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  /** Initializes editing mode for an existing function, restoring its parameters */
  const handleEditFunction = useCallback(
    (functionId: string) => {
      const functionToEdit = existingFunctions.find((f) => f.functionId === functionId);
      if (!functionToEdit) return;

      const fn = findFunctionDef(availableFunctions, functionToEdit.functionId);
      if (!fn) return;

      const basePayload = { type: "START_EDIT" as const, functionId };

      if (functionToEdit.parameters) {
        dispatch({
          ...basePayload,
          searchValue: { label: `${functionToEdit.functionName}[${functionToEdit.parameters}]`, value: fn.id },
          selectedFunction: { id: fn.id, name: fn.name, parameterType: fn.parameterType },
        });
      } else if (fn.parameterType === "None") {
        dispatch({
          ...basePayload,
          searchValue: { label: functionToEdit.functionName, value: fn.id },
          selectedFunction: null,
        });
      } else {
        dispatch({
          ...basePayload,
          searchValue: { label: functionToEdit.functionName, value: functionToEdit.functionId },
          selectedFunction: { id: fn.id, name: fn.name, parameterType: fn.parameterType },
        });
      }
    },
    [existingFunctions, availableFunctions]
  );

  /** Enters the adding mode for a new preprocessing function */
  const handleStartAdd = useCallback(() => {
    dispatch({ type: "START_ADD" });
  }, []);

  return {
    searchValue,
    selectedFunction,
    editingFunctionId,
    isAddingNew,
    handleSelectOption,
    handleSearchChange,
    handleClearSelection,
    handleSubmit,
    handleReset,
    handleEditFunction,
    handleStartAdd,
  };
}
