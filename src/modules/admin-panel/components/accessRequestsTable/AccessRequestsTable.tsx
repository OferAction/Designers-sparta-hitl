import { useCallback, useMemo } from "react";

import { type ColumnDef } from "@tanstack/react-table";

import { createAccessRequestColumns, type AccessRequestsTableMeta } from "./columns";
import { RequestsDataTable } from "./RequestsDataTable";
import { RequestsFilterBar } from "./RequestsFilterBar";
import { RequestsTableHeader } from "./RequestsTableHeader";
import { useAccessRequestsTable } from "./useAccessRequestsTable";
import { Loader } from "@/components/common/Loader";
import { useApproveAllAccessRequests, useGetAccessRequestsQuery, useUpdateAccessRequest } from "@/services/securityService";
import { useAuthStore } from "@/store/authStore";
import { ACCESS_REQUEST_STATUS } from "@/types/accessRequest";
import { cn } from "@/utils";

import type { AccessRequest, AccessRequestsColumnKey } from "./types";

export type { AccessRequest, AccessRequestsColumnKey };
export { ACCESS_REQUEST_STATUS as AccessRequestStatus, ENTITY_TYPE as EntityType } from "@/types/accessRequest";
export type { RequestTypeFilter } from "./RequestsFilterBar";
export type SortOrder = "newest" | "oldest";

const EMPTY_ARRAY: AccessRequest[] = [];

export interface AccessRequestsTableProps {
  hiddenColumns?: AccessRequestsColumnKey[];
  title?: string;
  approveButtonTooltip?: string;
  showFilters?: boolean;
  className?: string;
  tableContainerClassName?: string;
  tableClassName?: string;
  headerRowClassName?: string;
  headerCellClassName?: string;
  bodyRowClassName?: string;
  bodyCellClassName?: string;
  headerSectionClassName?: string;
  tableCardClassName?: string;
  searchInputClassName?: string;
}

export function AccessRequestsTable({
  hiddenColumns = [],
  title = "Pending seat requests",
  approveButtonTooltip,
  showFilters = false,
  className,
  tableContainerClassName,
  tableClassName,
  headerRowClassName,
  headerCellClassName,
  bodyRowClassName,
  bodyCellClassName,
  headerSectionClassName,
  tableCardClassName,
  searchInputClassName,
}: AccessRequestsTableProps) {
  const { data: allRequests = EMPTY_ARRAY, isLoading } = useGetAccessRequestsQuery();
  const { mutate: updateAccessRequest, isPending: isActionPending, variables } = useUpdateAccessRequest();
  const { approveAll, isPending: isApproveAllPending } = useApproveAllAccessRequests();

  const user = useAuthStore((s) => s.user);

  const pendingRequestIds = useMemo(() => {
    if (!isActionPending || !variables?.accessRequestIds) return [];
    if (variables.accessRequestIds.length > 1) return [];
    return variables.accessRequestIds;
  }, [isActionPending, variables?.accessRequestIds]);
  const pendingStatus = isActionPending && variables ? variables.status : null;

  const handleApprove = useCallback(
    (id: string) => {
      if (!user?.id) return;
      updateAccessRequest({
        accessRequestIds: [id],
        adminId: user.id,
        status: ACCESS_REQUEST_STATUS.Approved,
      });
    },
    [user?.id, updateAccessRequest]
  );

  const handleDecline = useCallback(
    (id: string) => {
      if (!user?.id) return;
      updateAccessRequest({
        accessRequestIds: [id],
        adminId: user.id,
        status: ACCESS_REQUEST_STATUS.Declined,
      });
    },
    [user?.id, updateAccessRequest]
  );

  const columnMeta: AccessRequestsTableMeta = useMemo(
    () => ({
      onApprove: handleApprove,
      onDecline: handleDecline,
      approveButtonTooltip,
      pendingRequestIds,
      pendingStatus,
    }),
    [handleApprove, handleDecline, approveButtonTooltip, pendingRequestIds, pendingStatus]
  );

  const columns = useMemo(() => createAccessRequestColumns(columnMeta) as ColumnDef<AccessRequest, unknown>[], [columnMeta]);

  const table = useAccessRequestsTable(allRequests, columns, {
    hiddenColumns,
    initialSorting: [{ id: "requested", desc: true }],
  });

  const rows = table.getRowModel().rows;
  const filteredRowCount = rows.length;

  const handleApproveAll = useCallback(() => {
    if (!user?.id || rows.length === 0) return;
    approveAll(rows.map((row) => row.original.id), user.id);
  }, [user?.id, approveAll, rows]);

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center py-12 text-muted-foreground text-sm", className)}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {showFilters && <RequestsFilterBar table={table} searchInputClassName={searchInputClassName} />}

      <div className={cn("flex flex-col", tableCardClassName ?? "border border-sidebar-border rounded-lg px-6", showFilters ? "max-h-[80vh]" : "")}>
        <RequestsTableHeader
          title={title}
          filteredRowCount={filteredRowCount}
          isApproveAllPending={isApproveAllPending}
          onApproveAll={handleApproveAll}
          className={headerSectionClassName}
        />

        <RequestsDataTable
          table={table}
          isApproveAllPending={isApproveAllPending}
          showFilters={showFilters}
          tableContainerClassName={tableContainerClassName}
          tableClassName={tableClassName}
          headerRowClassName={headerRowClassName}
          headerCellClassName={headerCellClassName}
          bodyRowClassName={bodyRowClassName}
          bodyCellClassName={bodyCellClassName}
        />
      </div>
    </div>
  );
}

export default AccessRequestsTable;
