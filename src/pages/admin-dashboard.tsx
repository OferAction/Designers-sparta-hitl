import { useCallback, useState } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import { FilterType } from "@/types/user";

import { ProjectsTableView } from "../modules/admin-panel/components/dashboard/ProjectsTableView";
import { Button } from "@/components/ui/button";
import { SettingsTabLayout } from "@/layouts";
import { AccessRequestsTable } from "@/modules/admin-panel/components/accessRequestsTable";
import { UsersTableView } from "@/modules/admin-panel/components/dashboard/UsersTableView";
import { WorkflowsTableView } from "@/modules/admin-panel/components/dashboard/WorkflowsTableView";

export const DashboardTab = () => {
  const [currentFilter, setCurrentFilter] = useState<FilterType>("Users");

  /** Handles filter dropdown change */
  const handleFilterChange = useCallback((filter: FilterType) => {
    setCurrentFilter(filter);
  }, []);

  /** Renders the typed table view for the active filter */
  const renderTable = () => {
    switch (currentFilter) {
      case "Users":
        return <UsersTableView showTitle showFilter onFilterChange={handleFilterChange} />;
      case "Workflows":
        return <WorkflowsTableView showTitle showFilter onFilterChange={handleFilterChange} />;
      case "Projects":
        return <ProjectsTableView showTitle showFilter onFilterChange={handleFilterChange} />;
      default:
        return null;
    }
  };

  // TODO: Implement invite modal
  const handleInvite = useCallback(() => {}, []);

  return (
    <SettingsTabLayout
      title="ActionAI Dashboard"
      buttonConfig={
        <Button variant="purple" onClick={handleInvite}>
          <div className="flex items-center gap-1">
            <PlusIcon size={16} className="text-purple-accent-foreground" />
            <span className="text-purple-accent-foreground">Invite Users</span>
          </div>
        </Button>
      }
    >
      <div className="h-full flex flex-col gap-6 p-6 pt-0 overflow-hidden">
        <AccessRequestsTable
          hiddenColumns={["workflow"]}
          title="Pending seat requests"
          className="w-full max-h-[40vh] flex flex-col gap-3 bg-sidebar border border-sidebar-border rounded-lg px-6 "
          tableCardClassName="flex-1 min-h-0 border-0 rounded-none px-0"
          tableContainerClassName="h-full overflow-auto"
          headerSectionClassName="py-4 border-b border-sidebar-border"
          headerRowClassName="bg-sidebar sticky top-0 z-10"
          bodyRowClassName="py-2 h-14"
          bodyCellClassName="py-0 px-4"
        />

        <div className="flex overflow-hidden flex-col gap-2 h-full">{renderTable()}</div>
      </div>
    </SettingsTabLayout>
  );
};

export default DashboardTab;
