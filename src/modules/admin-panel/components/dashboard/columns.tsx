import { CaretRightIcon } from "@phosphor-icons/react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";
import moment from "moment";

import { ProjectDataRow, UserDataRow, UserPerProject, WorkflowDataRow } from "@/types/user";

import { SortDescIcon as ArrowUp, SortAscIcon as ArrowDown } from "@/lib/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/utils";

/** Global filter function for user rows — searches by name and email */
export const userGlobalFilterFn: FilterFn<UserDataRow> = (row, _columnId, filterValue) => {
  if (!filterValue || typeof filterValue !== "string") return true;
  const query = filterValue.toLowerCase();
  const { name, email } = row.original;
  return name?.toLowerCase().includes(query) || email?.toLowerCase().includes(query);
};

/** Global filter function for workflow rows — searches by name and project name */
export const workflowGlobalFilterFn: FilterFn<WorkflowDataRow> = (row, _columnId, filterValue) => {
  if (!filterValue || typeof filterValue !== "string") return true;
  const query = filterValue.toLowerCase();
  const { workflowName, projectName } = row.original;
  return workflowName?.toLowerCase().includes(query) || projectName?.toLowerCase().includes(query);
};

/** Global filter function for project rows — searches by project name */
export const projectGlobalFilterFn: FilterFn<ProjectDataRow> = (row, _columnId, filterValue) => {
  if (!filterValue || typeof filterValue !== "string") return true;
  const query = filterValue.toLowerCase();
  const { projectName } = row.original;
  return projectName?.toLowerCase().includes(query);
};

export const projectUserGlobalFilterFn: FilterFn<UserPerProject> = (row, _columnId, filterValue) => {
  if (!filterValue || typeof filterValue !== "string") return true;
  const query = filterValue.toLowerCase();
  const { userName, userEmail } = row.original;
  return userName?.toLowerCase().includes(query) || userEmail?.toLowerCase().includes(query);
};

export const createUserColumns = (onRowAction?: (user: UserDataRow) => void): ColumnDef<UserDataRow>[] => {
  return [
    {
      accessorKey: "name",
      enableSorting: true,
      header: ({ column }) => {
        const isSorted = column.getIsSorted() || false;
        return (
          <span className="inline-flex items-center gap-1 group/header cursor-pointer" onClick={() => column.toggleSorting(isSorted === "asc")}>
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="flex cursor-pointer items-center group-hover/header:opacity-100 opacity-0 ml-2 gap-0.5">
              <ArrowUp className={cn(" h-4", isSorted === "asc" ? "text-foreground" : "opacity-30")} />
              <ArrowDown className={cn("h-4", isSorted === "desc" ? "text-foreground" : "opacity-30")} />
            </span>
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            {row.original.profilePicture ? (
              <AvatarImage src={row.original.profilePicture} alt={row.original.name} />
            ) : (
              <AvatarFallback className="text-sm font-normal leading-none text-foreground" style={{ backgroundColor: row.original.avatarColor }}>
                {row.original.avatarInitials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col gap-1 ">
            <span className="text-sm text-foreground">{row.original.name ? row.original.name : "__"}</span>
            <span className="text-xs text-muted-foreground">{row.original.email ? row.original.email : "__"}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: () => <span className="text-sm text-muted-foreground">Status</span>,
      cell: ({ row }) => (
        <Badge
          className={cn(
            "text-xs font-semibold rounded-full",
            row.original.isActive ? "text-success bg-success/20" : "text-destructive bg-destructive/20"
          )}
          variant={row.original.isActive ? "secondary" : "destructive"}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "lastActive",
      header: () => <span className="text-sm text-muted-foreground">Last Active</span>,
      cell: ({ row }) => (
        <span className="text-sm text-foreground">{row.original.lastActive ? moment.utc(row.original.lastActive).fromNow() : "__"}</span>
      ),
    },
    {
      accessorKey: " ",
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onRowAction?.(row.original)}>
            <CaretRightIcon size={16} />
          </Button>
        </div>
      ),
    },
  ];
};
export const createWorkflowColumns = (onRowAction?: (workflow: WorkflowDataRow) => void): ColumnDef<WorkflowDataRow>[] => {
  return [
    {
      accessorKey: "workflowName",
      enableSorting: true,
      header: ({ column }) => {
        const isSorted = column.getIsSorted() || false;
        return (
          <span className="inline-flex items-center gap-1 group/header cursor-pointer" onClick={() => column.toggleSorting(isSorted === "asc")}>
            <span className="text-sm text-muted-foreground">Workflow</span>
            <span className="flex cursor-pointer items-center group-hover/header:opacity-100 opacity-0 ml-2 gap-0.5">
              <ArrowUp className={cn(" h-4", isSorted === "asc" ? "text-foreground" : "opacity-30")} />
              <ArrowDown className={cn("h-4", isSorted === "desc" ? "text-foreground" : "opacity-30")} />
            </span>
          </span>
        );
      },
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.workflowName ? row.original.workflowName : "__"}</span>,
    },
    {
      accessorKey: "projectName",
      header: () => <span className="text-sm text-muted-foreground">Project</span>,
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.projectName ? row.original.projectName : "__"}</span>,
    },
    {
      accessorKey: "users",
      header: () => <span className="text-sm text-muted-foreground">Users</span>,
      cell: ({ row }) => (
        <Badge className="text-xs text-secondary-foreground font-semibold rounded-full" variant="secondary">
          {row.original.users}
        </Badge>
      ),
    },
    {
      accessorKey: " ",
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onRowAction?.(row.original)}>
            <CaretRightIcon size={16} />
          </Button>
        </div>
      ),
    },
  ];
};

