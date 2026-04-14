import { useMemo } from "react";

import { useShallow } from "zustand/shallow";

import { AddFunctionButton, FunctionDisplay, FunctionInputTag } from "./preprocessing-functions";
import { useFunctionEditing } from "./preprocessing-functions/useFunctionEditing";
import { getSelectableFunctions, usePreprocessingFunctions } from "./preprocessing-functions/usePreprocessingFunctions";
import type { NodeInputOutputType } from "@/modules/flow/types/BaseNodeTypes";
import { FlowStoreState, useFlowStore } from "@/store";

interface EvaluationFunctionsCellProps {
  nodeId: string;
  outputId: string;
  outputType?: NodeInputOutputType["type"];
}

const selector = (state: FlowStoreState) => ({
  setPreprocessingFunctions: state.setPreprocessingFunctions,
  removePreprocessingFunction: state.removePreprocessingFunction,
});

const EvaluationFunctionsCell = ({ nodeId, outputId, outputType }: EvaluationFunctionsCellProps) => {
  const { setPreprocessingFunctions, removePreprocessingFunction } = useFlowStore(useShallow(selector));

  const { existingFunctions, availableFunctions, isLoading } = usePreprocessingFunctions({ nodeId, outputId, outputType });

  const {
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
  } = useFunctionEditing({
    availableFunctions,
    existingFunctions,
    onSave: (updatedFunctions) => setPreprocessingFunctions(nodeId, outputId, updatedFunctions),
  });

  /** Handles keyboard shortcuts: Enter to submit, Escape to cancel, Backspace to step back */
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { key } = e;

    if (key === "Enter" && selectedFunction && searchValue?.label?.trim()) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    if (key === "Escape") {
      e.preventDefault();
      handleReset();
      return;
    }

    if (key === "Backspace" && !searchValue?.label) {
      e.preventDefault();

      if (selectedFunction) {
        handleClearSelection();
      } else if (editingFunctionId) {
        removePreprocessingFunction(nodeId, outputId, editingFunctionId);
        handleReset();
      } else if (isAddingNew) {
        handleReset();
      }
    }
  };

  const selectableFunctions = useMemo(
    () => getSelectableFunctions(availableFunctions, existingFunctions, editingFunctionId),
    [availableFunctions, existingFunctions, editingFunctionId]
  );

  // --- Shared props for FunctionInputTag ---
  const inputTagProps = {
    isEditing: true,
    searchValue,
    onSearchValueChange: handleSearchChange,
    selectedFunction,
    availableFunctions: selectableFunctions,
    isLoading,
    onSelectOption: handleSelectOption,
    onKeyDown: handleInputKeyDown,
    onSubmit: handleSubmit,
    onClearSelection: handleClearSelection,
  };

  return (
    <div className="flex items-start min-h-full p-2 gap-1 flex-wrap">
      {existingFunctions.map((fn, index) =>
        editingFunctionId === fn.functionId ? (
          <FunctionInputTag key={fn.functionId} existingFunction={fn} {...inputTagProps} />
        ) : (
          <FunctionDisplay
            key={fn.functionId}
            existingFunction={fn}
            availableFunctions={availableFunctions}
            isLast={index === existingFunctions.length - 1}
            onStartEdit={() => handleEditFunction(fn.functionId)}
          />
        )
      )}

      {isAddingNew && !editingFunctionId && <FunctionInputTag {...inputTagProps} />}

      {!isAddingNew && <AddFunctionButton onClick={handleStartAdd} />}
    </div>
  );
};

export default EvaluationFunctionsCell;
