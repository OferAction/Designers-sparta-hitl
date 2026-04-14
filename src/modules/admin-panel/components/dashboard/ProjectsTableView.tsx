import { useMemo, useState } from "react";

import { ProjectDataRow } from "@/types/user";

import { AdminDataTable } from "./AdminDataTable";
import { createProjectColumns, projectGlobalFilterFn } from "./columns";
import ProjectUsersSheet from "./ProjectUsersSheet";
import { type DashboardTableViewProps } from "../../types/dashboard";
import { useGetProjectsDashboardQuery } from "@/services/securityService";

export const ProjectsTableView = ({ onFilterChange, showFilter, showTitle }: DashboardTableViewProps) => {
  const { data: projects = [], isLoading } = useGetProjectsDashboardQuery();
  const [selectedRow, setSelectedRow] = useState<ProjectDataRow>();

  const columns = useMemo(() => createProjectColumns(setSelectedRow), []);

  return (
    <>
      <AdminDataTable
        showFilter={showFilter}
        showTitle={showTitle}
        data={projects}
        columns={columns}
        isLoading={isLoading}
        globalFilterFn={projectGlobalFilterFn}
        selectedFilter="Projects"
        onFilterChange={onFilterChange}
        searchPlaceholder="Search projects..."
        loadingMessage="Loading projects..."
        noResultMessage="No projects found."
        className="overflow-hidden"
        onRowClick={setSelectedRow}
      />
      <ProjectUsersSheet isOpen={!!selectedRow} onOpenChange={() => setSelectedRow(undefined)} selectedRow={selectedRow} />
    </>
  );
};
