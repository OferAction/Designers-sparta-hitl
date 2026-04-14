import { ExpandedState } from "@tanstack/react-table";

import { isOutputRow, RowItemData } from "@/modules/dataset/components/mapping-grid/mappingtable/types";

// Compute which rows should be auto-expanded based on data structure
export const computeAutoExpandedRows = (rows: RowItemData[]): ExpandedState => {
  const autoExpanded: ExpandedState = {};

  const stack = [...rows];
  while (stack.length > 0) {
    const row = stack.pop();
    if (!row) continue;
    const rowId = row.id;

    // If it's an output row and has sub-rows, auto-expand it
    if (isOutputRow(row) && row.outputs && row.outputs.length > 0) {
      autoExpanded[rowId] = true;
      // Add sub-rows to stack to check for nested expansions
      stack.push(...row.outputs);
    } else if (row.outputs && row.outputs.length > 0) {
      // For node rows, add their outputs to stack to find expandable output rows
      stack.push(...row.outputs);
    }
  }

  return autoExpanded;
};
