import { useCallback, useLayoutEffect } from "react";

import { HocuspocusProvider } from "@hocuspocus/provider";
import { FitViewOptions, useReactFlow, type XYPosition } from "@xyflow/react";
import { useParams } from "react-router-dom";
import * as Y from "yjs";

import { CANVAS_VIEW_SETTINGS } from "@/constants";
import { Node, Edge } from "@/modules/flow/types";
import { YjsCollaborationManager } from "@/services/hocusPocus/yjsCollaboration";
import { FlowStoreState, useCollaborativeStore, useFlowStore } from "@/store";
import { useAuthStore } from "@/store/authStore";
import { CollaborativeUser, saveStatus } from "@/store/slices/collaborativeSlice";

// Collaborative configuration
interface CollaborationConfig {
  roomName?: string;
  userId?: string;
  userName?: string;
  get?: () => FlowStoreState;
  set?: (partial: Partial<FlowStoreState>) => void;
}
type AwarenessState = {
  user: { id: string; name: string } | null;
  cursor: XYPosition | null;
  selection: string[];
};
// A session object representing one collaborative room
interface CollaborationSession {
  roomName: string;
  provider: HocuspocusProvider;
  ydoc: Y.Doc;
  nodesMap: Y.Map<Node>;
  edgesMap: Y.Map<Edge>;
  manager: YjsCollaborationManager;
  destroy: () => void;
}

class HocusPocusCollaborationService {
  private sessions = new Map<string, CollaborationSession>();
  private currentRoomName: string | null = null;
  private syncStatusDebounceTimer: NodeJS.Timeout | null = null;

  getOrCreateSession(config: CollaborationConfig = {}) {
    const {
      roomName = `flow-canvas-${window.location.pathname}`,
      userId = `user-${Math.random().toString(36).substring(2, 9)}`,
      userName = "Anonymous User",
      get,
      set,
    } = config;

    const existing = this.sessions.get(roomName);
    if (existing) {
      this.currentRoomName = roomName;
      return existing;
    }

    if (!get || !set) {
      throw new Error("Store bindings (get/set) are required to initialize collaboration session");
    }
    try {
      const ydoc = new Y.Doc();
      const provider = new HocuspocusProvider({
        url: import.meta.env.VITE_COLLAB_WS ?? "ws://127.0.0.1:1234",
        name: roomName,
        document: ydoc,
      });
      const nodesMap = ydoc.getMap<Node>("nodes");
      const edgesMap = ydoc.getMap<Edge>("edges");
      const metadata = ydoc.getMap<string>("metadata");

      metadata.observe(() => {
        const lastVersionAt = metadata.get("last_version_at");
        if (lastVersionAt) {
          useFlowStore.getState().setLastSaved(lastVersionAt);
        }
      });

      const manager = new YjsCollaborationManager(nodesMap, edgesMap, get, set, ydoc);
      manager.initializeObservers();
      console.log("✅ Collaboration manager initialized (singleton per room)");

      // Awareness initial state
      if (provider.awareness) {
        const initialState: AwarenessState = {
          user: { id: userId, name: userName },
          cursor: null,
          selection: [],
        };
        provider.awareness.setLocalState(initialState);
      }

      // Event listeners
      this.setupEventListeners(provider);
      useCollaborativeStore.getState().setConnectionStatus(true);
      useCollaborativeStore.getState().enableCollaboration();

      const session: CollaborationSession = {
        roomName,
        provider,
        ydoc,
        nodesMap,
        edgesMap,
        manager,
        destroy: () => {
          manager.cleanup();
          provider.destroy();
          ydoc.destroy();
          this.sessions.delete(roomName);
          useCollaborativeStore.getState().disableCollaboration();
          console.log(`🔌 Collaboration session destroyed: ${roomName}`);
        },
      };

      this.sessions.set(roomName, session);
      this.currentRoomName = roomName;
      return session;
    } catch (error) {
      console.error("Failed to initialize collaboration session:", error);
      useCollaborativeStore.getState().setConnectionStatus(false, `Failed to initialize: ${error}`);
      throw error;
    }
  }

  /** Return manager for a room if exists */
  getManager(roomName: string): YjsCollaborationManager | null {
    return this.sessions.get(roomName)?.manager || null;
  }

  /** Convenience getter for legacy code expecting a single active manager */
  get collaborationManager(): YjsCollaborationManager | null {
    if (this.currentRoomName) {
      return this.sessions.get(this.currentRoomName)?.manager || null;
    }
    const first = this.sessions.values().next();
    return first.done ? null : first.value.manager;
  }

  /** Set active room explicitly */
  setActiveRoom(roomName: string) {
    if (this.sessions.has(roomName)) {
      this.currentRoomName = roomName;
    }
  }

  /** Update cursor using current room */
  updateCursor(position: XYPosition) {
    const provider = this.currentRoomName ? this.sessions.get(this.currentRoomName)?.provider : undefined;
    if (!provider?.awareness) return;
    provider.awareness.setLocalStateField("cursor", position);
  }

