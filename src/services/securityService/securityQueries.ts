import { QueryClient } from "@tanstack/react-query";

import { DashboardProject, DashboardUser, DashboardWorkflow, InvitableUser, User, UserPerProject, UserRoleUpdate, WorkflowPerProject } from "@/types/user";

import { createApiPostMutation, createApiPutMutation, createApiQuery } from "@/api";
import API_CONFIGS from "@/config/api.config";
import type { AccessRequest } from "@/types/accessRequest";
import { ACCESS_REQUEST_STATUS, ENTITY_TYPE } from "@/types/accessRequest";
import { Role } from "@/types/role";

/** Payload for PUT /access-request (approve/decline) */
export interface UpdateAccessRequestPayload {
  accessRequestIds: string[];
  adminId: string;
  status: ACCESS_REQUEST_STATUS;
}

/** Payload for POST /invitation-logs */
export interface CreateInvitationPayload {
  userIds: string[];
  entityTypeId: string;
  entityType: ENTITY_TYPE;
  entityLink: string;
  roleId: string;
}

export interface RolePermissionEntry {
  roleId: string;
  roleName: string;
  hasPermission: boolean;
}
export interface PermissionMatrixItem {
  permissionId: string;
  permissionName: string;
  displayName: string;
  roles: RolePermissionEntry[];
}

/** Permission item from GET /roles/:id */
export interface RolePermissionItem {
  permissionId: string;
  permissionName: string;
  permissionDisplayName: string;
  permissionDescription: string;
  permissionGroup: string;
  isAssigned: boolean;
}

/** Role with permissions from GET /roles/:id */
export interface RoleWithPermissions {
  id: string;
  name: string;
  description?: string;
  permissions: RolePermissionItem[];
}

/** Payload for PUT /roles/:id */
export interface UpdateRolePayload {
  id: string;
  name: string;
  description: string;
  permissionIds: string[];
}

const apiClientKey = "SECURITY";

const SECURITY = API_CONFIGS[apiClientKey];

// Role/Users security queries

// (Example user JSON removed; see types/user.ts for structure)

export const validateUserMutation = () =>
  createApiPostMutation(SECURITY.ENDPOINTS.AUTH_VALIDATE, {
    apiClientKey,
  });
export const getRoles = () =>
  createApiQuery<Role[]>(
    SECURITY.ENDPOINTS.ROLES,
    ["roles"],
    {
      apiClientKey,
    },
    { params: { includeInactive: true } }
  );

export const getLowerRankRoles = (entityType: ENTITY_TYPE, entityId: string) =>
  createApiQuery<Role[]>(
    SECURITY.ENDPOINTS.ROLES_LOWER_RANKS,
    ["rolesLowerRanks", entityType, entityId],
    { apiClientKey },
    { params: { entityType, entityId } }
  );

export const getRoleById = (roleId: string) =>
  createApiQuery<RoleWithPermissions>(SECURITY.ENDPOINTS.ROLE_BY_ID(roleId), ["role", roleId], {
    apiClientKey,
    enabled: !!roleId,
  });

export const updateRoleMutation = (queryClient: QueryClient) =>
  createApiPutMutation<unknown, UpdateRolePayload>((variables) => SECURITY.ENDPOINTS.ROLE_BY_ID(variables.id), {
    mutationKey: ["updateRole"],
    apiClientKey,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["role", variables.id] });
      queryClient.invalidateQueries({ queryKey: getRoles().queryKey });
    },
  });

export const getUsers = () =>
  createApiQuery<User[]>(
    SECURITY.ENDPOINTS.USERS,
    ["users"],
    {
      apiClientKey,
    },
    { params: { includeInactive: true } }
  );

export const updateUserRoles = (queryClient: QueryClient) => {
  return createApiPostMutation<string, UserRoleUpdate[]>(SECURITY.ENDPOINTS.USER_ROLES, {
    mutationKey: ["updateUserRoles"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUsers().queryKey });
    },
    apiClientKey,
  });
};
export const getRolePermissionsMatrix = () =>
  createApiQuery<PermissionMatrixItem[]>(SECURITY.ENDPOINTS.ROLE_PERMISSIONS_MATRIX, ["rolePermissionsMatrix"], {
    apiClientKey,
  });

export const sendInviteEmail = () => {
  return createApiPostMutation<string, { email: string[] }>(API_CONFIGS["DEFAULT"].ENDPOINTS.INVITATIONS, {
    mutationKey: ["sendInvite"],
    apiClientKey: "DEFAULT",
  });
};
export const getUserProfile = () =>
  createApiQuery<User>(SECURITY.ENDPOINTS.USER_PROFILES, ["userProfile"], {
    apiClientKey,
  });

