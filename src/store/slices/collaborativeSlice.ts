import { StateCreator } from "zustand";

// Define OnlineUser interface since it's not properly defined elsewhere
export interface OnlineUser {
  initials: string;
  userId: string;
  userName: string;
}

export interface CollaborativeUser {
  clientId: number;
  initials: string;
  userName: string;
  userId: string;
  color: string;
  selection?: Set<string>;
  cursor: { x: number; y: number };
}
export type saveStatus = "save_started" | "save_failed" | "save_succeeded" | "";

export interface CollaborativeState {
  // Collaboration status
  isCollaborationEnabled: boolean;
  isConnected: boolean;
  connectionError: string | null;
  saveStatus: saveStatus;

  // Online users with collaborative features
  collaborativeUsers: CollaborativeUser[];

  // Actions
  enableCollaboration: () => void;
  disableCollaboration: () => void;
  setCollaborativeUsers: (users: CollaborativeUser[]) => void;
  setConnectionStatus: (connected: boolean, error?: string) => void;
  broadcastCursor: (position: { x: number; y: number }) => void;
  broadcastSelection: (nodeIds: string[]) => void;
  setSaveStatus: (status: saveStatus) => void;
  isSynced: boolean;
  setIsSynced: (isSynced: boolean) => void;
}

export const createCollaborativeSlice: StateCreator<CollaborativeState, [], [], CollaborativeState> = (set, _get) => ({
  // Initial state
  isCollaborationEnabled: false,
  isConnected: false,
  connectionError: null,
  collaborativeUsers: [],
  saveStatus: "",
  isSynced: false,

  // Actions
  enableCollaboration: () => {
    set((state) => ({
      ...state,
      isCollaborationEnabled: true,
      connectionError: null,
    }));
  },

  disableCollaboration: () => {
    set((state) => ({
      ...state,
      isCollaborationEnabled: false,
      isConnected: false,
      collaborativeUsers: [],
      connectionError: null,
    }));
  },

  setCollaborativeUsers: (users) => {
    set((state) => ({
      ...state,
      collaborativeUsers: users,
    }));
  },

  setConnectionStatus: (connected, error) => {
    set((state) => ({
      ...state,
      isConnected: connected,
      connectionError: error || null,
    }));
  },
  setSaveStatus: (status: saveStatus) => {
    set((state) => ({
      ...state,
      saveStatus: status,
    }));
  },

  setIsSynced: (isSynced: boolean) => {
    set((state) => ({
      ...state,
      isSynced,
    }));
  },

  broadcastCursor: (_position) => {
    // This will be implemented by the collaboration service
    // The service will handle the actual broadcasting
  },

  broadcastSelection: (_nodeIds) => {
    // This will be implemented by the collaboration service
    // The service will handle the actual broadcasting
  },
});

export default createCollaborativeSlice;
