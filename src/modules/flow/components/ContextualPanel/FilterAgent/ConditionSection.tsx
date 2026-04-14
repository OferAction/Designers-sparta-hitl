import { useMemo } from "react";

import { useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { SerializedEditorState } from "lexical";

import useAncestorValueOptions from "@/modules/flow/hooks/useAncestorValueOptions";
import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import { SectionContainer } from "../SectionContainer";
import { SectionTitle } from "../SectionTitle";
import { editorStateToConditionValues, useValidateCondition } from "@/components/common/input-tags/ConditionField";
import { ConditionInput } from "@/components/common/input-tags/ConditionInput";
import WithTooltip from "@/components/common/WithTooltip";
import { Node, NodeVariant } from "@/modules/flow/types";
import { ConditionValues, FilterAgentData } from "@/modules/flow/types/BaseNodeTypes";
import { useFlowStore } from "@/store";

export default function ConditionSection() {
  const selectedNode = useSelectedNode<NodeVariant<"agent", "filterAgent">>();
  const onChange = useFlowStore((state) => state.onChange);
  const ancestorOptions = useAncestorValueOptions(selectedNode?.id);
  const { getNode } = useReactFlow<Node>();
  const validateCondition = useValidateCondition();

  // Compute validation errors declaratively based on expression
  // This automatically updates whenever expression changes, eliminating the need for useEffect
  const validationErrors = useMemo(() => {
    if (!selectedNode?.data.inputs?.expression) {
      return null;
    }

    const expression = selectedNode.data.inputs.expression;
    // validateCondition accepts string | SerializedEditorState and handles parsing internally
    const validation = validateCondition(expression, getNode);
    return {
      errors: validation.errors,
    };
  }, [selectedNode?.data.inputs?.expression, validateCondition, getNode]);

  const handleConditionChange = (val: string | SerializedEditorState) => {
    if (!selectedNode) return;

    const conditions = editorStateToConditionValues(val);
    if (!conditions) return;

    const serializedExpression = typeof val === "string" ? val : JSON.stringify(val);

    const newInputs = produce(selectedNode.data.inputs as FilterAgentData["inputs"], (draft) => {
      draft.conditions = conditions as ConditionValues[];
      draft.expression = serializedExpression;
    });

    onChange(selectedNode.id, "inputs", newInputs);
    // Validation errors will be automatically recomputed via useMemo when expression updates
  };

  return (
    <SectionContainer>
      <SectionTitle title="Condition Details" />
      <WithTooltip
        disableTooltip={!validationErrors?.errors?.length}
        tooltip={validationErrors?.errors.map((error) => error.message).join(", ")}
        contentClassName="max-w-xs"
      >
        <div className="flex flex-col gap-y-2">
          <ConditionInput
            value={selectedNode?.data.inputs?.expression}
            onChange={handleConditionChange}
            options={ancestorOptions}
            placeholder="Start with a function, Use '$' for them"
            hasFunctions={true}
            className={validationErrors && validationErrors.errors.length > 0 ? "border-b border-destructive/40" : ""}
            validationErrors={validationErrors?.errors}
          />
        </div>
      </WithTooltip>
    </SectionContainer>
  );
}
