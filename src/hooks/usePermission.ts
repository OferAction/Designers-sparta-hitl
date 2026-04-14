import { useCallback, useMemo } from "react";

import type { User } from "@/types/user";

import type { PermissionMatrixItem } from "@/services/securityService/securityQueries";
import { useGetUserProfile, useGetRolePermissionsMatrix } from "@/services/securityService/securityService";
import { useAuthStore } from "@/store/authStore";

/**
 * Computes the user's effective permissions based on their role
 * @param userProfile - The current user profile with role information
 * @param permissionsMatrix - The role-permissions matrix from the backend
 * @returns Array of permission names the user has access to
 */
function computeUserPermissions(userProfile: User | undefined, permissionsMatrix: PermissionMatrixItem[] | undefined): string[] {
  // Extract all permissions where the user's role has access
  const permissions: string[] = [];

  // TODO: Remove This static permissions once roles are fully integrated
  if (
    [
      "o.rashed@GenOrPlatform.onmicrosoft.com",
      "a.osama@GenOrPlatform.onmicrosoft.com",
      "z.ibrahim@GenOrPlatform.onmicrosoft.com",
      "idan@GenOrPlatform.onmicrosoft.com",
      "o.shawky@GenOrPlatform.onmicrosoft.com",
    ]
      .map((email) => email.toLowerCase())
      .includes(useAuthStore.getState().user?.email.toLowerCase() || "")
  ) {
    permissions.push("EXCLUSIVE_LLM_MODELS_ACCESS");
  }

  if (!userProfile || !permissionsMatrix) {
    return permissions;
  }

  // Get user's role ID from profile
  const userRoleId = userProfile.roleId || userProfile.role?.id;

  if (!userRoleId) {
    return permissions;
  }

  for (const permissionItem of permissionsMatrix) {
    const roleEntry = permissionItem.roles.find((r) => r.roleId === userRoleId);
    if (roleEntry?.hasPermission) {
      permissions.push(permissionItem.permissionName);
    }
  }

  return permissions;
}

/**
 * Check if user has specific permission(s)
 * @param userPermissions - Array of user's permission names
 * @param requiredPermissions - Single permission or array of permissions to check
 * @param mode - 'all' requires all permissions, 'any' requires at least one
 * @returns boolean indicating if user has required permission(s)
 */
function checkPermission(userPermissions: string[], requiredPermissions: string | string[], mode: "all" | "any" = "all"): boolean {
  if (typeof requiredPermissions === "string") {
    return userPermissions.includes(requiredPermissions);
  }

  if (mode === "all") {
    return requiredPermissions.every((perm) => userPermissions.includes(perm));
  }

  return requiredPermissions.some((perm) => userPermissions.includes(perm));
}

interface UsePermissionOptions {
  /**
   * Permission name(s) to check immediately
   */
  permission?: string | string[];
  /**
   * When checking multiple permissions:
   * - 'all': user must have ALL permissions (AND logic)
   * - 'any': user must have AT LEAST ONE permission (OR logic)
   * @default 'all'
   */
  mode?: "all" | "any";
}

interface UsePermissionReturn {
  /**
   * Check if user has a specific permission or set of permissions
   * @param permission - Permission name(s) to check
   * @param mode - 'all' or 'any' for multiple permissions
   */
  hasPermission: (permission: string | string[], mode?: "all" | "any") => boolean;
  /**
   * Array of all permission names the user has
   */
  permissions: string[];
  /**
   * True while permissions are being loaded from the backend
   */
  isLoading: boolean;
  /**
   * True if there was an error loading permissions
   */
  isError: boolean;
  /**
   * The user profile data
   */
  userProfile?: User;
}

/**
 * Hook to check user permissions based on their role
 *
 * The return type is automatically inferred:
 * - When called with { permission: "..." }, returns boolean
 * - When called with no arguments or empty object, returns UsePermissionReturn object
 *
 * @example
 * // Automatically inferred as boolean
 * const canEdit = usePermission({ permission: 'FLOW_EDIT' });
 * // canEdit is boolean
 *
 * @example
 * // Automatically inferred as boolean with multiple permissions
 * const canDelete = usePermission({
 *   permission: ['FLOW_EDIT', 'FLOW_DELETE'],
 *   mode: 'all'
 * });
 * // canDelete is boolean
 *
 * @example
 * // Automatically inferred as UsePermissionReturn object
 * const { hasPermission, permissions, isLoading } = usePermission();
 * // TypeScript knows the exact type, no type guards needed!
 *
 * if (isLoading) return <Loader />;
 *
 * return (
 *   <div>
 *     {hasPermission('FLOW_EDIT') && <EditButton />}
 *     {hasPermission(['FLOW_DELETE', 'ADMIN'], 'any') && <DeleteButton />}
 *   </div>
 * );
 */

// Overload signatures for automatic type inference
export function usePermission(): UsePermissionReturn;
export function usePermission(options: { permission: string | string[]; mode?: "all" | "any" }): boolean;
export function usePermission(options?: UsePermissionOptions): boolean | UsePermissionReturn {
  const { permission, mode = "all" } = options || {};

  const { data: userProfile, isLoading: profileLoading, isError: profileError } = useGetUserProfile();

  const { data: permissionsMatrix, isLoading: matrixLoading, isError: matrixError } = useGetRolePermissionsMatrix();

  // Compute user permissions (memoized to prevent recalculation)
  const userPermissions = useMemo(() => computeUserPermissions(userProfile, permissionsMatrix), [userProfile, permissionsMatrix]);

  // Create stable hasPermission checker function
  const hasPermission = useCallback(
    (perm: string | string[], checkMode: "all" | "any" = "all") => checkPermission(userPermissions, perm, checkMode),
    [userPermissions]
  );

  const isLoading = profileLoading || matrixLoading;
  const isError = profileError || matrixError;

  // If specific permission was provided, return boolean directly
  if (permission) {
    if (isLoading) return false; // Default to no access while loading
    return checkPermission(userPermissions, permission, mode);
  }

  // Otherwise return full object with utilities
  return {
    hasPermission,
    permissions: userPermissions,
    isLoading,
    isError,
    userProfile,
  };
}
