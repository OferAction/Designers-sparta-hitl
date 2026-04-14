import { OutlookInputType } from "@/modules/flow/types";
import { genId } from "@/utils";

export type FlowInputType = "String" | "Number" | "Integer" | "Boolean" | "List of Strings";

// Extract the possible key values from OutlookInputType union
type OutlookInputKey = OutlookInputType["key"];

/**
 * Returns a stable upsert function that updates or adds a node input while preserving existing labels.
 * - If key exists: updates type and value, preserves value.label
 * - If missing: adds a new item with empty label
 */
export function useUpsertInput() {
  return function upsert(arr: OutlookInputType[], key: OutlookInputKey, type: FlowInputType, rawValue: any): OutlookInputType[] {
    let found = false;
    const next = arr.map((it) => {
      if (it?.key === key) {
        found = true;
        const existingLabel = (it as any)?.value?.label;
        return { ...it, type, value: { label: existingLabel, value: rawValue } } as OutlookInputType;
      }
      return it;
    });
    if (!found) {
      const newItem = {
        id: `${key}_${genId()}`,
        key,
        type,
        value: { label: "", value: rawValue },
      } as OutlookInputType;
      next.push(newItem);
    }
    return next;
  };
}
