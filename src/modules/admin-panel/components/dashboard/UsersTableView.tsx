import { useMemo, useState } from "react";

import { UserDataRow } from "@/types/user";

import { AdminDataTable } from "./AdminDataTable";
import { createUserColumns, userGlobalFilterFn } from "./columns";
import UsersDetailsSheet from "./UsersDetailsSheet";
import { type DashboardTableViewProps } from "../../types/dashboard";
import { useGetUsersDashboardQuery } from "@/services/securityService";

/** Self-contained users table — owns data fetching, columns, and search filtering */
export const UsersTableView = ({ onFilterChange, showFilter, showTitle }: DashboardTableViewProps) => {
  const { data: users = [], isLoading } = useGetUsersDashboardQuery();
  const [selectedRow, setSelectedRow] = useState<UserDataRow>();

  const columns = useMemo(() => createUserColumns(setSelectedRow), []);

  return (
    <>
      <AdminDataTable
        showFilter={showFilter}
        showTitle={showTitle}
        data={users}
        columns={columns}
        isLoading={isLoading}
        globalFilterFn={userGlobalFilterFn}
        selectedFilter="Users"
        onFilterChange={onFilterChange}
        searchPlaceholder="Search users..."
        loadingMessage="Loading users..."
        noResultMessage="No members found."
        className="overflow-hidden"
        onRowClick={setSelectedRow}
      />

      <UsersDetailsSheet
        isOpen={!!selectedRow}
        onOpenChange={() => setSelectedRow(undefined)}
        selectedRow={selectedRow}
        title={selectedRow?.name}
        subtitle={selectedRow?.email}
      />
    </>
  );
};
