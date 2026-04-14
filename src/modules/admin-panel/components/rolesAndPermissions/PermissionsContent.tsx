import { useMemo, useState } from "react";

import { useFormContext } from "react-hook-form";

import PermissionCategoryBlock from "./PermissionCategoryBlock";
import { groupByPermissionGroup, type PermissionsFormValues } from "./utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { RoleWithPermissions } from "@/services/securityService/securityQueries";
import { cn } from "@/utils";

interface PermissionsContentProps {
  roleId: string;
  role: RoleWithPermissions | undefined;
}
/**
 * Displays and manages permissions for a specific role.
 */
export default function PermissionsContent({ roleId, role }: PermissionsContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { formState, resetField } = useFormContext<PermissionsFormValues>();

  const groups = useMemo(() => (role?.permissions ? groupByPermissionGroup(role.permissions) : []), [role?.permissions]);
  const handleReset = () => {
    resetField(roleId);
  };
  const changedCount = Object.keys(formState.dirtyFields?.[roleId] ?? {})?.length ?? 0;
  const roleName = role?.name ?? "";

  return (
    <div className="flex flex-col gap-4 p-6 border border-sidebar-border rounded-lg ">
      <div className="flex flex-col max-w-[70%] min-w-0 sm:min-w-[500px]">
        <div className="flex flex-row gap-4 items-end justify-between">
          <div className="flex flex-col gap-1 min-w-0 pb-6">
            <h2 className="text-2xl font-semibold text-foreground">Permissions - {roleName}</h2>
            <p className="text-sm text-muted-foreground mt-1">Adjust what {roleName.toLowerCase()} users can do. Changes apply Space-wide.</p>
          </div>

          <div className="flex flex-wrap items-center gap-6 pb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Input
                placeholder="Search permissions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border-input"
              />
            </div>
            <span className={cn("text-sm text-muted-foreground", changedCount > 0 && "text-foreground")}>{changedCount} changed</span>
            <Button variant="secondary" onClick={handleReset} disabled={changedCount === 0} className="font-normal">
              Reset
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {groups.map((group) => (
            <PermissionCategoryBlock key={group.groupName} group={group} roleId={roleId} searchQuery={searchQuery} />
          ))}
        </div>
      </div>
    </div>
  );
}
