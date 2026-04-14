import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface WorkspaceStore {
  viewMode: "CardView" | "ListView";
  loading: boolean;
  lastCreatedId: string | null;
  setViewMode: (value: "ListView" | "CardView") => void;
  setLastCreatedId: (id: string | null) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  devtools(
    (set) => ({
      workspace: [],
      archived: [],
      viewMode: "CardView",
      loading: true,
      lastCreatedId: null,
      setViewMode: (value) => {
        set(() => ({ viewMode: value }));
      },
      setLastCreatedId: (id) => {
        set(() => ({ lastCreatedId: id }));

        if (id) {
          // scroll to top
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      },
    }),
    { enabled: import.meta.env.DEV, name: "WorkspaceStore" }
  )
);
