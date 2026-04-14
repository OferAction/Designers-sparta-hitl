import { useState, useCallback, useMemo } from "react";

import { useToast } from "@/hooks/use-toast";

import { ProjectDataRow, UserPerProject } from "@/types/user";

import AdminPageTable from "./AdminPageTable";
import { ProjectUserColumns, projectUserGlobalFilterFn } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGetEntityUsers, useUpdateUserInProjectsPermissionsBatch } from "@/services/securityService";

export const ProjectsSheetTable = ({ selectedRow, onOpenChange }: { selectedRow: ProjectDataRow; onOpenChange: (open: boolean) => void }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [toggledIds, setToggledIds] = useState<Set<string>>(new Set());
  const { data: users = [], isLoading } = useGetEntityUsers(selectedRow?.projectId);
  const { mutate } = useUpdateUserInProjectsPermissionsBatch();
  const { toast } = useToast();

  /** Toggles the active state of a user by tracking its id in a set */
  const toggleItem = useCallback((user: UserPerProject) => {
    setToggledIds((prev) => {
      const next = new Set(prev);
      if (next.has(user.id)) next.delete(user.id);
      else next.add(user.id);
      return next;
    });
  }, []);

  const columns = useMemo(() => ProjectUserColumns(toggleItem, toggledIds), [toggleItem, toggledIds]);

  const changeAccess = useCallback(() => {
    const updates = users
      .filter((u) => toggledIds.has(u.id))
      .map((u) => ({
        id: u.id,
        isDeleted: u.isActive,
      }));
    if (updates.length === 0) {
      onOpenChange(false);
      return;
    }
    mutate(updates, {
      onSuccess: () => {
        toast({
          description: "User permissions have been updated.",
          variant: "default",
        });
        onOpenChange(false);
      },
    });
  }, [users, toggledIds, mutate, toast, onOpenChange]);

  return (
    <div className="size-full flex flex-col gap-2 px-1">
      <Input
        placeholder="Search users..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="bg-background border-input"
      />

      <div className="h-full py-3">
        <AdminPageTable
          wrapperClassName="overflow-x-hidden"
          tableHeaderClassName="bg-sidebar sticky top-0 z-10"
          tableRowHeaderClassName="border-sidebar-border hover:bg-transparent"
          tableRowClassName="border-sidebar-border"
          tableCellClassName="py-2"
          columns={columns}
          data={users}
          isLoading={isLoading}
          LoadingMessage={"Loading users..."}
          NoResultMessage={"No users found."}
          globalFilter={searchQuery}
          globalFilterFn={projectUserGlobalFilterFn}
        />
      </div>

      <div className="flex items-center justify-end gap-4">
        <Button variant="secondary" className="text-primary text-xs font-inter font-normal" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="default" className="text-primary-foreground text-xs font-inter font-normal" onClick={changeAccess}>
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ProjectsSheetTable;
