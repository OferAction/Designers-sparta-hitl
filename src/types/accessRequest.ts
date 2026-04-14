/** Access request status (matches backend enum) */
export const ACCESS_REQUEST_STATUS = {
    Pending: 0,
    Approved: 1,
    Declined: 2,
} as const;

export type ACCESS_REQUEST_STATUS = (typeof ACCESS_REQUEST_STATUS)[keyof typeof ACCESS_REQUEST_STATUS];

/** Entity type (matches backend enum) */
export const ENTITY_TYPE = {
    Project: 1,
    File: 2,
    Workspace: 3,
} as const;

export type ENTITY_TYPE = (typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE];

/** Map from entity type value to display label (derived from ENTITY_TYPE) */
export const ENTITY_TYPE_LABEL: Record<(typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE], string> = Object.fromEntries(
    (Object.entries(ENTITY_TYPE) as [keyof typeof ENTITY_TYPE, number][]).map(([key, value]) => [value, key])
) as Record<(typeof ENTITY_TYPE)[keyof typeof ENTITY_TYPE], string>;

/** API shape for access/seat requests (GET /api/security/access-request) */
export interface AccessRequest {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    entityTypeId: string;
    entityType: ENTITY_TYPE;
    entityName: string;
    entityLink: string;
    roleId: string;
    roleLabel: string;
    status: ACCESS_REQUEST_STATUS;
    comment: string;
    createdAt: string;
}
