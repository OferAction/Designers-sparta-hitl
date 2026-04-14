import { useMemo, useState } from "react";

import { WorkflowDataRow } from "@/types/user";

import { AdminDataTable } from "./AdminDataTable";
import { createWorkflowColumns, workflowGlobalFilterFn } from "./columns";
import WorkflowsDetailsSheet from "./WorkflowsDetailsSheet";
import { type DashboardTableViewProps } from "../../types/dashboard";
import { useGetWorkflowsDashboardQuery } from "@/services/securityService";

export const WorkflowsTableView = ({ onFilterChange, showFilter, showTitle }: DashboardTableViewProps) => {
  const { data: workflows = [], isLoading } = useGetWorkflowsDashboardQuery();
  const [selectedRow, setSelectedRow] = useState<WorkflowDataRow>();

  const columns = useMemo(() => createWorkflowColumns(setSelectedRow), []);

  return (
    <>
      <AdminDataTable
        showFilter={showFilter}
        showTitle={showTitle}
        data={workflows}
        columns={columns}
        isLoading={isLoading}
        globalFilterFn={workflowGlobalFilterFn}
        selectedFilter="Workflows"
        onFilterChange={onFilterChange}
        searchPlaceholder="Search workflows..."
        loadingMessage="Loading workflows..."
        noResultMessage="No workflows found."
        className="overflow-hidden"
        onRowClick={setSelectedRow}
      />
      <WorkflowsDetailsSheet isOpen={!!selectedRow} onOpenChange={() => setSelectedRow(undefined)} selectedRow={selectedRow} />
    </>
  );
};