/** Creates project table columns with sortable headers and row actions */
export const createProjectColumns = (onRowAction?: (project: ProjectDataRow) => void): ColumnDef<ProjectDataRow>[] => {
  const roleTypes = ["Admin", "Editor", "Viewer"];

  const roleColumns: ColumnDef<ProjectDataRow>[] = roleTypes.map((roleType) => ({
    id: roleType,
    accessorFn: (row) => {
      const role = row.roles.find((r) => r.roleName === roleType);
      return role?.count ?? 0;
    },
    header: () => <span className="text-sm text-muted-foreground">{roleType}s</span>,
    cell: ({ row }) => {
      const role = row.original.roles.find((r) => r.roleName === roleType);
      const count = role?.count ?? 0;
      return (
        <Badge className="text-xs text-secondary-foreground font-semibold rounded-full" variant="secondary">
          {count}
        </Badge>
      );
    },
  }));

  return [
    {
      accessorKey: "projectName",
      enableSorting: true,
      header: ({ column }) => {
        const isSorted = column.getIsSorted() || false;
        return (
          <span className="inline-flex items-center gap-1 group/header cursor-pointer" onClick={() => column.toggleSorting(isSorted === "asc")}>
            <span className="text-sm text-muted-foreground">Projects</span>
            <span className="flex cursor-pointer items-center group-hover/header:opacity-100 opacity-0 ml-2 gap-0.5">
              <ArrowUp className={cn(" h-4", isSorted === "asc" ? "text-foreground" : "opacity-30")} />
              <ArrowDown className={cn("h-4", isSorted === "desc" ? "text-foreground" : "opacity-30")} />
            </span>
          </span>
        );
      },
      cell: ({ row }) => <span className="text-sm text-foreground">{row.original.projectName || "__"}</span>,
    },
    {
      accessorKey: "users",
      header: () => <span className="text-sm text-muted-foreground">Users</span>,
      cell: ({ row }) => (
        <Badge className="text-xs text-secondary-foreground font-semibold rounded-full" variant="secondary">
          {row.original.users}
        </Badge>
      ),
    },
    ...roleColumns,
    {
      accessorKey: " ",
      header: " ",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onRowAction?.(row.original)}>
            <CaretRightIcon size={16} />
          </Button>
        </div>
      ),
    },
  ];
};

export const ProjectUserColumns = (toggleItem: (user: UserPerProject) => void, toggledIds: Set<string>): ColumnDef<UserPerProject>[] => {
  return [
    {
      accessorKey: "name",
      enableSorting: true,
      header: ({ column }) => {
        const isSorted = column.getIsSorted() || false;
        return (
          <span className="inline-flex items-center gap-1 group/header cursor-pointer" onClick={() => column.toggleSorting(isSorted === "asc")}>
            <span className="text-sm text-muted-foreground">Name</span>
            <span className="flex cursor-pointer items-center group-hover/header:opacity-100 opacity-0 ml-2 gap-0.5">
              <ArrowUp className={cn(" h-4", isSorted === "asc" ? "text-foreground" : "opacity-30")} />
              <ArrowDown className={cn("h-4", isSorted === "desc" ? "text-foreground" : "opacity-30")} />
            </span>
          </span>
        );
      },
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 shrink-0">
            {row.original.profilePicture ? (
              <AvatarImage src={row.original.profilePicture} alt={row.original.name} />
            ) : (
              <AvatarFallback className="text-sm font-normal leading-none text-foreground" style={{ backgroundColor: row.original.avatarColor }}>
                {row.original.avatarInitials}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col gap-1 max-w-[107px]">
            <span className="text-sm text-foreground truncate">{row.original.userName ? row.original.userName : "__"}</span>
            <span className="text-xs text-muted-foreground truncate">{row.original.userEmail ? row.original.userEmail : "__"}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "roleName",
      header: () => <span className="text-sm text-muted-foreground">Role</span>,
      cell: ({ row }) => (
        <Badge className="text-xs text-secondary-foreground font-semibold rounded-full" variant="secondary">
          {row.original.roleName}
        </Badge>
      ),
    },
    {
      accessorKey: "isActive",
      header: () => <span className="text-sm text-muted-foreground">Status</span>,
      cell: ({ row }) => (
        <Badge
          className={cn(
            "text-xs font-semibold rounded-full",
            row.original.isActive ? "text-success bg-success/20" : "text-destructive bg-destructive/20"
          )}
          variant={row.original.isActive ? "secondary" : "destructive"}
        >
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessorKey: "",
      header: "Access",
      cell: ({ row }) => {
        const isChecked = toggledIds.has(row.original.id) ? !row.original.isActive : row.original.isActive;
        return (
          <div className="flex items-center justify-end gap-2">
            <Checkbox checked={isChecked} onCheckedChange={() => toggleItem(row.original)} />
          </div>
        );
      },
    },
  ];
};
