import type React from "react";

import type { NodeOutput } from "@/modules/flow/types";

export interface NodeOutputWithIcon extends NodeOutput {
  icon?: React.ElementType | null;
}

export type RowItemData = NodeItemData | NodeOutputRowData;

export interface NodeItemData {
  id: string;
  name: string;
  title: string;
  icon: React.ElementType;
  outputs: RowItemData[];
  rowType: "node";
}

export interface NodeOutputRowData extends NodeOutputWithIcon {
  outputs: NodeOutputRowData[];
  rowType: "output";
  matchedLabel?: string;
}

export interface ColumnMeta {
  widthPx: number;
  minWidthPx: number;
  maxWidthPx: number;
  cellComponent?: React.ElementType;
}

// For future column value accessors where a specific cell value type is needed.
export type MappingRow = NodeItemData;

export const isOutputRow = (data: RowItemData): data is NodeOutputRowData => data.rowType === "output";
