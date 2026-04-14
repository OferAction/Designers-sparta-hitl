import { AccessRequestsTable } from "../modules/admin-panel/components/accessRequestsTable";
import { SettingsTabLayout } from "@/layouts";

export const AdminRequests = () => {
  return (
    <SettingsTabLayout title="Seat requests">
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="flex flex-col gap-6 py-6 px-6">
          <AccessRequestsTable
            title="Pending seat requests"
            showFilters
            className="w-full"
            tableContainerClassName="max-h-full"
            headerRowClassName="border-sidebar-border hover:bg-transparent"
            headerCellClassName="px-4 py-3 text-muted-foreground font-medium"
            bodyRowClassName="border-sidebar-border"
            bodyCellClassName="px-4 py-4"
          />
        </div>
      </div>
    </SettingsTabLayout>
  );
};

export default AdminRequests;
