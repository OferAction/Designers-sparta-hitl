import { useState, useMemo, useCallback } from "react";

import { PlusIcon, SlidersHorizontalIcon, TrashIcon, CircleIcon } from "@phosphor-icons/react";

import { RegexHandlingDialog } from "./RegexHandlingDialog";
import { defaultRegexAdvancedSettings } from "./types";
import { InputItem } from "../../../IO";
import { DragHandle as RuleDragHandle } from "../../shared/DragHandle";
import WithTooltip from "@/components/common/WithTooltip";
import { NonNullableOption } from "@/components/ui/input-tag";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle, SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { TreeInputItem } from "@/modules/flow/hooks";
import { RegexClass } from "@/modules/flow/types";
import { genId } from "@/utils";

import { computeInsertAt, finalizeOrder, indexOfById, reorderWithInsert } from "@/modules/flow/components/ContextualPanel/shared/utils/drag";

interface RegexClassInputsProps {
  selectedNodeId: string;
  inputs: RegexClass[];
  onUpdate: (keys: RegexClass[], inputId?: string) => void;
  title?: string;
  placeholder?: string;
  tooltip?: string;
  errorTooltip?: string;
}

export const RegexClassInputs = ({
  selectedNodeId,
  inputs,
  onUpdate,
  title = "Key Definition",
  placeholder = "Add class name",
  tooltip,
  errorTooltip,
}: RegexClassInputsProps) => {
  const [autoFocusId, setAutoFocusId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [configOpen, setConfigOpen] = useState<boolean>(false);
  const [configTargetId, setConfigTargetId] = useState<string | null>(null);

  const displayInputs = useMemo(() => {
    if (inputs.length === 0 && selectedNodeId) {
      const newId = genId();
      const newItem: RegexClass = {
        id: newId,
        key: "",
        order: 0,
        regex_patterns: [],
        unwanted_regex_patterns: [],
        context_range: defaultRegexAdvancedSettings.context_range,
        relevant_match: defaultRegexAdvancedSettings.relevant_match,
        flags: defaultRegexAdvancedSettings.flags,
      };
      setAutoFocusId(newId);
      return [newItem];
    }
    return inputs.map((cls) => ({
      ...cls,
      context_range: cls.context_range ?? defaultRegexAdvancedSettings.context_range,
      relevant_match: cls.relevant_match && cls.relevant_match !== "" ? cls.relevant_match : defaultRegexAdvancedSettings.relevant_match,
      flags: cls.flags && cls.flags !== "" ? cls.flags : defaultRegexAdvancedSettings.flags,
    }));
  }, [inputs, selectedNodeId]);

  const ordered = useMemo(() => displayInputs.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [displayInputs]);

  const indexOf = useCallback((id: string) => indexOfById(ordered, id), [ordered]);

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDragId(id);
  };

  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragId) return;
    const overIdx = indexOf(id);
    const fromIdx = indexOf(dragId);
    const nextInsert = computeInsertAt(e, overIdx, fromIdx);
    setInsertAt(nextInsert);
  };

  const endDrag = () => {
    setDragId(null);
    setInsertAt(null);
  };

  const finalize = (nextList: RegexClass[]) => {
    onUpdate(finalizeOrder(nextList));
  };

  const handleRegexClassUpdate = (next: RegexClass) => {
    const updated = ordered.map((cls) => (cls.id === next.id ? next : cls));
    finalize(updated);
  };

  const handleDrop = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragId) return;
    const from = indexOf(dragId);
    const to = insertAt !== null ? insertAt : indexOf(id);
    if (from === -1 || to === -1 || from === to) {
      setDragId(null);
      setInsertAt(null);
      return;
    }
    const next = reorderWithInsert(ordered, from, to);
    finalize(next);
    setDragId(null);
    setInsertAt(null);
  };

  const roots: TreeInputItem[] = ordered.map((inp: RegexClass) => ({
    id: inp.id,
    key: inp.key,
    type: "String",
    value: { label: inp.key, value: inp.key },
    children: [],
  }));

  const handlers = {
    onKeyChange: (id: string, next: string) => {
      const nextKeys = ordered.map((i: RegexClass) => (i.id === id ? { ...i, key: next } : i));
      finalize(nextKeys);
    },

    onValueChange: (id: string, next: NonNullableOption) => {
      const nextKeys = ordered.map((i: RegexClass) => (i.id === id ? { ...i, key: next.label || next.value || "" } : i));
      finalize(nextKeys);
    },

    onRemove: (id: string) => {
      const nextKeys = ordered.filter((i: RegexClass) => i.id !== id);
      // Ensure at least one item remains
      if (nextKeys.length === 0) {
        const newId = genId();
        const newItem: RegexClass = {
          id: newId,
          key: "",
          order: 0,
          regex_patterns: [],
          unwanted_regex_patterns: [],
          context_range: defaultRegexAdvancedSettings.context_range,
          relevant_match: defaultRegexAdvancedSettings.relevant_match,
          flags: defaultRegexAdvancedSettings.flags,
        };
        setAutoFocusId(newId);
        onUpdate([newItem], id);
      } else {
        onUpdate(finalizeOrder(nextKeys), id);
      }
    },
    onAddBelow: undefined,
    onAddChild: undefined,
    onOptionalToggle: undefined,
    onTypeChange: undefined,
    onDescriptionChange: undefined,
    handleAddInput: (opt: NonNullableOption) => {
      const newId = genId();
      const newItem: RegexClass = {
        id: newId,
        key: opt.label || "",
        order: ordered.length,
        regex_patterns: [],
        unwanted_regex_patterns: [],
        context_range: defaultRegexAdvancedSettings.context_range,
        relevant_match: defaultRegexAdvancedSettings.relevant_match,
        flags: defaultRegexAdvancedSettings.flags,
      };
      const nextKeys = [...ordered, newItem];
      finalize(nextKeys);
      setAutoFocusId(newId);
    },
  };

  return (
    <SectionContainer>
      <SectionTitle title={title} tooltip={tooltip}>
        <SectionTitleButton tooltip="Add key" onClick={() => handlers.handleAddInput?.({ label: "", value: "" } as NonNullableOption)}>
          <PlusIcon className="size-4" />
        </SectionTitleButton>
      </SectionTitle>

      <div className="flex flex-col gap-1 py-1">
        {roots.map((node) => {
          const idx = ordered.findIndex((r) => r.id === node.id);
          const showTopSeparator = insertAt === idx && dragId !== null && dragId !== node.id;
          const currentClass = idx >= 0 ? ordered[idx] : undefined;
          const hasPatternError = !!currentClass && Array.isArray(currentClass.regex_patterns) && currentClass.regex_patterns.length === 0;

          return (
            <div key={node.id} onDragOver={handleDragOver(node.id)} onDrop={handleDrop(node.id)} className="relative group/item -mx-2 px-2">
              {showTopSeparator && (
                <div className="h-2 -mt-1 mb-1 -mx-2 px-2">
                  <div className="h-px w-full bg-foreground" />
                </div>
              )}
              <div className="relative" onDragEnd={endDrag}>
                {hasPatternError && (
                  <WithTooltip tooltip={errorTooltip || "Pattern required"}>
                    <button
                      type="button"
                      onClick={() => {
                        setConfigTargetId(node.id);
                        setConfigOpen(true);
                      }}
                      className="absolute -left-3 top-1/2 -translate-y-1/2 w-10 h-10"
                    >
                      <CircleIcon weight="fill" className="size-1.5 text-warning" />
                    </button>
                  </WithTooltip>
                )}
                <RuleDragHandle
                  hiddenUntilHover
                  draggable
                  onDragStart={handleDragStart(node.id)}
                  className="absolute -left-2 top-1/2 -translate-y-1/2 z-10"
                />
                <InputItem
                  item={node}
                  onValueChange={handlers.onValueChange}
                  onRemove={handlers.onRemove}
                  hidden={{ key: true, description: true, optional: true, type: true }}
                  placeholder={placeholder}
                  className="border border-muted/40 rounded-sm ml-2"
                  autoFocus={node.id === autoFocusId}
                  onAutoFocusComplete={() => setAutoFocusId(null)}
                  actionsOverride={[
                    {
                      id: "configure",
                      icon: <SlidersHorizontalIcon className="w-4 h-4" />,
                      onClick: () => {
                        setConfigTargetId(node.id);
                        setConfigOpen(true);
                      },
                      label: "Configure",
                    },
                    {
                      id: "delete",
                      icon: <TrashIcon className="w-4 h-4" />,
                      onClick: () => handlers.onRemove?.(node.id),
                      label: "Delete",
                      destructive: true,
                    },
                  ]}
                />
              </div>
              {insertAt === ordered.length && idx === ordered.length - 1 && dragId && (
                <div className="h-2 mt-1">
                  <div className="h-px w-full bg-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <RegexHandlingDialog
        open={configOpen}
        onOpenChange={(value) => {
          setConfigOpen(value);
          if (!value) {
            setConfigTargetId(null);
          }
        }}
        regexClass={configTargetId ? (ordered.find((cls) => cls.id === configTargetId) ?? null) : null}
        onUpdate={handleRegexClassUpdate}
      />
    </SectionContainer>
  );
};

export default RegexClassInputs;
