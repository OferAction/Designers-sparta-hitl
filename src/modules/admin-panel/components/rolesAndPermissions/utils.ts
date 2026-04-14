import type { PermissionGroup } from "@/modules/admin-panel/types";
import type { RolePermissionItem } from "@/services/securityService/securityQueries";

/**
 * Form values keyed by role, then permission id.
 * Default values come from the server's `isAssigned` flags.
 */
type RolePermissionsFormValues = Record<string, boolean>;
export type PermissionsFormValues = Record<string, RolePermissionsFormValues>;

/**
 * Groups permissions by their permission group name.
 */
export function groupByPermissionGroup(permissions: RolePermissionItem[]): PermissionGroup[] {
  const order: string[] = [];
  const map = new Map<string, RolePermissionItem[]>();
  for (const p of permissions) {
    if (!map.has(p.permissionGroup)) {
      order.push(p.permissionGroup);
      map.set(p.permissionGroup, []);
    }
    map.get(p.permissionGroup)!.push(p);
  }
  return order.map((groupName) => ({
    groupName,
    permissions: map.get(groupName)!,
  }));
}