  /** Update selection using current room */
  updateSelection(nodeIdsSet: Set<string>) {
    const provider = this.currentRoomName ? this.sessions.get(this.currentRoomName)?.provider : undefined;
    if (!provider?.awareness) return;
    provider.awareness.setLocalStateField("selection", Array.from(nodeIdsSet.values()));
  }

  handleMouseActions(event: React.MouseEvent, screenToFlowPosition: (point: XYPosition) => XYPosition) {
    const position = screenToFlowPosition({ x: event.clientX || 0, y: event.clientY || 0 });
    this.updateCursor(position);
  }

  destroyRoom(roomName: string = this.currentRoomName || "") {
    const session = this.sessions.get(roomName);
    if (!session) return;
    session.destroy();
    if (this.currentRoomName === roomName) {
      this.currentRoomName = null;
    }
  }

  isConnected(roomName: string = this.currentRoomName || ""): boolean {
    return !!this.sessions.get(roomName);
  }

  getCurrentClientId(roomName: string = this.currentRoomName || ""): number | null {
    const provider = this.sessions.get(roomName)?.provider;
    return provider?.awareness?.clientID || null;
  }

  /** Legacy helpers: operate on first active session */
  isAnyConnected(): boolean {
    const first = this.sessions.values().next();
    return !first.done;
  }
  getCurrentClientIdAny(): number | null {
    const first = this.sessions.values().next();
    const provider = first.done ? null : first.value.provider;
    return provider?.awareness?.clientID || null;
  }

  private setupEventListeners(provider: HocuspocusProvider) {
    if (!provider) return;
    if (provider.awareness) {
      provider.awareness.on("change", () => {
        if (!provider?.awareness) return;
        const states = Array.from(provider.awareness.getStates().entries());
        const users: CollaborativeUser[] = states
          .filter(([clientId]) => provider?.awareness && clientId !== provider.awareness.clientID)
          .map(([clientId, rawState]) => {
            const state = rawState;
            const selectionArray = Array.isArray(state.selection)
              ? state.selection
              : state.selection instanceof Set
                ? Array.from(state.selection.values())
                : [];
            return {
              clientId,
              initials: state.user?.name?.split(" ")[0]?.charAt(0).toUpperCase() + (state.user?.name?.split(" ")[1]?.charAt(0).toUpperCase() || ""),
              userId: state.user?.id || `client-${clientId}`,
              userName: state.user?.name || "Anonymous",
              color: this.getUserColor(state.user?.id || `client-${clientId}`),
              selection: new Set<string>(selectionArray),
              cursor: state.cursor || null,
            } as CollaborativeUser;
          });
        useCollaborativeStore.getState().setCollaborativeUsers(users);
      });
    }
    provider.on("status", ({ status }: { status: string }) => {
      const isConnected = status === "connected";
      useCollaborativeStore.getState().setConnectionStatus(isConnected, isConnected ? undefined : "Connection lost");
    });
    provider.on("unsyncedChanges", ({ number }: { number: number }) => {
      if (this.syncStatusDebounceTimer) {
        clearTimeout(this.syncStatusDebounceTimer);
      }
      this.syncStatusDebounceTimer = setTimeout(() => {
        useCollaborativeStore.getState().setIsSynced(number === 0 ? true : false);
      }, 2000);
    });
    provider.on("stateless", ({ payload }: { payload: saveStatus }) => {
      useCollaborativeStore.getState().setSaveStatus(payload);
    });
    provider.on("disconnect", () => {
      useCollaborativeStore.getState().setConnectionStatus(false, "Disconnected from collaboration server");
    });
  }

  private getUserColor(userId: string): string {
    const colors = ["#06B6D4", "#4ADE80", "#2563EB", "#FBBF24", "#6EE7B7", "#F43F5E", "#7E22CE", "#EF4444", "#D97706", "#E879f9", "#14B8A6"];
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}

// Hook that ensures a session exists and returns the singleton service
export const useHocusPocusService = (roomName?: string, fitViewOptions?: Partial<FitViewOptions> | undefined) => {
  const { fileId } = useParams();
  const { user } = useAuthStore();

  const provider = hocusPocusServiceSingleton;
  const { fitView } = useReactFlow();

  const onFitView = useCallback(() => {
    setTimeout(() => {
      fitView({ ...CANVAS_VIEW_SETTINGS, ...fitViewOptions });
    }, 400);
  }, [fitView, fitViewOptions]);

  useLayoutEffect(() => {
    const effectiveRoom = roomName || fileId;
    if (!effectiveRoom || !user?.id) return;
    // create or reuse session
    provider.getOrCreateSession({
      roomName: effectiveRoom,
      userId: user.id,
      userName: user.name,
      get: useFlowStore.getState,
      set: useFlowStore.setState,
    });
    onFitView();
    return () => {
      if (effectiveRoom) provider.destroyRoom(effectiveRoom);
    };
  }, [fileId, roomName, user?.id, user?.name, provider, onFitView]);

  return provider;
};

// Export a singleton instance of the service
export const hocusPocusServiceSingleton = new HocusPocusCollaborationService();
export default hocusPocusServiceSingleton;
