import { useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ProjectDataRow, UserDataRow, UserPerProject, WorkflowDataRow } from "@/types/user";

import {
  createInvitationMutation,
  getAccessRequests,
  getEntityUsers,
  getLowerRankRoles,
  getUsersWithNoAccess,
  getProjectsByUser,
  getProjectsDashboard,
  getRoleById,
  getRolePermissionsMatrix,
  getRoles,
  getUserProfile,
  getUsers,
  getUsersDashboard,
  getWorkflowsByUser,
  getWorkflowsDashboard,
  sendInviteEmail,
  updateAccessRequestMutation,
  updatePermissionsBatch,
  updateProfile,
  updateRoleMutation,
  updateUserInProjectsPermissionsBatch,
  updateUserInWorkflowsPermissionsBatch,
  updateUserRoles,
  validateUserMutation,
} from "./securityQueries";
import { getInitials, generateAvatarColor } from "./utils";
import { useApiMutation, useApiQuery } from "@/api";
import type { AccessRequest } from "@/types/accessRequest";
import { ACCESS_REQUEST_STATUS, ENTITY_TYPE } from "@/types/accessRequest";


export function useValidateUserMutation() {
  return useMutation(validateUserMutation());
}

export function useGetRolesQuery() {
  return useApiQuery(getRoles(), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
}

export function useGetLowerRankRolesQuery(entityType: ENTITY_TYPE, entityId: string, enabled = true) {
  return useApiQuery(getLowerRankRoles(entityType, entityId), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    enabled: !!entityId && enabled,
  });
}
export function useGetUsersQuery() {
  return useApiQuery(getUsers(), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
}
export function useGetRolePermissionsMatrix() {
  return useApiQuery(getRolePermissionsMatrix(), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
}
export function useUpdateUserRoles() {
  const queryClient = useQueryClient();
  const createConfigFn = updateUserRoles(queryClient);
  return useMutation(createConfigFn);
}
export function useSendInviteEmail() {
  const createConfigFn = sendInviteEmail();
  return useMutation(createConfigFn);
}
export function useGetUserProfile() {
  return useApiQuery(getUserProfile(), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useApiMutation(updateProfile(), {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: getUserProfile().queryKey });
    },
  });
}

export function useGetUsersDashboardQuery() {
  return useApiQuery(getUsersDashboard(), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    select: (data): UserDataRow[] =>
      data.map((u) => ({
        id: u.userId,
        name: u.username,
        email: u.userEmail,
        avatarInitials: getInitials(u.username),
        profilePicture: u.profilePicture,
        avatarColor: generateAvatarColor(),
        workflows: u.workflows,
        lastActive: u.lastActive,
        userRole: u.userRole,
        projects: u.projects,
        workspaces: u.workspaces,
        isActive: u.isActive,
      })),
  });
}
export function useGetWorkflowsDashboardQuery() {
  return useApiQuery(getWorkflowsDashboard(), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    select: (data): WorkflowDataRow[] =>
      data.map((w) => ({
        id: w.workflowId,
        workflowName: w.workflowName,
        projectName: w.projectName,
        users: w.users,
      })),
  });
}
export function useGetProjectsDashboardQuery() {
  return useApiQuery(getProjectsDashboard(), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    select: (data): ProjectDataRow[] =>
      data.map((p) => ({
        projectId: p.projectId,
        projectName: p.projectName,
        roles: p.roles,
        users: p.users,
      })),
  });
}

export function useGetProjectsByUsers(userId: string, enabled = true) {
  return useApiQuery(getProjectsByUser(userId), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    enabled: !!userId && enabled,
  });
}
export function useUpdatePermissionsBatch(userId: string) {
  const queryClient = useQueryClient();
  const createConfigFn = updatePermissionsBatch(queryClient, userId);
  return useMutation(createConfigFn);
}
export function useUpdateUserInProjectsPermissionsBatch() {
  const queryClient = useQueryClient();
  const createConfigFn = updateUserInProjectsPermissionsBatch(queryClient);
  return useMutation(createConfigFn);
}

export function useUpdateUserInWorkflowsPermissionsBatch() {
  const queryClient = useQueryClient();
  const createConfigFn = updateUserInWorkflowsPermissionsBatch(queryClient);
  return useMutation(createConfigFn);
}

export function useGetWorkflowsByUsers(userId: string, enabled = true) {
  return useApiQuery(getWorkflowsByUser(userId), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    enabled: !!userId && enabled,
  });
}

/** Retrieves all users with permissions for a specific entity (project) */
export function useGetEntityUsers(entityId: string, enabled = true) {
  return useApiQuery(getEntityUsers(entityId), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    enabled: !!entityId && enabled,
    select: (data): UserPerProject[] =>
      data.map((u) => ({
        ...u,
        avatarInitials: getInitials(u.userName),
        avatarColor: generateAvatarColor(),
      })),
  });
}

export function useGetUsersWithNoAccessQuery(entityType: ENTITY_TYPE, entityId: string, enabled = true) {
  return useApiQuery(getUsersWithNoAccess(entityType, entityId), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    enabled: !!entityId && enabled,
  });
}

export function useCreateInvitation(entityType: ENTITY_TYPE, entityId: string) {
  const queryClient = useQueryClient();
  return useApiMutation(createInvitationMutation(queryClient, entityType, entityId));
}

export function useGetAccessRequestsQuery() {
  return useApiQuery(getAccessRequests(), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();
  return useApiMutation(updateRoleMutation(queryClient));
}

export function useUpdateAccessRequest() {
  const queryClient = useQueryClient();
  return useApiMutation(updateAccessRequestMutation(queryClient));
}

export function useGetRoleById(roleId: string) {
  return useApiQuery(getRoleById(roleId), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    enabled: !!roleId,
  });
}

export function useApproveAllAccessRequests() {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useApiMutation(updateAccessRequestMutation(queryClient), {
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: getAccessRequests().queryKey });
      const previousData = queryClient.getQueryData<AccessRequest[]>(getAccessRequests().queryKey);
      queryClient.setQueryData<AccessRequest[]>(getAccessRequests().queryKey, (old) =>
        old ? old.filter((r) => !variables.accessRequestIds.includes(r.id)) : []
      );
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData != null) {
        queryClient.setQueryData(getAccessRequests().queryKey, context.previousData);
      }
    },
  });

  const approveAll = useCallback(
    (accessRequestIds: string[], adminId: string) => {
      if (accessRequestIds.length === 0) return;
      mutate({ accessRequestIds, adminId, status: ACCESS_REQUEST_STATUS.Approved });
    },
    [mutate]
  );

  return { approveAll, isPending };
}
