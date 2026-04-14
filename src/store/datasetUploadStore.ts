import { create } from "zustand";
import { devtools } from "zustand/middleware";

import { DatasetResponse } from "@/modules/flow/types";

type UploadStatus = "uploading" | "completed" | "error";
type DatasetUpload = {
  id: string;
  name: string;
  status: UploadStatus;
  autoConnect?: boolean;
  onRetry?: () => void;
};

type DatasetUploadStore = {
  uploads: DatasetUpload[];
  addUpload: (upload: Omit<DatasetUpload, "status">) => void;
  updateUpload: (
    id: string,
    status: UploadStatus,
    options?: {
      dataset?: Pick<DatasetResponse, "activeVersionId">;
      error?: string;
      onRetry?: () => void;
    }
  ) => void;
  error: string;
  completed: boolean;
  dismissError: () => void;
};

const CLEAR_DELAY = 5000;

const useDatasetUploadStore = create<DatasetUploadStore>()(
  devtools(
    (set) => {
      const scheduleCleanup = (fn: () => void) => {
        setTimeout(fn, CLEAR_DELAY);
      };

      return {
        uploads: [],
        error: "",
        completed: false,

        addUpload: (upload) => {
          set((state) => {
            const uploads = state.uploads.filter((ups) => ["completed", "error"].includes(ups.status));
            return { uploads: [...uploads, { ...upload, status: "uploading" }] };
          });
        },

        updateUpload: (id, status, options) => {
          set((state) => ({
            uploads: state.uploads.map((upload) => (upload.id === id ? { ...upload, status, onRetry: options?.onRetry || upload.onRetry } : upload)),
          }));

          if (status === "completed") {
            set({ completed: true });

            scheduleCleanup(() => {
              set((state) => ({
                uploads: state.uploads.filter((upload) => upload.id !== id),
                completed: false,
              }));
            });
          }

          if (status === "error") {
            set({ error: options?.error || "Error uploading dataset" });

            scheduleCleanup(() => {
              set({ error: "" });
              set((state) => ({
                uploads: state.uploads.filter((upload) => upload.status !== "error"),
              }));
            });
          }
        },

        dismissError: () => {
          set({ error: "" });
          set((state) => ({
            uploads: state.uploads.filter((upload) => upload.status !== "error"),
          }));
        },
      };
    },
    { enabled: import.meta.env.DEV, name: "DatasetUploadStore" }
  )
);

export default useDatasetUploadStore;
