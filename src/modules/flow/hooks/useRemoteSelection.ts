import { useMemo } from "react";

import { useCollaborativeStore } from "@/store";
import type { CollaborativeUser } from "@/store/slices/collaborativeSlice";

interface RemoteUserInfo {
  name: string;
  color: string;
}

export interface UseRemoteSelectionResult {
  isRemoteSelected: boolean;
  remoteSelectionColor?: string;
  remoteUsers: RemoteUserInfo[];
}

// Custom equality function that only compares selections
const selectUserSelections = (state: { collaborativeUsers: CollaborativeUser[] }) => {
  return state.collaborativeUsers.map((user) => ({
    clientId: user.clientId,
    userName: user.userName,
    color: user.color,
    selection: user.selection ? Array.from(user.selection) : [],
  }));
};

// Deep equality for the selection arrays
const areSelectionsEqual = (a: ReturnType<typeof selectUserSelections>, b: ReturnType<typeof selectUserSelections>) => {
  if (a.length !== b.length) return false;

  return a.every((userA, index) => {
    const userB = b[index];
    if (userA.clientId !== userB.clientId) return false;
    if (userA.selection.length !== userB.selection.length) return false;
    return userA.selection.every((id, i) => id === userB.selection[i]);
  });
};

export function useRemoteSelection(nodeId: string): UseRemoteSelectionResult {
  const userSelections = useCollaborativeStore(selectUserSelections, areSelectionsEqual);

  return useMemo(() => {
    if (!userSelections?.length) {
      return { isRemoteSelected: false, remoteSelectionColor: undefined, remoteUsers: [] };
    }
    const selecting = userSelections.filter((u) => u.selection.includes(nodeId));
    if (!selecting.length) {
      return { isRemoteSelected: false, remoteSelectionColor: undefined, remoteUsers: [] };
    }
    return {
      isRemoteSelected: true,
      remoteSelectionColor: selecting[0].color,
      remoteUsers: selecting.map((u) => ({ name: u.userName || "Anonymous", color: u.color })),
    };
  }, [userSelections, nodeId]);
}

export default useRemoteSelection;
