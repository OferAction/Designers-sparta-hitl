import { FilterType, UserDataRow, WorkflowDataRow } from "@/types/user";

export type DashboardDataRow = UserDataRow | WorkflowDataRow;

/** Shared props each dashboard table view receives from the parent */
export interface DashboardTableViewProps {
  showFilter?: boolean;
  showTitle?: boolean;
  onFilterChange?: (filter: FilterType) => void;
  onRowSelect?: (row: DashboardDataRow) => void;
}
