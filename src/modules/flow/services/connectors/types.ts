export interface TokenResponse {
  userId: string;
  userEmail: string;
  userName: string;
}
export interface EmailConnectorUser {
  userEmail: string;
  userName: string;
  userId: string;
  userDisplayName?: string;
}

export interface EmailConnectorFolder {
  id: string;
  displayName: string;
  parentFolderId?: string;
  childFolderCount?: number;
  totalItemCount?: number;
  unreadItemCount?: number;
  children?: EmailConnectorFolder[];
}

export interface EmailConnectorFoldersResponse {
  success: boolean;
  userId: string;
  folders: EmailConnectorFolder[];
}

export interface UserDisplayPayload {
  $userDisplay: string;
  $userId: string;
}
