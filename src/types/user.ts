import { Role } from "./role";

export interface User {
  id: string; // internal unique identifier
  externalId?: string; // external auth provider id
  roleId?: string; // foreign key to Role
  roleName?: string | null; // denormalized role name if provided
  age?: number; // example field (could be removed if unused)
  name: string; // display / full name
  email: string; // primary email
  profilePicture?: string;
  theme?: number | null; // user theme preference
  isActive: boolean;
  createdAt: string; // ISO timestamps
  updatedAt: string;
  deletedOn?: string | null;
  role?: Role | null; // embedded role object (optional)
}

export type UserRoleUpdate = {
  userId: string;
  roleId: string | undefined;
};

export interface DashboardUser {
  isActive: boolean;
  projects: number;
  userId: string;
  username: string;
  lastActive: string;
  userRole: "Admin" | "Editor" | "Viewer";
  userEmail: string;
  workflows: number;
  workspaces: number;
  profilePicture: string;
}

export interface DashboardWorkflow {
  projectId: string;
  projectName: string;
  users: number;
  workflowId: string;
  workflowName: string;
}
export interface DashboardProject {
  projectId: string;
  projectName: string;
  roles: { role: string; roleName: "Admin" | "Editor" | "Viewer"; count: number }[];
  users: number;
}
export interface UserPerProject extends User {
  entityId: string;
  entityName: string;
  entityType: number;
  expiresAt: string;
  fileId: string;
  grantedBy: string;
  isDeleted: boolean;
  projectId: string;
  spaceId: string;
  userEmail: string;
  userId: string;
  userName: string;
  avatarInitials: string;
  avatarColor: string;
}
export interface UserPerWorkflow extends User {
  entityId: string;
  entityName: string;
  entityType: number;
  expiresAt: string;
  fileId: string;
  grantedBy: string;
  isDeleted: boolean;
  projectId: string;
  spaceId: string;
  userEmail: string;
  userId: string;
  userName: string;
  avatarInitials: string;
  avatarColor: string;
}

export interface WorkflowPerProject extends User {
  entityId: string;
  entityName: string;
  entityType: string;
  expiresAt: string;
  fileId: string;
  grantedBy: string;
  id: string;
  isDeleted: string;
  projectId: string;
  roleName: string;
  spaceId: string;
  updatedAt: string;
  userEmail: string;
  userId: string;
  userName: string;
}

/** User eligible for invitation (has no access to a given entity) */
export interface InvitableUser {
  id: string;
  externalId: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
}

/** User permission data for a specific entity (project, file, space, etc.) from GET /UserPermission/entity/{entityId}/users */
export interface ProjectUser {
  id: string;
  userId: string;
  userName: string | null;
  userEmail: string | null;
  profilePicture: string | null;
  roleId: string;
  roleName: string | null;
  entityId: string;
  entityName: string | null;
  entityType: number;
  projectId: string | null;
  fileId: string | null;
  spaceId: string | null;
  grantedBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string | null;
  isDeleted: boolean;
}
export interface UserDataRow {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  profilePicture: string;
  avatarColor: string;
  workflows: number;
  lastActive: string;
  workspaces: number;
  userRole: "Admin" | "Editor" | "Viewer";
  projects: number;
  isActive: boolean;
}
export interface WorkflowDataRow {
  id: string;
  workflowName: string;
  projectName: string;
  users: number;
}
export interface ProjectDataRow {
  projectId: string;
  projectName: string;
  roles: { role: string; roleName: "Admin" | "Editor" | "Viewer"; count: number }[];
  users: number;
}
export type FilterType = "Users" | "Workflows" | "Projects";
