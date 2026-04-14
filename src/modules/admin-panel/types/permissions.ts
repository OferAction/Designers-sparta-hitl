import type { RolePermissionItem } from "@/services/securityService/securityQueries";

/** Group of permissions from API (by permissionGroup) */
export interface PermissionGroup {
    groupName: string;
    permissions: RolePermissionItem[];
}

/**
 * Single permission item for Roles & Permissions UI config.
 * Keys (e.g. space:read) align with API permission names for mapping to role-permissions matrix.
 */
export interface PermissionItemConfig {
    key: string;
    label: string;
    description: string;
}

export interface PermissionCategoryConfig {
    key: string;
    label: string;
    description: string;
    items: PermissionItemConfig[];
}


export type DeletionPolicy = "Admin-only" | "Editors" | "Everyone";
export type ViewerRunPolicy = "Disabled" | "Enabled with quota" | "Unlimited";

export interface SpacePoliciesValues {
    deletionPolicy: DeletionPolicy;
    viewerRunPolicy: ViewerRunPolicy;
    dailyQuota: number;
}

export type EditorPolicy = "Can share (view-only)" | "Cannot share" | "Can share (edit)";
export type ViewerPolicy =
    | "Request share (Admin approved)"
    | "Cannot request"
    | "Can share (view-only)";
export type SubflowEditPolicy =
    | "Explicit permission required"
    | "Inherit from parent"
    | "Editors can edit";

export interface SharePolicyValues {
    editorPolicy: EditorPolicy;
    viewerPolicy: ViewerPolicy;
    subflowEditPolicy: SubflowEditPolicy;
}

// --- Defaults ---
export const DEFAULT_SPACE_POLICIES: SpacePoliciesValues = {
    deletionPolicy: "Admin-only",
    viewerRunPolicy: "Enabled with quota",
    dailyQuota: 10,
};

export const DEFAULT_SHARE_POLICY: SharePolicyValues = {
    editorPolicy: "Can share (view-only)",
    viewerPolicy: "Request share (Admin approved)",
    subflowEditPolicy: "Explicit permission required",
};


