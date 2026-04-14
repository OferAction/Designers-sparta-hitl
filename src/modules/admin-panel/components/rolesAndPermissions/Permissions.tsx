import { useEffect, useState } from "react";

import { TabsContent } from "@radix-ui/react-tabs";
import { useFormContext } from "react-hook-form";

import PermissionsContent from "./PermissionsContent";
import { Loader } from "@/components/common/Loader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PermissionsFormValues } from "@/modules/admin-panel/components/rolesAndPermissions/utils";
import { useGetRoleById, useGetRolesQuery } from "@/services/securityService";

/**
 * Permissions management UI with role-based tabs and permission configuration.
 */
export default function Permissions({ onTabChange }: { onTabChange?: () => void }) {
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const { data: roles = [], isLoading: rolesLoading } = useGetRolesQuery();
  const { reset } = useFormContext<PermissionsFormValues>();

  const effectiveRoleId = selectedRoleId || (roles[0]?.id ?? "");
  const { data: role, isLoading: roleLoading, isSuccess } = useGetRoleById(effectiveRoleId);

  useEffect(() => {
    if (isSuccess) {
      // Reset form when role data is loaded to populate default values
      reset(
        {
          [effectiveRoleId]: role?.permissions.reduce<Record<string, boolean>>((acc, perm) => {
            acc[perm.permissionId] = perm.isAssigned;
            return acc;
          }, {}),
        },
        {
          keepDirtyValues: true,
        }
      );
    }
  }, [effectiveRoleId, isSuccess, reset, role?.permissions, roles]);

  if (rolesLoading) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">Loading roles…</div>;
  }

  if (roles.length === 0) {
    return <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">No roles available.</div>;
  }

  return (
    <Tabs
      value={effectiveRoleId}
      onValueChange={(value) => {
        setSelectedRoleId(value);
        onTabChange?.();
      }}
      className="w-full"
      id="permissions-tabs"
    >
      <div className="sticky -top-6 z-10 bg-background py-1">
        <TabsList className="bg-muted/60 border border-sidebar-border rounded-lg ">
          {roles.map((r) => (
            <TabsTrigger
              key={r.id}
              value={r.id}
              className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"
            >
              {r.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <div className="mt-6">
        {roleLoading ? (
          <div className="flex items-start py-12 justify-center min-h-screen text-muted-foreground text-sm">
            <Loader />
          </div>
        ) : (
          <div>
            {roles.map((r) => (
              <TabsContent key={r.id} value={r.id} className="mt-4">
                <PermissionsContent roleId={r.id} role={role} />
              </TabsContent>
            ))}
          </div>
        )}
      </div>
    </Tabs>
  );
}
