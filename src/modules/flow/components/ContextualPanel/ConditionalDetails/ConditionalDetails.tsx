import { useCallback, useMemo } from "react";

import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { useReactFlow } from "@xyflow/react";
import { produce } from "immer";
import { SerializedEditorState } from "lexical";

import { useAncestorValueOptions } from "@/modules/flow/hooks/useAncestorValueOptions";

import ConditionSection from "./ConditionSection";
import TargetNodesDisplay from "./TargetNodesDisplay";
import useConditionHandlers from "./useConditionHandlers";
import { InputTagRow } from "@/components/common/input-tags";
import { editorStateToConditionValues, useValidateCondition } from "@/components/common/input-tags/ConditionField";
import { ConditionInput } from "@/components/common/input-tags/ConditionInput";
import WithTooltip from "@/components/common/WithTooltip";
import { Button } from "@/components/ui/button";
import { NonNullableOption as Option } from "@/components/ui/input-tag";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { useSelectedNode } from "@/modules/flow/hooks";
import { ConditionType, ConditionValues, Node, NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const transformToConditions = (conditionParts: Option[], conditionObj: ConditionType): ConditionType => {
  const values: ConditionValues[] = conditionParts.map((part) => {
    return {
      id: part.id,
      value: part.value,
      type: part.type,
      label: part.label,
      isReference: part.isReference,
    };
  });
  return {
    id: conditionObj.id,
    type: conditionObj.type as "if" | "elif" | "else",
    values,
    then: conditionObj.then,
  };
};

export const ConditionalDetails = () => {
  const { handleAddElif, handleRemoveElif: handleRemoveCondition } = useConditionHandlers();

  const selectedNode = useSelectedNode() as NodeVariant<"ifelse">;
  const conditions = selectedNode?.data.conditions;
  const selectedNodeId = selectedNode?.id || "";

  const options = useAncestorValueOptions(selectedNodeId);
  const onChange = useFlowStore((state) => state.onChange);
  const { getNode } = useReactFlow<Node>();
  const validateCondition = useValidateCondition();

  const validationErrors = useMemo(() => {
    if (!conditions) return {};

    const errors: Record<string, { errors: Array<{ message: string; index?: number }> }> = {};

    conditions.forEach((condition) => {
      if (condition.expression) {
        try {
          const editorState: SerializedEditorState = JSON.parse(condition.expression);
          const validation = validateCondition(editorState, getNode);
          errors[condition.id] = {
            errors: validation.errors,
          };
        } catch {
          console.error("Error parsing condition expression", condition.expression);
        }
      }
    });

    return errors;
  }, [conditions, validateCondition, getNode]);

  const handleChangeCondition = useCallback(
    (editorState: SerializedEditorState, condition: ConditionType) => {
      const values = editorStateToConditionValues(editorState);

      const newConditions = produce(conditions, (draft) => {
        const index = draft.findIndex((c) => c.id === condition.id);
        if (index !== -1) {
          draft[index] = {
            ...draft[index],
            values,
            // Store raw editor state for restoring the condition editor
            expression: JSON.stringify(editorState),
          };
        }
      });
      onChange(selectedNodeId, "conditions", newConditions);
    },
    [conditions, onChange, selectedNodeId]
  );

  const handleChangeConditionOld = useCallback(
    (tagsMap: Option[], condition: ConditionType) => {
      const ifConditionInput = transformToConditions(tagsMap, condition);
      const newConditions = produce(conditions, (draft) => {
        const index = draft.findIndex((c) => c.id === ifConditionInput.id);
        if (index !== -1) {
          draft[index] = ifConditionInput;
        }
      });
      onChange(selectedNodeId, "conditions", newConditions);
    },
    [conditions, onChange, selectedNodeId]
  );

  return (
    <SectionContainer>
      <div className="flex items-center justify-between">
        <SectionTitle title="Condition details" />
        <div className="flex items-center gap-x-2">
          <Button variant="ghost" size="icon" className="h-4 w-4 rounded-md  hover:bg-muted/50 ml-auto" onClick={handleAddElif}>
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-y-2 ">
        {/* ELIF conditions */}
        {conditions.slice(0, -1).map((condition) => (
          <ConditionSection key={condition.id}>
            <WithTooltip
              disableTooltip={!validationErrors[condition.id]?.errors.length}
              tooltip={validationErrors[condition.id]?.errors.map((error) => error.message).join(", ")}
              contentClassName="max-w-xs"
            >
              <div className="flex gap-x-1 hover:bg-secondary mb-1 hover:ring-2 hover:ring-secondary">
                <span className="text-sm font-medium tracking-wide w-6 pr-1 pt-2.5">{condition.type === "if" ? "If" : "Elif"}</span>
                <div className="flex flex-col w-full gap-y-2 ">
                  {condition.values.length && !condition.expression ? (
                    <InputTagRow
                      options={options}
                      onDataChange={(data) => handleChangeConditionOld(data, condition)}
                      initialDataRow={condition.values as Option[]}
                    />
                  ) : (
                    <>
                      <ConditionInput
                        value={condition.expression}
                        options={options}
                        onChange={(editorState) => handleChangeCondition(editorState as SerializedEditorState, condition)}
                        placeholder="Use '@' for variables, '#' for operators, '$' for functions"
                        className={validationErrors[condition.id]?.errors.length ? "border-b border-destructive/40" : ""}
                        validationErrors={validationErrors[condition.id]?.errors}
                        hasFunctions={true}
                      />
                    </>
                  )}
                </div>
                {condition.type !== "if" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md bg-secondary hover:bg-slate-800/50 ml-auto"
                    onClick={() => handleRemoveCondition(condition.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </WithTooltip>
            <TargetNodesDisplay targetNodes={condition.then} className="ml-4 mb-2 mt-2" />
          </ConditionSection>
        ))}

        {/* ELSE condition */}
        {conditions[conditions.length - 1] && (
          <ConditionSection showDivider={false}>
            <div className="flex items-center " key={conditions[conditions.length - 1].id}>
              <span className="text-sm font-medium tracking-wide ">Else</span>
              <TargetNodesDisplay targetNodes={conditions[conditions.length - 1].then} showArrow={false} className=" ml-3" />
            </div>
          </ConditionSection>
        )}
      </div>
    </SectionContainer>
  );
};

export default ConditionalDetails;