export function updateProfile() {
  return createApiPutMutation<string, FormData>(
    SECURITY.ENDPOINTS.UPDATE_USER_PROFILE,
    {
      mutationKey: ["updateUserProfile"],
      apiClientKey,
    },
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
}

export const getUsersDashboard = () =>
  createApiQuery<DashboardUser[]>(SECURITY.ENDPOINTS.USERS_DASHBOARD, ["usersDashboard"], {
    apiClientKey,
  });
export const getWorkflowsDashboard = () =>
  createApiQuery<DashboardWorkflow[]>(SECURITY.ENDPOINTS.WORKFLOWS_DASHBOARD, ["workflowsDashboard"], {
    apiClientKey,
  });

export const getProjectsDashboard = () =>
  createApiQuery<DashboardProject[]>(SECURITY.ENDPOINTS.PROJECTS_DASHBOARD, ["projectsDashboard"], {
    apiClientKey,
  });
export const getProjectsByUser = (userId: string) =>
  createApiQuery<UserPerProject[]>(SECURITY.ENDPOINTS.USERS_PROJECTS(userId), ["projects", userId], {
    apiClientKey,
    enabled: !!userId,
  });
export const getWorkflowsByUser = (userId: string) =>
  createApiQuery<WorkflowPerProject[]>(SECURITY.ENDPOINTS.USERS_WORKFLOWS(userId), ["workflows", userId], {
    apiClientKey,
    enabled: !!userId,
  });

/** Retrieves all users with permissions for a specific entity (project/file/space) */
export const getEntityUsers = (entityId: string) =>
  createApiQuery<UserPerProject[]>(SECURITY.ENDPOINTS.ENTITY_USERS(entityId), ["entityUsers", entityId], {
    apiClientKey,
    enabled: !!entityId,
  });

export const updatePermissionsBatch = (queryClient: QueryClient, userId: string) => {
  return createApiPutMutation<unknown, { id: string; isDeleted: boolean }[]>(SECURITY.ENDPOINTS.PERMISSIONS_BATCH_UPDATE, {
    mutationKey: ["updatePermissionsBatch"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getProjectsByUser(userId).queryKey });
      queryClient.invalidateQueries({ queryKey: getWorkflowsByUser(userId).queryKey });
      queryClient.invalidateQueries({ queryKey: getUsersDashboard().queryKey });
      queryClient.invalidateQueries({ queryKey: getWorkflowsDashboard().queryKey });
    },
    apiClientKey,
  });
};

export const updateUserInProjectsPermissionsBatch = (queryClient: QueryClient) => {
  return createApiPutMutation<unknown, { id: string; isDeleted: boolean }[]>(SECURITY.ENDPOINTS.PERMISSIONS_BATCH_UPDATE, {
    mutationKey: ["updateUserInProjectsPermissionsBatch"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getProjectsDashboard().queryKey });
    },
    apiClientKey,
  });
};
export const updateUserInWorkflowsPermissionsBatch = (queryClient: QueryClient) => {
  return createApiPutMutation<unknown, { id: string; isDeleted: boolean }[]>(SECURITY.ENDPOINTS.PERMISSIONS_BATCH_UPDATE, {
    mutationKey: ["updateUserInWorkflowsPermissionsBatch"],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getWorkflowsDashboard().queryKey });
    },
    apiClientKey,
  });
};

export const getUsersWithNoAccess = (entityType: ENTITY_TYPE, entityId: string) =>
  createApiQuery<InvitableUser[]>(
    SECURITY.ENDPOINTS.USERS_WITH_NO_ACCESS,
    ["usersWithNoAccess", entityType, entityId],
    { apiClientKey },
    { params: { entityType, entityId } }
  );

export const getAccessRequests = () =>
  createApiQuery<AccessRequest[]>(SECURITY.ENDPOINTS.ACCESS_REQUEST, ["accessRequests"], {
    apiClientKey,
  });

export const updateAccessRequestMutation = (queryClient: QueryClient) =>
  createApiPutMutation<unknown, UpdateAccessRequestPayload>(SECURITY.ENDPOINTS.ACCESS_REQUEST, {
    mutationKey: ["updateAccessRequest"],
    apiClientKey,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getAccessRequests().queryKey });
    },
  });

export const createInvitationMutation = (queryClient: QueryClient, entityType: ENTITY_TYPE, entityId: string) =>
  createApiPostMutation<unknown, CreateInvitationPayload>(SECURITY.ENDPOINTS.INVITATION_LOGS, {
    mutationKey: ["createInvitation"],
    apiClientKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUsersWithNoAccess(entityType, entityId).queryKey });
      queryClient.invalidateQueries({ queryKey: getEntityUsers(entityId).queryKey });
    },
  });
